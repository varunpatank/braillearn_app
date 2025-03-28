import { 
  integer, 
  varchar, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean,
  numeric,
  json,
  primaryKey
} from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  totalWaste: numeric("total_waste", { precision: 10, scale: 2 }).notNull().default('0'),
  totalReports: integer("total_reports").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const WasteLocations = pgTable("waste_locations", {
  id: serial("id").primaryKey(),
  latitude: numeric("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 6 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  wasteType: varchar("waste_type", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  points: integer("points").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  assignedTo: integer("assigned_to").references(() => Users.id),
  completedBy: integer("completed_by").references(() => Users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Impact = pgTable("impact", {
  id: serial("id").primaryKey(),
  totalPoints: integer("total_points").notNull().default(0),
  totalWaste: numeric("total_waste", { precision: 10, scale: 2 }).notNull().default(0),
  wasteTypes: json("waste_types").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  points: integer("points").notNull(),
  level: integer("level").notNull().default(1),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  collectionInfo: text("collection_info").notNull(),
  website: varchar("website", { length: 255 }),
  code: varchar("code", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type User = typeof Users.$inferSelect;
export type NewUser = typeof Users.$inferInsert;

export type Reward = typeof Rewards.$inferSelect;
export type NewReward = typeof Rewards.$inferInsert;

export type Transaction = typeof Transactions.$inferSelect;
export type NewTransaction = typeof Transactions.$inferInsert;

export type Notification = typeof Notifications.$inferSelect;
export type NewNotification = typeof Notifications.$inferInsert;

export type WasteLocation = typeof WasteLocations.$inferSelect;
export type NewWasteLocation = typeof WasteLocations.$inferInsert;

export type Impact = typeof Impact.$inferSelect;
export type NewImpact = typeof Impact.$inferInsert;

// In-memory report type
export type Report = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  createdAt: string;
  latitude: number;
  longitude: number;
};