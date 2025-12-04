const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { generateFile } = require("./generateFile");
const Job = require("./models/Job");
const Snippet = require("./models/Snippet");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { executeCpp } = require("./core/executeCpp");
const { executePy } = require("./core/executePy");
const { executeJava } = require("./core/executeJava");
const { executeC } = require("./core/executeC");
const { executeJs } = require("./core/executeJs");

dotenv.config();

// Ensure Passport config is loaded
require("./passport");

const app = express();

app.set("trust proxy", 1); // Trust Render's proxy (HTTPS)
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// --- HELPER FUNCTIONS ---

// Function to verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("A token is required");
  try {
    const bearer = token.split(" ")[1];
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

// Function to create Input File (This was missing!)
const createInputFile = async (jobId, input) => {
    const dirInputs = path.join(process.cwd(), "inputs");
    if (!fs.existsSync(dirInputs)) {
        fs.mkdirSync(dirInputs, { recursive: true });
    }
    const filename = `${jobId}.txt`;
    const filepath = path.join(dirInputs, filename);
    await fs.writeFileSync(filepath, input);
    return filepath;
};

// --- AUTH ROUTES ---

app.use(passport.initialize());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);

app.get("/auth/me", verifyToken, async (req, res) => {
  const User = require("./models/User");
  const user = await User.findById(req.user.id);
  res.json(user);
});

// --- EXECUTION ROUTES ---

app.post("/run", async (req, res) => {
  console.log("--> Request received for:", req.body.language); // Log 1
  const { language = "cpp", code, input } = req.body;

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  // 1. Check if user is logged in (Optional)
  let userId = null;
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (err) {
        console.log("Invalid token sent with submission");
    }
  }

  let job;
  try {
    // 2. Generate File
    const filepath = await generateFile(language, code);
    const jobName = path.basename(filepath).split(".")[0];
    
    // 3. Create Input File
    // If input is empty, we still create a file (empty string) to prevent errors
    const inputPath = await createInputFile(jobName, input || "");
    console.log("--> Files created:", filepath, inputPath); // Log 2

    // 4. Create Job Record
    job = await new Job({ language, filepath, code, userId }).save();

    // 5. Execute based on Language
    console.log("--> Executing..."); // Log 3
    let output;
    if (language === "cpp") {
        output = await executeCpp(filepath, inputPath);
    } else if (language === "python") {
        output = await executePy(filepath, inputPath);
    } else if (language === "java") {
        output = await executeJava(filepath, inputPath);
    } else if (language === "c") {
        output = await executeC(filepath, inputPath);
    } else if (language === "javascript") {
        console.log("--> Running JS runner"); // Log 4
        output = await executeJs(filepath, inputPath);
        console.log("--> JS Runner finished"); // Log 5
    } else {
        throw new Error("Unsupported Language");
    }

    // 6. Update Job with Success
    job.output = output;
    job.status = "success";
    await job.save();

    console.log("--> Success sending response"); // Log 6
    return res.json({ filepath, output, jobId: job._id });
  } catch (err) {
    console.error("--> CAUGHT ERROR:", err); // Log Error
    if (job) {
        job.output = err.toString();
        job.status = "error";
        await job.save();
    }
    console.error(err);
    res.status(500).json({ err: { stderr: err.toString() } });
  }
});

app.get("/jobs/history", verifyToken, async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user.id }).sort({ submittedAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SNIPPET ROUTES ---

app.post("/snippets", verifyToken, async (req, res) => {
    try {
        const { title, code, language } = req.body;
        const snippet = new Snippet({
            userId: req.user.id,
            title,
            code,
            language
        });
        await snippet.save();
        res.json({ success: true, snippet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/snippets", verifyToken, async (req, res) => {
    try {
        const snippets = await Snippet.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(snippets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/snippets/:id", verifyToken, async (req, res) => {
    try {
        const snippet = await Snippet.findOne({ _id: req.params.id, userId: req.user.id });
        if (!snippet) return res.status(404).json({ error: "Snippet not found" });
        res.json(snippet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});