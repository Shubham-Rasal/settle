/**
 * Feature flags configuration
 * Set environment variables to enable/disable features
 */

export interface FeatureFlags {
  autoRebalancing: boolean;
  // Add more feature flags here as needed
}

export const getFeatureFlags = (): FeatureFlags => {
  return {
    // AUTO_REBALANCING feature flag - defaults to false (coming soon)
    autoRebalancing: process.env.NEXT_PUBLIC_ENABLE_AUTO_REBALANCING === 'true',
  };
};

export const useFeatureFlags = (): FeatureFlags => {
  return getFeatureFlags();
};