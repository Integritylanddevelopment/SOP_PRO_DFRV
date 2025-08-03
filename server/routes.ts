import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertHandbookSectionSchema, insertUserSignatureSchema,
  insertSopSchema, insertSopExecutionSchema, insertSopStepCompletionSchema,
  insertTaskSchema, insertIncidentSchema, insertNotificationSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectStorageService } from "./objectStorage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based middleware
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create notification for managers
      const managers = await storage.getUsersByCompany(user.companyId);
      const companyManagers = managers.filter(u => u.role === 'manager' || u.role === 'owner');
      
      for (const manager of companyManagers) {
        await storage.createNotification({
          userId: manager.id,
          title: "New Employee Registration",
          message: `${user.firstName} ${user.lastName} has registered and needs approval`,
          type: "info",
          relatedEntityType: "user",
          relatedEntityId: user.id,
        });
      }

      res.status(201).json({ 
        message: "Registration successful. Awaiting manager approval.",
        userId: user.id 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== 'approved' && user.status !== 'active') {
        return res.status(401).json({ message: "Account pending approval" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ token, user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    res.json({ ...req.user, password: undefined });
  });

  // User management routes
  app.get("/api/users/pending", authenticateToken, requireRole(['manager', 'owner']), async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers(req.user.companyId);
      res.json(pendingUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post("/api/users/:id/approve", authenticateToken, requireRole(['manager', 'owner']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await storage.updateUser(id, {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      // Notify the approved user
      await storage.createNotification({
        userId: id,
        title: "Account Approved",
        message: "Your account has been approved. You can now access the employee handbook.",
        type: "success",
      });

      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post("/api/users/:id/reject", authenticateToken, requireRole(['manager', 'owner']), async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await storage.updateUser(id, {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });

      // Notify the rejected user
      await storage.createNotification({
        userId: id,
        title: "Account Rejected",
        message: "Your account registration has been rejected. Please contact management for more information.",
        type: "error",
      });

      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // Handbook routes
  app.get("/api/handbook/sections", authenticateToken, async (req, res) => {
    try {
      const sections = await storage.getHandbookSections(req.user.companyId);
      
      // Get user signatures for these sections
      const userSignatures = await storage.getUserSignatures(req.user.id);
      const signatureMap = new Map(userSignatures.map(sig => [sig.handbookSectionId, sig]));
      
      const sectionsWithSignatures = sections.map(section => ({
        ...section,
        signed: signatureMap.has(section.id),
        signedAt: signatureMap.get(section.id)?.signedAt,
      }));

      res.json(sectionsWithSignatures);
    } catch (error) {
      console.error("Error fetching handbook sections:", error);
      res.status(500).json({ message: "Failed to fetch handbook sections" });
    }
  });

  app.post("/api/handbook/sections/:id/sign", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { signatureData } = req.body;

      // Check if already signed
      const existingSignature = await storage.getUserSignatureForSection(req.user.id, id);
      if (existingSignature) {
        return res.status(400).json({ message: "Section already signed" });
      }

      const signature = await storage.createUserSignature({
        userId: req.user.id,
        handbookSectionId: id,
        signatureData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(signature);
    } catch (error) {
      console.error("Error signing section:", error);
      res.status(500).json({ message: "Failed to sign section" });
    }
  });

  // SOP routes
  app.get("/api/sops", authenticateToken, async (req, res) => {
    try {
      const sops = await storage.getSops(req.user.companyId);
      res.json(sops);
    } catch (error) {
      console.error("Error fetching SOPs:", error);
      res.status(500).json({ message: "Failed to fetch SOPs" });
    }
  });

  app.post("/api/sops/:id/execute", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const execution = await storage.createSopExecution({
        sopId: id,
        userId: req.user.id,
      });
      res.json(execution);
    } catch (error) {
      console.error("Error starting SOP execution:", error);
      res.status(500).json({ message: "Failed to start SOP execution" });
    }
  });

  app.get("/api/sop-executions/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const execution = await storage.getSopExecution(id);
      if (!execution) {
        return res.status(404).json({ message: "SOP execution not found" });
      }

      const stepCompletions = await storage.getSopStepCompletions(id);
      res.json({ ...execution, stepCompletions });
    } catch (error) {
      console.error("Error fetching SOP execution:", error);
      res.status(500).json({ message: "Failed to fetch SOP execution" });
    }
  });

  app.post("/api/sop-executions/:id/steps", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const stepData = req.body;

      const completion = await storage.createSopStepCompletion({
        sopExecutionId: id,
        stepId: stepData.stepId,
        completed: stepData.completed,
        notes: stepData.notes,
        mediaUrls: stepData.mediaUrls,
        completedAt: stepData.completed ? new Date() : undefined,
      });

      res.json(completion);
    } catch (error) {
      console.error("Error updating SOP step:", error);
      res.status(500).json({ message: "Failed to update SOP step" });
    }
  });

  app.patch("/api/sop-executions/:id/complete", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const execution = await storage.updateSopExecution(id, {
        status: 'completed',
        completedAt: new Date(),
        notes,
      });

      res.json(execution);
    } catch (error) {
      console.error("Error completing SOP execution:", error);
      res.status(500).json({ message: "Failed to complete SOP execution" });
    }
  });

  // Task routes
  app.get("/api/tasks", authenticateToken, async (req, res) => {
    try {
      let tasks;
      if (req.user.role === 'employee') {
        tasks = await storage.getUserTasks(req.user.id);
      } else {
        tasks = await storage.getTasks(req.user.companyId);
      }
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", authenticateToken, requireRole(['manager', 'owner']), async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        companyId: req.user.companyId,
        assignedBy: req.user.id,
      });

      const task = await storage.createTask(taskData);

      // Notify the assigned user
      await storage.createNotification({
        userId: taskData.assignedTo,
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${task.title}`,
        type: "info",
        relatedEntityType: "task",
        relatedEntityId: task.id,
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // If marking as completed, add timestamp
      if (updates.status === 'completed') {
        updates.completedAt = new Date();
      }

      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Incident routes
  app.get("/api/incidents", authenticateToken, async (req, res) => {
    try {
      const incidents = await storage.getIncidents(req.user.companyId);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post("/api/incidents", authenticateToken, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse({
        ...req.body,
        companyId: req.user.companyId,
        reportedBy: req.user.id,
      });

      const incident = await storage.createIncident(incidentData);

      // Notify managers and owners
      const users = await storage.getUsersByCompany(req.user.companyId);
      const managers = users.filter(u => u.role === 'manager' || u.role === 'owner');
      
      for (const manager of managers) {
        await storage.createNotification({
          userId: manager.id,
          title: "New Incident Reported",
          message: `${incident.title} - ${incident.severity} severity`,
          type: "warning",
          relatedEntityType: "incident",
          relatedEntityId: incident.id,
        });
      }

      res.json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Object storage routes
  app.post("/api/objects/upload", authenticateToken, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.put("/api/media", authenticateToken, async (req, res) => {
    try {
      const { mediaURL } = req.body;
      
      if (!mediaURL) {
        return res.status(400).json({ error: "mediaURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        mediaURL,
        {
          owner: req.user.id,
          visibility: "private",
        }
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting media ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics routes for dashboards
  app.get("/api/stats", authenticateToken, requireRole(['manager', 'owner']), async (req, res) => {
    try {
      const users = await storage.getUsersByCompany(req.user.companyId);
      const pendingUsers = await storage.getPendingUsers(req.user.companyId);
      const tasks = await storage.getTasks(req.user.companyId);
      const incidents = await storage.getIncidents(req.user.companyId);

      const stats = {
        totalEmployees: users.length,
        pendingApprovals: pendingUsers.length,
        activeEmployees: users.filter(u => u.status === 'approved' || u.status === 'active').length,
        openTasks: tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
        activeIncidents: incidents.filter(i => i.status === 'open' || i.status === 'under_review').length,
        complianceRate: 94, // This would be calculated based on handbook signatures
        trainingProgress: 87, // This would be calculated based on completed sections
        systemHealth: 99.9,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
