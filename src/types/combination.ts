export interface SpellCombination {
  id: string;
  name: string;
  description: string;
  /** The two spell ids that trigger this reaction, in either order unless orderMatters is true. */
  spellIds: [string, string];
  orderMatters: boolean;
  /** Max ms between the two casts for the combo to trigger. */
  windowMs: number;
  particlePresetId: string;
  soundId: string;
  powerMultiplier: number;
  color: string;
}

export interface CombinationResult {
  combination: SpellCombination;
  isFirstDiscovery: boolean;
  power: number;
}
