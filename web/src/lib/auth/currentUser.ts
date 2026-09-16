import { readSession } from "@/lib/auth/session";
import { getUserById, type User } from "@/lib/auth/users";

/**
 * The signed-in account, or null.
 *
 * This lives apart from users.ts because it is the one function there that
 * needed the request: reading the session reaches for `next/headers`, which
 * only resolves inside the Next runtime, so importing it dragged the whole
 * request context into every module that wanted to read a row. Keeping the
 * query layer free of it is what lets the store be tested against a database
 * without a server in front of it.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  return getUserById(session.sub);
}
