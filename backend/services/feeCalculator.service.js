const FeeRule = require('../models/FeeRule.model');

/**
 * Fetches the active fee rule with the lowest priority number and
 * calculates the platform fee for a given rental amount.
 *
 * @param {number} rentalAmount
 * @returns {Promise<{ platformFee: number, rule: object|null }>}
 */
const calculatePlatformFee = async (rentalAmount) => {
  // Get the active rule with lowest priority
  const rule = await FeeRule.findOne({ isActive: true }).sort({ priority: 1 });

  if (!rule) {
    return { platformFee: 0, rule: null };
  }

  let platformFee = 0;

  if (rule.type === 'fixed') {
    platformFee = rule.feeAmount;
  } else if (rule.type === 'percentage') {
    platformFee = Math.round((rentalAmount * rule.percentage) / 100);
  } else if (rule.type === 'tiered') {
    const tier = rule.tiers.find(
      (t) =>
        rentalAmount >= t.minAmount &&
        (t.maxAmount === null || rentalAmount <= t.maxAmount)
    );
    platformFee = tier ? tier.fee : 0;
  }

  return { platformFee, rule };
};

module.exports = { calculatePlatformFee };
