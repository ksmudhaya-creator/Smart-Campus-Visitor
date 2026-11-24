const generateVisitorId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `SCV-${year}${month}${day}-${randomSuffix}`;
};

const generateLogId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `LOG-${timestamp}-${randomSuffix}`;
};

module.exports = {
  generateVisitorId,
  generateLogId
};
