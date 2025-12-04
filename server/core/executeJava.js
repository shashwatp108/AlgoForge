const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Use process.cwd() which is safer in Docker
// In Docker, WORKDIR is /app, so this resolves to /app/outputs
const outputPath = path.join(process.cwd(), "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}
const executeJava = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outDir = path.join(outputPath, jobId); // Separate folder for class files
  
  if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    // 1. We must rename the file to Main.java for the template to work
    const mainJavaPath = path.join(outDir, "Main.java");
    
    // Copy the code to Main.java in a temp folder
    fs.copyFileSync(filepath, mainJavaPath);

    // Command: javac Main.java && java Main < input.txt
    const command = `cd "${outDir}" && javac Main.java && java Main < "${inputPath}"`;

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      // Cleanup (Optional)
      // fs.rmSync(outDir, { recursive: true, force: true });
      if (error && error.killed) {
        reject("Time Limit Exceeded");
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
  executeJava,
};