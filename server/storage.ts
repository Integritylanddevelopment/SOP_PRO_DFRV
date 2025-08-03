import { 
  companies, users, handbookSections, userSignatures, sops, sopExecutions, 
  sopStepCompletions, tasks, incidents, notifications,
  type Company, type InsertCompany,
  type User, type InsertUser,
  type HandbookSection, type InsertHandbookSection,
  type UserSignature, type InsertUserSignature,
  type Sop, type InsertSop,
  type SopExecution, type InsertSopExecution,
  type SopStepCompletion, type InsertSopStepCompletion,
  type Task, type InsertTask,
  type Incident, type InsertIncident,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyBySlug(slug: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  getPendingUsers(companyId: string): Promise<User[]>;

  // Handbook Sections
  getHandbookSections(companyId: string): Promise<HandbookSection[]>;
  getHandbookSection(id: string): Promise<HandbookSection | undefined>;
  createHandbookSection(section: InsertHandbookSection): Promise<HandbookSection>;
  
  // User Signatures
  getUserSignatures(userId: string): Promise<UserSignature[]>;
  createUserSignature(signature: InsertUserSignature): Promise<UserSignature>;
  getUserSignatureForSection(userId: string, sectionId: string): Promise<UserSignature | undefined>;

  // SOPs
  getSops(companyId: string): Promise<Sop[]>;
  getSop(id: string): Promise<Sop | undefined>;
  createSop(sop: InsertSop): Promise<Sop>;

  // SOP Executions
  getSopExecution(id: string): Promise<SopExecution | undefined>;
  createSopExecution(execution: InsertSopExecution): Promise<SopExecution>;
  updateSopExecution(id: string, updates: Partial<SopExecution>): Promise<SopExecution>;
  getUserSopExecutions(userId: string): Promise<SopExecution[]>;

  // SOP Step Completions
  getSopStepCompletions(executionId: string): Promise<SopStepCompletion[]>;
  createSopStepCompletion(completion: InsertSopStepCompletion): Promise<SopStepCompletion>;
  updateSopStepCompletion(id: string, updates: Partial<SopStepCompletion>): Promise<SopStepCompletion>;

  // Tasks
  getTasks(companyId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  getUserTasks(userId: string): Promise<Task[]>;

  // Incidents
  getIncidents(companyId: string): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident>;

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification>;
}

export class DatabaseStorage implements IStorage {
  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.slug, slug));
    return company || undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.companyId, companyId)).orderBy(asc(users.firstName));
  }

  async getPendingUsers(companyId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.companyId, companyId), eq(users.status, "pending")))
      .orderBy(desc(users.createdAt));
  }

  // Handbook Sections
  async getHandbookSections(companyId: string): Promise<HandbookSection[]> {
    return await db
      .select()
      .from(handbookSections)
      .where(and(eq(handbookSections.companyId, companyId), eq(handbookSections.isActive, true)))
      .orderBy(asc(handbookSections.sectionNumber));
  }

  async getHandbookSection(id: string): Promise<HandbookSection | undefined> {
    const [section] = await db.select().from(handbookSections).where(eq(handbookSections.id, id));
    return section || undefined;
  }

  async createHandbookSection(section: InsertHandbookSection): Promise<HandbookSection> {
    const [newSection] = await db.insert(handbookSections).values(section).returning();
    return newSection;
  }

  // User Signatures
  async getUserSignatures(userId: string): Promise<UserSignature[]> {
    return await db.select().from(userSignatures).where(eq(userSignatures.userId, userId));
  }

  async createUserSignature(signature: InsertUserSignature): Promise<UserSignature> {
    const [newSignature] = await db.insert(userSignatures).values(signature).returning();
    return newSignature;
  }

  async getUserSignatureForSection(userId: string, sectionId: string): Promise<UserSignature | undefined> {
    const [signature] = await db
      .select()
      .from(userSignatures)
      .where(and(eq(userSignatures.userId, userId), eq(userSignatures.handbookSectionId, sectionId)));
    return signature || undefined;
  }

  // SOPs
  async getSops(companyId: string): Promise<Sop[]> {
    return await db
      .select()
      .from(sops)
      .where(and(eq(sops.companyId, companyId), eq(sops.isActive, true)))
      .orderBy(asc(sops.title));
  }

  async getSop(id: string): Promise<Sop | undefined> {
    const [sop] = await db.select().from(sops).where(eq(sops.id, id));
    return sop || undefined;
  }

  async createSop(sop: InsertSop): Promise<Sop> {
    const [newSop] = await db.insert(sops).values(sop).returning();
    return newSop;
  }

  // SOP Executions
  async getSopExecution(id: string): Promise<SopExecution | undefined> {
    const [execution] = await db.select().from(sopExecutions).where(eq(sopExecutions.id, id));
    return execution || undefined;
  }

  async createSopExecution(execution: InsertSopExecution): Promise<SopExecution> {
    const [newExecution] = await db.insert(sopExecutions).values(execution).returning();
    return newExecution;
  }

  async updateSopExecution(id: string, updates: Partial<SopExecution>): Promise<SopExecution> {
    const [updatedExecution] = await db
      .update(sopExecutions)
      .set(updates)
      .where(eq(sopExecutions.id, id))
      .returning();
    return updatedExecution;
  }

  async getUserSopExecutions(userId: string): Promise<SopExecution[]> {
    return await db
      .select()
      .from(sopExecutions)
      .where(eq(sopExecutions.userId, userId))
      .orderBy(desc(sopExecutions.startedAt));
  }

  // SOP Step Completions
  async getSopStepCompletions(executionId: string): Promise<SopStepCompletion[]> {
    return await db
      .select()
      .from(sopStepCompletions)
      .where(eq(sopStepCompletions.sopExecutionId, executionId));
  }

  async createSopStepCompletion(completion: InsertSopStepCompletion): Promise<SopStepCompletion> {
    const [newCompletion] = await db.insert(sopStepCompletions).values(completion).returning();
    return newCompletion;
  }

  async updateSopStepCompletion(id: string, updates: Partial<SopStepCompletion>): Promise<SopStepCompletion> {
    const [updatedCompletion] = await db
      .update(sopStepCompletions)
      .set(updates)
      .where(eq(sopStepCompletions.id, id))
      .returning();
    return updatedCompletion;
  }

  // Tasks
  async getTasks(companyId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.companyId, companyId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  // Incidents
  async getIncidents(companyId: string): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.companyId, companyId))
      .orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident || undefined;
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    return newIncident;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    const [updatedIncident] = await db
      .update(incidents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return updatedIncident;
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }
}

export const storage = new DatabaseStorage();
