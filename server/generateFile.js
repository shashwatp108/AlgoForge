const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'runner_workspace', 'codes'); 

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}
// Map language names to extensions
const extensions = {
    "cpp": "cpp",
    "c": "c",
    "python": "py",
    "java": "java",
    "javascript": "js"
};

const generateFile = async (language, content) => {
    const jobId = uuid();
    const ext = extensions[language] || "txt"; // Default to txt if unknown
    const filename = `${jobId}.${ext}`;
    
    const filepath = path.join(dirCodes, filename);
    await fs.writeFileSync(filepath, content);
    return filepath;
};
module.exports = {
  generateFile,
};
