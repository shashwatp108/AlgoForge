const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const User = require("./models/User");
const Job = require("./models/Job");
const Snippet = require("./models/Snippet");
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("./passport"); // Import the config we just made

const app = express();

const mongoose = require("mongoose");

// connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error: ", err));

// TRUST RENDER'S PROXY (Critical for OAuth to work on HTTPS)
app.set("trust proxy", 1);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ hello: "world" });
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code, input } = req.body;

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  // 1. Check if user is logged in (Optional Auth)
  let userId = null;
  const authHeader = req.headers["authorization"];
  
  if (authHeader) {
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (err) {
        // Token invalid/expired? We just treat them as anonymous.
        console.log("Invalid token sent with submission");
    }
  }

  let job;
  try {
    // 2. Generate File
    const filepath = await generateFile(language, code);
    
    // 3. Create a Job record in MongoDB (Pending state)
    job = await new Job({ language, filepath, code, userId }).save();
    const jobId = job["_id"];

    // 4. Execute Code
    const output = await executeCpp(filepath, input); // Use input if needed

    // 5. Update Job with Success
    job.output = output;
    job.status = "success";
    await job.save();

    return res.json({ filepath, output, jobId });
  } catch (err) {
    // 6. Update Job with Error
    if (job) {
        job.output = err.toString(); // Save the error message
        job.status = "error";
        await job.save();
    }
    res.status(500).json({ err });
  }
});


  
// Initialize Passport
app.use(passport.initialize());

// authentication routes
// 1. Trigger google login
app.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }))

// 2. Google Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {session: false, failureRedirect: "/"}),
  (req, res) => {
    // user is successfully authenticated via google
    // generate a JWT token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {expiresIn : "1h"});

    // redirecting to frontend with token in url
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);

// 3. Get current user (protected route)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if(!token) return res.status(403).send('A Token is required.');
  try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Remove 'Bearer '
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};


app.get("/auth/me", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
});

// Get all jobs for the logged-in user
app.get("/jobs/history", verifyToken, async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user.id }).sort({ submittedAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ err });
    }
});


// --- SNIPPET ROUTES ---

// 1. Save a new Snippet
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

// 2. Get All User Snippets (For Profile)
app.get("/snippets", verifyToken, async (req, res) => {
    try {
        const snippets = await Snippet.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(snippets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Single Snippet (For loading into Editor)
app.get("/snippets/:id", verifyToken, async (req, res) => {
    try {
        const snippet = await Snippet.findOne({ _id: req.params.id, userId: req.user.id });
        if (!snippet) return res.status(404).json({ error: "Snippet not found" });
        res.json(snippet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => {
  console.log("Listening on port 5000!");
});