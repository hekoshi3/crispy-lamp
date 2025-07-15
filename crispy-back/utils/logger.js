const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../data/moderation.log');

function logModeration(action, details) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${action}: ${details}\n`;
  // Print to console
  console.log(logLine.trim());
  // Append to file
  fs.appendFile(logFile, logLine, err => {
    if (err) console.error('Failed to write log:', err);
  });
}

module.exports = { logModeration }; 