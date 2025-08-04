import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table for white-label support
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  settings: jsonb("settings").$type<{
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customBranding?: Record<string, any>;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table with role-based access
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  ssn: text("ssn"), // Encrypted
  dateOfBirth: timestamp("date_of_birth"),
  position: text("position"),
  role: text("role").$type<"employee" | "manager" | "owner">().notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected" | "active" | "inactive">().default("pending").notNull(),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Handbook sections
export const handbookSections = pgTable("handbook_sections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sectionNumber: integer("section_number").notNull(),
  requiresSignature: boolean("requires_signature").default(true).notNull(),
  category: text("category"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User signatures for handbook sections
export const userSignatures = pgTable("user_signatures", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  handbookSectionId: uuid("handbook_section_id").references(() => handbookSections.id).notNull(),
  signatureData: text("signature_data").notNull(), // Base64 signature image
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

// Standard Operating Procedures
export const sops = pgTable("sops", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  priority: text("priority").$type<"low" | "normal" | "high" | "urgent">().default("normal").notNull(),
  steps: jsonb("steps").$type<Array<{
    id: string;
    title: string;
    description?: string;
    required: boolean;
    mediaRequired?: boolean;
  }>>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SOP executions/instances
export const sopExecutions = pgTable("sop_executions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sopId: uuid("sop_id").references(() => sops.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: text("status").$type<"in_progress" | "completed" | "escalated">().default("in_progress").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

// SOP step completions
export const sopStepCompletions = pgTable("sop_step_completions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sopExecutionId: uuid("sop_execution_id").references(() => sopExecutions.id).notNull(),
  stepId: text("step_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  notes: text("notes"),
  mediaUrls: jsonb("media_urls").$type<string[]>(),
  completedAt: timestamp("completed_at"),
});

// Tasks assigned by managers
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedBy: uuid("assigned_by").references(() => users.id).notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id).notNull(),
  priority: text("priority").$type<"low" | "normal" | "high" | "urgent">().default("normal").notNull(),
  status: text("status").$type<"pending" | "in_progress" | "completed" | "cancelled">().default("pending").notNull(),
  dueDate: timestamp("due_date"),
  estimatedHours: integer("estimated_hours"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Incidents and reports
export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  reportedBy: uuid("reported_by").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium").notNull(),
  status: text("status").$type<"open" | "under_review" | "resolved" | "closed">().default("open").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>(),
  witnessInfo: jsonb("witness_info").$type<Array<{
    name: string;
    phone?: string;
    statement?: string;
    recordingUrl?: string;
  }>>(),
  location: text("location"),
  incidentDate: timestamp("incident_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").$type<"info" | "success" | "warning" | "error">().default("info").notNull(),
  read: boolean("read").default(false).notNull(),
  relatedEntityType: text("related_entity_type"), // 'user', 'task', 'incident', etc.
  relatedEntityId: uuid("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  handbookSections: many(handbookSections),
  sops: many(sops),
  tasks: many(tasks),
  incidents: many(incidents),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  approver: one(users, {
    fields: [users.approvedBy],
    references: [users.id],
    relationName: "approver",
  }),
  signatures: many(userSignatures),
  sopExecutions: many(sopExecutions),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  incidents: many(incidents),
  notifications: many(notifications),
}));

export const handbookSectionsRelations = relations(handbookSections, ({ one, many }) => ({
  company: one(companies, {
    fields: [handbookSections.companyId],
    references: [companies.id],
  }),
  signatures: many(userSignatures),
}));

export const userSignaturesRelations = relations(userSignatures, ({ one }) => ({
  user: one(users, {
    fields: [userSignatures.userId],
    references: [users.id],
  }),
  handbookSection: one(handbookSections, {
    fields: [userSignatures.handbookSectionId],
    references: [handbookSections.id],
  }),
}));

export const sopsRelations = relations(sops, ({ one, many }) => ({
  company: one(companies, {
    fields: [sops.companyId],
    references: [companies.id],
  }),
  executions: many(sopExecutions),
}));

export const sopExecutionsRelations = relations(sopExecutions, ({ one, many }) => ({
  sop: one(sops, {
    fields: [sopExecutions.sopId],
    references: [sops.id],
  }),
  user: one(users, {
    fields: [sopExecutions.userId],
    references: [users.id],
  }),
  stepCompletions: many(sopStepCompletions),
}));

export const sopStepCompletionsRelations = relations(sopStepCompletions, ({ one }) => ({
  sopExecution: one(sopExecutions, {
    fields: [sopStepCompletions.sopExecutionId],
    references: [sopExecutions.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  assignedByUser: one(users, {
    fields: [tasks.assignedBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
  assignedToUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks",
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  company: one(companies, {
    fields: [incidents.companyId],
    references: [companies.id],
  }),
  reporter: one(users, {
    fields: [incidents.reportedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// AI Interactions and Cross-Role Communication
export const aiInteractions = pgTable("ai_interactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  userRole: text("user_role").$type<"employee" | "manager" | "owner">().notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  actionType: text("action_type").$type<"dashboard_reorganize" | "create_task" | "create_message" | "implement_feature" | "gather_info" | "none">(),
  actionData: jsonb("action_data").$type<{
    targetRole?: "employee" | "manager" | "owner";
    targetUserId?: string;
    taskDetails?: any;
    featureDetails?: any;
    dashboardChanges?: any;
  }>(),
  status: text("status").$type<"pending" | "completed" | "failed">().default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dynamic Dashboard Configurations
export const dashboardConfigs = pgTable("dashboard_configs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  userRole: text("user_role").$type<"employee" | "manager" | "owner">().notNull(),
  layout: jsonb("layout").$type<{
    widgets: Array<{
      id: string;
      type: string;
      position: { x: number; y: number; w: number; h: number };
      config: any;
    }>;
    theme?: string;
    customizations?: any;
  }>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: text("created_by").$type<"user" | "ai">().default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI-Generated Features
export const aiFeatures = pgTable("ai_features", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdByRole: text("created_by_role").$type<"manager" | "owner">().notNull(),
  targetRole: text("target_role").$type<"employee" | "manager" | "owner">().notNull(),
  featureName: text("feature_name").notNull(),
  featureType: text("feature_type").$type<"component" | "page" | "workflow" | "automation" | "integration">().notNull(),
  description: text("description").notNull(),
  implementation: jsonb("implementation").$type<{
    code?: string;
    config?: any;
    dependencies?: string[];
    routes?: any[];
  }>().notNull(),
  status: text("status").$type<"pending" | "implementing" | "active" | "failed">().default("pending").notNull(),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cross-Role Messages (AI-generated)  
export const crossRoleMessages = pgTable("cross_role_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
  fromRole: text("from_role").$type<"manager" | "owner">().notNull(),
  toRole: text("to_role").$type<"employee" | "manager" | "owner">().notNull(),
  toUserId: uuid("to_user_id").references(() => users.id),
  messageType: text("message_type").$type<"task_assignment" | "feature_notification" | "system_update" | "reminder" | "announcement">().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  actionRequired: boolean("action_required").default(false).notNull(),
  actionData: jsonb("action_data").$type<{
    taskId?: string;
    featureId?: string;
    dueDate?: string;
    priority?: string;
  }>(),
  isRead: boolean("is_read").default(false).notNull(),
  createdByAI: boolean("created_by_ai").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export const insertHandbookSectionSchema = createInsertSchema(handbookSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSignatureSchema = createInsertSchema(userSignatures).omit({
  id: true,
  signedAt: true,
});

export const insertSopSchema = createInsertSchema(sops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSopExecutionSchema = createInsertSchema(sopExecutions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertSopStepCompletionSchema = createInsertSchema(sopStepCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type HandbookSection = typeof handbookSections.$inferSelect;
export type InsertHandbookSection = z.infer<typeof insertHandbookSectionSchema>;

export type UserSignature = typeof userSignatures.$inferSelect;
export type InsertUserSignature = z.infer<typeof insertUserSignatureSchema>;

export type Sop = typeof sops.$inferSelect;
export type InsertSop = z.infer<typeof insertSopSchema>;

export type SopExecution = typeof sopExecutions.$inferSelect;
export type InsertSopExecution = z.infer<typeof insertSopExecutionSchema>;

export type SopStepCompletion = typeof sopStepCompletions.$inferSelect;
export type InsertSopStepCompletion = z.infer<typeof insertSopStepCompletionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// AI interaction schemas and types
export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardConfigSchema = createInsertSchema(dashboardConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiFeatureSchema = createInsertSchema(aiFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deployedAt: true,
});

export const insertCrossRoleMessageSchema = createInsertSchema(crossRoleMessages).omit({
  id: true,
  createdAt: true,
});

export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;

export type DashboardConfig = typeof dashboardConfigs.$inferSelect;
export type InsertDashboardConfig = z.infer<typeof insertDashboardConfigSchema>;

export type AiFeature = typeof aiFeatures.$inferSelect;
export type InsertAiFeature = z.infer<typeof insertAiFeatureSchema>;

export type CrossRoleMessage = typeof crossRoleMessages.$inferSelect;
export type InsertCrossRoleMessage = z.infer<typeof insertCrossRoleMessageSchema>;
