/**
 * Privacy Filter Middleware
 *
 * Strips owner PII (ownerId, owner details) from product responses
 * for non-admin requests. This is a BACKEND enforcement — not just a UI hide.
 *
 * Called after authMiddleware on public product routes.
 * If req.user.role === 'admin', full data is passed through.
 */
const privacyFilter = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    // Only strip for non-admin users (or unauthenticated)
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && data && data.success) {
      stripOwnerFields(data.data);
    }
    return originalJson(data);
  };

  next();
};

/**
 * Recursively strips ownerId from product objects/arrays
 */
function stripOwnerFields(data) {
  if (!data) return;

  if (Array.isArray(data)) {
    data.forEach(stripOwnerFields);
  } else if (typeof data === 'object') {
    // Strip from product-like objects
    if ('ownerId' in data) delete data.ownerId;
    if ('ownerPhone' in data) delete data.ownerPhone;
    if ('ownerEmail' in data) delete data.ownerEmail;
    if ('ownerName' in data) delete data.ownerName;

    // Handle nested product in response
    if (data.product) stripOwnerFields(data.product);
    if (data.products) stripOwnerFields(data.products);
  }
}

module.exports = privacyFilter;
