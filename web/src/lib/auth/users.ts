import bcrypt from "bcryptjs";
import { execute, queryOne } from "@/lib/auth/db";

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
  const passwordHash = await bcrypt.hash(input.password, 11);
  const id = generateId();
  const now = Date.now();
  // Checking for the address and then inserting it leaves a gap two concurrent
  // signups can both pass through. The UNIQUE index is the thing that actually
  // decides, so let it: ON CONFLICT means the loser of that race writes
  // nothing and gets the same message as anyone else who is already
  // registered, rather than a 500 from a constraint violation.
  const inserted = await execute(
    `INSERT INTO users (id, email, password_hash, display_name, created_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    [id, email, passwordHash, input.displayName ?? null, now],
  );
  if (inserted === 0) {
    throw new AuthError("An account with this email already exists.");
  }
  return { id, email, displayName: input.displayName ?? null, createdAt: now };
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User> {
  const normalized = normalizeEmail(email);
  const row = await queryOne<UserRow>("SELECT * FROM users WHERE email = $1", [normalized]);
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

export async function getUserById(id: string): Promise<User | null> {
  const row = await queryOne<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return row ? rowToUser(row) : null;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
