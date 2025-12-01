const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
const codePath = path.join(__dirname, "codes");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Function to write the input to a file
const createInputFile = async (jobId, input) => {
    const fileName = `${jobId}.txt`;
    const inputFilepath = path.join(outputPath, fileName);
    await fs.writeFileSync(inputFilepath, input);
    return inputFilepath;
};

const executeCpp = async (filepath, input = "") => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);
  
  // 1. Create a file for the input (if input exists)
  // If no input is provided, we create an empty file to avoid errors
  const inputPath = await createInputFile(jobId, input);

  return new Promise((resolve, reject) => {
    // 2. The Systems Command
    // g++ compile... && ./binary < input.txt
    const command = `g++ "${filepath}" -o "${outPath}" && "${outPath}" < "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
      // Clean up inputs? (Optional: fs.unlinkSync(inputPath))

      if (error || stderr) {
        const rawError = stderr || error.message;
        const cleanError = rawError
            .replace(new RegExp(filepath, 'g'), "solution.cpp")
            .replace(new RegExp(codePath, 'g'), "");
        reject(cleanError);
        return;
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executeCpp,
};