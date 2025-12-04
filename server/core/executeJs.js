const { exec } = require("child_process");

const executeJs = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    // Command: node "file.js" < "input.txt"
    const command = `node "${filepath}" < "${inputPath}"`;

    // ADD TIMEOUT: 2000ms
    exec(command, { timeout: 2000 }, (error, stdout, stderr) => {
      if (error && error.killed) {
        reject("Time Limit Exceeded (2s)");
        return;
      }

      // 2. Check for execution errors (e.g., process killed, timeout)
      if (error) {
        reject(error.message);
        return;
      }

      resolve(stdout);
    });
  });
};

module.exports = {
  executeJs,
};