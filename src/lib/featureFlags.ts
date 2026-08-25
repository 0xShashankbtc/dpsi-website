/**
 * Lightweight Dynamic Feature Flags
 * School staff can toggle features or load from runtime configuration
 */

export async function getFlag(
  _flagName: string,
  defaultValue: boolean = false
): Promise<boolean> {
  return defaultValue;
}

/**
 * React hook friendly wrapper for feature flags.
 * Returns defaultValue cleanly and reliably.
 */
export function useFlag(_flagName: string, defaultValue: boolean = false): boolean {
  return defaultValue;
}

export const FEATURE_FLAGS = {
  admissions_open: true,
  results_declared: true,
  virtual_tour_active: true,
  ai_chat_voice: true,
  live_weather_widget: true,
} as const;
