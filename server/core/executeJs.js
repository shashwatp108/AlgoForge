const { exec } = require("child_process");

const executeJs = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    // Command: node "file.js" < "input.txt"
    const command = `node "${filepath}" < "${inputPath}"`;

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // 1. Check for runtime errors (stderr)
      if (stderr) {
        // Javascript often prints warnings to stderr too, so we need to be careful.
        // But for a code runner, usually stderr = bad.
        reject(stderr);
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