const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Use process.cwd() which is safer in Docker
// In Docker, WORKDIR is /app, so this resolves to /app/outputs
const outputPath = path.join(process.cwd(), "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}
const executeCpp = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}" < "${inputPath}"`;

    // ADD TIMEOUT: 2000ms (2 seconds)
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // 1. Handle Timeout (Process Killed)
      if (error && error.killed) {
        reject("Time Limit Exceeded");
        return;
      }

      // 2. Handle Compilation/Runtime Errors
      if (error || stderr) {
        reject(stderr || error.message);
        return;
      }

      resolve(stdout);
    });
  });
};

module.exports = { executeCpp };