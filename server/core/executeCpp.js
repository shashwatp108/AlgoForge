const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "../../outputs"); // Go up two levels

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    // Command: g++ code.cpp -o code.out && ./code.out < input.txt
    const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}" < "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = {
  executeCpp,
};