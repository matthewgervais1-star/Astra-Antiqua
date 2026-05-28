import bcrypt from "bcryptjs";
import { getDb } from "@/lib/auth/db";
import { readSession } from "@/lib/auth/session";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: number;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: number;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface CreateUserInput {
  email: string;
  password: string;
  displayName?: string;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    throw new AuthError("Please enter a valid email address.");
  }
  if (input.password.length < 8) {
    throw new AuthError("Password must be at least eight characters.");
  }
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    throw new AuthError("An account with this email already exists.");
  }
  const passwordHash = await bcrypt.hash(input.password, 11);
  const id = generateId();
  const now = Date.now();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, email, passwordHash, input.displayName ?? null, now);
  return { id, email, displayName: input.displayName ?? null, createdAt: now };
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User> {
  const normalized = normalizeEmail(email);
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalized) as UserRow | undefined;
  if (!row) {
    // Run a dummy hash to keep response time constant.
    await bcrypt.compare(password, "$2a$11$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY");
    throw new AuthError("Email or password is incorrect.");
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    throw new AuthError("Email or password is incorrect.");
  }
  return rowToUser(row);
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  return getUserById(session.sub);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
