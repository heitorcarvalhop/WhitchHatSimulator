/** Keyed by the version each step migrates *from*; when the schema changes, add `[N]: (data) => ({ ...transformed })` here. */
export type MigrationStep = (data: unknown) => unknown;

export const SETTINGS_MIGRATIONS: Record<number, MigrationStep> = {};
export const PROGRESS_MIGRATIONS: Record<number, MigrationStep> = {};
export const CUSTOM_SPELLS_MIGRATIONS: Record<number, MigrationStep> = {};

export function runMigrations(
  data: unknown,
  fromVersion: number,
  targetVersion: number,
  migrations: Record<number, MigrationStep>,
): unknown {
  let current = data;
  for (let v = fromVersion; v < targetVersion; v++) {
    const step = migrations[v];
    if (step) {
      current = step(current);
    }
  }
  return current;
}
