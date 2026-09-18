import { execute, queryOne } from "@/lib/auth/db";
import type { SavedChartInputs } from "@/lib/savedCharts";

/**
 * The reader's own chart, on the server.
 *
 * One row per account, enforced by a unique index on user_id rather than by
 * this code remembering to check. The server never holds a chart about anyone
 * but the account holder: comparing against a second party is computed in the
 * browser and never sent here. See src/lib/savedCharts.ts for why.
 *
 * Everything that used to live in this file, the primary-chart juggling and
 * the transactions that kept exactly one chart marked primary, went with the
 * list. With one chart there is no primary to elect.
 */

interface ChartRow {
  id: string;
  user_id: string;
  name: string;
  date: string;
  time: string;
  city_label: string;
  latitude: number;
  longitude: number;
  created_at: number;
}

function rowToInputs(row: ChartRow): SavedChartInputs {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    time: row.time,
    cityLabel: row.city_label,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getChartForUser(userId: string): Promise<SavedChartInputs | null> {
  const row = await queryOne<ChartRow>("SELECT * FROM charts WHERE user_id = $1", [userId]);
  return row ? rowToInputs(row) : null;
}

export interface SaveChartArgs {
  name: string;
  date: string;
  time: string;
  cityLabel: string;
  latitude: number;
  longitude: number;
}

/**
 * Records the account holder's chart, replacing any previous one.
 *
 * ON CONFLICT (user_id) is what makes "one chart per account" true rather
 * than intended. Two tabs saving at once leave one row either way.
 */
export async function saveChartForUser(
  userId: string,
  args: SaveChartArgs,
): Promise<SavedChartInputs> {
  const row = await queryOne<ChartRow>(
    `INSERT INTO charts (id, user_id, name, date, time, city_label, latitude, longitude, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id) DO UPDATE SET
       name = EXCLUDED.name,
       date = EXCLUDED.date,
       time = EXCLUDED.time,
       city_label = EXCLUDED.city_label,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude
     RETURNING *`,
    [
      generateId(),
      userId,
      args.name,
      args.date,
      args.time,
      args.cityLabel,
      args.latitude,
      args.longitude,
      Date.now(),
    ],
  );
  if (!row) {
    // Unreachable: RETURNING on an upsert always yields the row it wrote.
    throw new Error(`Chart for ${userId} vanished during its own write.`);
  }
  return rowToInputs(row);
}

/** Returns false when there was nothing to delete. */
export async function deleteChartForUser(userId: string): Promise<boolean> {
  const removed = await execute("DELETE FROM charts WHERE user_id = $1", [userId]);
  return removed > 0;
}
