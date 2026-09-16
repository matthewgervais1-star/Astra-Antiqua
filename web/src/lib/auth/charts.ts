import { queryOne, query, transaction } from "@/lib/auth/db";
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
  is_primary: boolean;
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
    primary: row.is_primary,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listChartsForUser(userId: string): Promise<SavedChartInputs[]> {
  const rows = await query<ChartRow>(
    "SELECT * FROM charts WHERE user_id = $1 ORDER BY is_primary DESC, created_at ASC",
    [userId],
  );
  return rows.map(rowToInputs);
}

export async function getChartForUser(
  userId: string,
  chartId: string,
): Promise<SavedChartInputs | null> {
  const row = await queryOne<ChartRow>(
    "SELECT * FROM charts WHERE user_id = $1 AND id = $2",
    [userId, chartId],
  );
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

export async function upsertChartForUser(
  userId: string,
  args: UpsertChartArgs,
): Promise<SavedChartInputs> {
  const id = args.id ?? generateId();
  return transaction(async (client) => {
    // Read the existing row inside the transaction, not before it. Deciding
    // which chart is primary depends on what the others are, so the read and
    // the writes have to see the same snapshot.
    const existing = (
      await client.query<ChartRow>(
        "SELECT * FROM charts WHERE user_id = $1 AND id = $2 FOR UPDATE",
        [userId, id],
      )
    ).rows[0];
    const wantsPrimary = args.primary ?? existing?.is_primary ?? false;
    const createdAt = existing ? existing.created_at : Date.now();

    if (wantsPrimary) {
      await client.query(
        "UPDATE charts SET is_primary = FALSE WHERE user_id = $1 AND id <> $2",
        [userId, id],
      );
    }

    if (existing) {
      await client.query(
        `UPDATE charts SET
           name = $1,
           relationship = $2,
           date = $3,
           time = $4,
           city_label = $5,
           latitude = $6,
           longitude = $7,
           is_primary = $8
         WHERE user_id = $9 AND id = $10`,
        [
          args.name,
          args.relationship,
          args.date,
          args.time,
          args.cityLabel,
          args.latitude,
          args.longitude,
          wantsPrimary,
          userId,
          id,
        ],
      );
    } else {
      await client.query(
        `INSERT INTO charts (id, user_id, name, relationship, date, time, city_label, latitude, longitude, is_primary, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          userId,
          args.name,
          args.relationship,
          args.date,
          args.time,
          args.cityLabel,
          args.latitude,
          args.longitude,
          wantsPrimary,
          createdAt,
        ],
      );
    }

    // If no chart is primary at this point, make this one primary.
    const anyPrimary = (
      await client.query(
        "SELECT id FROM charts WHERE user_id = $1 AND is_primary LIMIT 1",
        [userId],
      )
    ).rows[0];
    if (!anyPrimary) {
      await client.query(
        "UPDATE charts SET is_primary = TRUE WHERE user_id = $1 AND id = $2",
        [userId, id],
      );
    }

    const row = (
      await client.query<ChartRow>(
        "SELECT * FROM charts WHERE user_id = $1 AND id = $2",
        [userId, id],
      )
    ).rows[0];
    if (!row) {
      // Unreachable: the row was written a few statements ago on this same
      // client, inside this same transaction. Saying so out loud beats casting
      // the type away and returning a chart built from undefined.
      throw new Error(`Chart ${id} vanished during its own write.`);
    }
    return rowToInputs(row);
  });
}

export async function deleteChartForUser(userId: string, chartId: string): Promise<boolean> {
  return transaction(async (client) => {
    const deleted = await client.query(
      "DELETE FROM charts WHERE user_id = $1 AND id = $2",
      [userId, chartId],
    );
    if ((deleted.rowCount ?? 0) === 0) return false;
    // Ensure at least one chart is primary if any remain.
    const anyPrimary = (
      await client.query(
        "SELECT id FROM charts WHERE user_id = $1 AND is_primary LIMIT 1",
        [userId],
      )
    ).rows[0];
    if (!anyPrimary) {
      const first = (
        await client.query<{ id: string }>(
          "SELECT id FROM charts WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1",
          [userId],
        )
      ).rows[0];
      if (first) {
        await client.query("UPDATE charts SET is_primary = TRUE WHERE id = $1", [first.id]);
      }
    }
    return true;
  });
}

export async function setPrimaryChartForUser(
  userId: string,
  chartId: string,
): Promise<boolean> {
  return transaction(async (client) => {
    const exists = (
      await client.query("SELECT 1 FROM charts WHERE user_id = $1 AND id = $2", [
        userId,
        chartId,
      ])
    ).rows[0];
    if (!exists) return false;
    await client.query("UPDATE charts SET is_primary = FALSE WHERE user_id = $1", [userId]);
    await client.query(
      "UPDATE charts SET is_primary = TRUE WHERE user_id = $1 AND id = $2",
      [userId, chartId],
    );
    return true;
  });
}
