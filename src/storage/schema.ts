export const CURRENT_SETTINGS_VERSION = 1;
export const CURRENT_PROGRESS_VERSION = 1;
export const CURRENT_CUSTOM_SPELLS_VERSION = 1;

export interface VersionedPayload<T> {
  version: number;
  payload: T;
}
