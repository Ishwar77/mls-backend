/**
 * Custom error logger
 * @ref: https://github.com/winstonjs/winston#usage
 */

const winston = require("winston");

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: [
    // - Write all logs into console screen, this sould be disabled in production    
    new winston.transports.Console(),

    // - Write all logs error (and below) to `error.log`.
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

    // - Write to all logs with level `info` and below to `combined.log` 
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

/* //
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
} */

module.exports = logger;