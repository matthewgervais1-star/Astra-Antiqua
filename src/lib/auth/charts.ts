import { getDb } from "@/lib/auth/db";
import type {
  ChartRelationship,
  SavedChartInputs,
} from "@/lib/savedCharts";

interface ChartRow {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  date: string;
  time: string;
  city_label: string;
  latitude: number;
  longitude: number;
  is_primary: number;
  created_at: number;
}

function rowToInputs(row: ChartRow): SavedChartInputs {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship as ChartRelationship,
    date: row.date,
    time: row.time,
    cityLabel: row.city_label,
    latitude: row.latitude,
    longitude: row.longitude,
    primary: row.is_primary === 1,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listChartsForUser(userId: string): SavedChartInputs[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM charts WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC",
    )
    .all(userId) as ChartRow[];
  return rows.map(rowToInputs);
}

export function getChartForUser(
  userId: string,
  chartId: string,
): SavedChartInputs | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM charts WHERE user_id = ? AND id = ?")
    .get(userId, chartId) as ChartRow | undefined;
  return row ? rowToInputs(row) : null;
}

export interface UpsertChartArgs {
  id?: string;
  name: string;
  relationship: ChartRelationship;
  date: string;
  time: string;
  cityLabel: string;
  latitude: number;
  longitude: number;
  primary?: boolean;
}

export function upsertChartForUser(
  userId: string,
  args: UpsertChartArgs,
): SavedChartInputs {
  const db = getDb();
  const id = args.id ?? generateId();
  const existing = db
    .prepare("SELECT * FROM charts WHERE user_id = ? AND id = ?")
    .get(userId, id) as ChartRow | undefined;
  const wantsPrimary =
    args.primary ?? (existing?.is_primary === 1 ? true : false);

  const createdAt = existing ? existing.created_at : Date.now();

  const tx = db.transaction(() => {
    if (wantsPrimary) {
      db.prepare(
        "UPDATE charts SET is_primary = 0 WHERE user_id = ? AND id != ?",
      ).run(userId, id);
    }
    if (existing) {
      db.prepare(
        `UPDATE charts SET
           name = ?,
           relationship = ?,
           date = ?,
           time = ?,
           city_label = ?,
           latitude = ?,
           longitude = ?,
           is_primary = ?
         WHERE user_id = ? AND id = ?`,
      ).run(
        args.name,
        args.relationship,
        args.date,
        args.time,
        args.cityLabel,
        args.latitude,
        args.longitude,
        wantsPrimary ? 1 : 0,
        userId,
        id,
      );
    } else {
      db.prepare(
        `INSERT INTO charts (id, user_id, name, relationship, date, time, city_label, latitude, longitude, is_primary, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        userId,
        args.name,
        args.relationship,
        args.date,
        args.time,
        args.cityLabel,
        args.latitude,
        args.longitude,
        wantsPrimary ? 1 : 0,
        createdAt,
      );
    }
    // If no chart is primary at this point, make this one primary.
    const anyPrimary = db
      .prepare("SELECT id FROM charts WHERE user_id = ? AND is_primary = 1 LIMIT 1")
      .get(userId);
    if (!anyPrimary) {
      db.prepare(
        "UPDATE charts SET is_primary = 1 WHERE user_id = ? AND id = ?",
      ).run(userId, id);
    }
  });
  tx();

  const row = db
    .prepare("SELECT * FROM charts WHERE user_id = ? AND id = ?")
    .get(userId, id) as ChartRow;
  return rowToInputs(row);
}

export function deleteChartForUser(userId: string, chartId: string): boolean {
  const db = getDb();
  const tx = db.transaction(() => {
    const info = db
      .prepare("DELETE FROM charts WHERE user_id = ? AND id = ?")
      .run(userId, chartId);
    if (info.changes === 0) return false;
    // Ensure at least one chart is primary if any remain.
    const anyPrimary = db
      .prepare("SELECT id FROM charts WHERE user_id = ? AND is_primary = 1 LIMIT 1")
      .get(userId);
    if (!anyPrimary) {
      const first = db
        .prepare("SELECT id FROM charts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1")
        .get(userId) as { id: string } | undefined;
      if (first) {
        db.prepare("UPDATE charts SET is_primary = 1 WHERE id = ?").run(first.id);
      }
    }
    return true;
  });
  return tx() ?? false;
}

export function setPrimaryChartForUser(userId: string, chartId: string): boolean {
  const db = getDb();
  const exists = db
    .prepare("SELECT 1 FROM charts WHERE user_id = ? AND id = ?")
    .get(userId, chartId);
  if (!exists) return false;
  const tx = db.transaction(() => {
    db.prepare("UPDATE charts SET is_primary = 0 WHERE user_id = ?").run(userId);
    db.prepare(
      "UPDATE charts SET is_primary = 1 WHERE user_id = ? AND id = ?",
    ).run(userId, chartId);
  });
  tx();
  return true;
}
