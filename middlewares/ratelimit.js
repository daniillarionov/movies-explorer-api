const RateLimit = require('express-rate-limit');

const apiLimiter = new RateLimit({
  windowMs: 15*60*1000,
  max: 100,
});

module.exports = apiLimiter;