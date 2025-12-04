const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const executePy = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  
  return new Promise((resolve, reject) => {
    // Command: python3 code.py < input.txt
    // Note: We use 'python3' (standard on Linux/Mac). On Windows it might be 'python'.
    const command = `python3 "${filepath}" < "${inputPath}"`;

    exec(command, { timeout: 2000 }, (error, stdout, stderr) => {
      if (error && error.killed) {
        reject("Time Limit Exceeded (2s)");
        return;
      }
      if (error || stderr) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = {
  executePy,
};