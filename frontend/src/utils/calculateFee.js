/**
 * Client-side fee preview (mirrors backend logic).
 * Used on checkout page to show fee estimate before API call.
 */
export const calculateFee = (rentalAmount, rule) => {
  if (!rule || !rule.isActive) return 0;
  if (rule.type === 'fixed') return rule.feeAmount;
  if (rule.type === 'percentage') return Math.round((rentalAmount * rule.percentage) / 100);
  if (rule.type === 'tiered') {
    const tier = (rule.tiers || []).find(
      (t) =>
        rentalAmount >= t.minAmount &&
        (t.maxAmount === null || rentalAmount <= t.maxAmount)
    );
    return tier ? tier.fee : 0;
  }
  return 0;
};
