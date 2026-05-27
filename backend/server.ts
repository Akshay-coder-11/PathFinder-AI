import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { connectToDatabase, User, Profile, Recommendation, localDb } from "./db";
import { hashPassword, generateToken, verifyToken } from "./auth";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add your Gemini API Key in the Settings panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Connect to Database (falls back smoothly to local file DB if MongoDB_URI is not provided)
  const isMongoConnected = await connectToDatabase();

  // Authentication Middleware
  const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  };

  app.use(authenticateToken);

  // --- API Authentication Routes ---
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: "Missing required fields (email, password, name)" });
        return;
      }

      const passwordHash = hashPassword(password);

      if (isMongoConnected) {
        const existing = await User.findOne({ email });
        if (existing) {
          res.status(400).json({ error: "User with this email already exists" });
          return;
        }

        const newUser = new User({ email, passwordHash, name });
        await newUser.save();
        const token = generateToken({ userId: newUser._id.toString(), email: newUser.email, name: newUser.name });
        res.status(201).json({ token, user: { id: newUser._id.toString(), email: newUser.email, name: newUser.name } });
        return;
      } else {
        const users = localDb.getUsers();
        const existing = users.find(u => u.email === email);
        if (existing) {
          res.status(400).json({ error: "User with this email already exists" });
          return;
        }

        const newUser = {
          _id: "local_usr_" + Date.now().toString(36),
          email,
          passwordHash,
          name,
          createdAt: new Date()
        };
        localDb.saveUser(newUser);
        const token = generateToken({ userId: newUser._id, email: newUser.email, name: newUser.name });
        res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, name: newUser.name } });
        return;
      }
    } catch (error: any) {
      console.error("Register Error:", error);
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      let userExists = false;
      if (isMongoConnected) {
        const user = await User.findOne({ email });
        if (user) userExists = true;
      } else {
        const users = localDb.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) userExists = true;
      }

      if (!userExists) {
        res.status(404).json({ error: "No account found with this email address." });
        return;
      }

      res.json({ 
        success: true, 
        message: "Verification successful. A test OTP PIN '123456' has been simulated for your account." 
      });
    } catch (error: any) {
      console.error("Forgotpwd Error:", error);
      res.status(500).json({ error: "An error occurred while finding your account." });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, pin, newPassword } = req.body;
      if (!email || !pin || !newPassword) {
        res.status(400).json({ error: "All fields (email, OTP pin, new password) are required." });
        return;
      }

      if (pin !== "123456") {
        res.status(400).json({ error: "Invalid simulated OTP. Please use '123456' to verify." });
        return;
      }

      const hash = hashPassword(newPassword);
      let updated = false;

      if (isMongoConnected) {
        const result = await User.updateOne({ email }, { passwordHash: hash });
        if (result.matchedCount > 0) {
          updated = true;
        }
      } else {
        updated = localDb.updateUserPassword(email, hash);
      }

      if (!updated) {
        res.status(404).json({ error: "Failed to reset password. Email not found." });
        return;
      }

      res.json({ success: true, message: "Password has been successfully reset! You can now log in." });
    } catch (error: any) {
      console.error("ResetPassword Error:", error);
      res.status(500).json({ error: "An error occurred while resetting password." });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const hash = hashPassword(password);

      if (isMongoConnected) {
        const user = await User.findOne({ email });
        if (!user || user.passwordHash !== hash) {
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        const token = generateToken({ userId: user._id.toString(), email: user.email, name: user.name });
        res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
        return;
      } else {
        const users = localDb.getUsers();
        const user = users.find(u => u.email === email && u.passwordHash === hash);
        if (!user) {
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        const token = generateToken({ userId: user._id, email: user.email, name: user.name });
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
        return;
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", (req: any, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({ user: req.user });
  });

  app.get("/api/system-status", (req: Request, res: Response) => {
    res.json({
      isMongoConnected,
      storageType: isMongoConnected ? "MongoDB Atlas" : "Local File Database (Highly Available)",
    });
  });

  app.get("/api/admin/system-data", async (req: Request, res: Response) => {
    try {
      let usersList: any[] = [];
      let totalRecommendations = 0;
      let totalProfiles = 0;

      if (isMongoConnected) {
        const users = await User.find({}, "name email createdAt");
        usersList = users.map(u => ({ name: u.name, email: u.email, id: u._id }));
        totalRecommendations = await Recommendation.countDocuments();
        totalProfiles = await Profile.countDocuments();
      } else {
        const users = localDb.getUsers() || [];
        usersList = users.map(u => ({ name: u.name || "Anonymous", email: u.email }));
        totalRecommendations = (localDb.getRecommendations() || []).length;
        totalProfiles = (localDb.getProfiles() || []).length;
      }

      res.json({
        users: usersList,
        totalRecommendations,
        totalProfiles,
        storageType: isMongoConnected ? "MongoDB Atlas Cloud" : "Local File Backup (.json)",
        serverUptimeHours: (process.uptime() / 3600).toFixed(2)
      });
    } catch (e: any) {
      console.error("Admin aggregation error:", e);
      res.status(500).json({ error: "Failed to collect admin statistics." });
    }
  });

  // --- Profile Routes ---
  app.post("/api/profile", async (req: any, res: Response) => {
    try {
      const profileData = req.body;
      const userId = req.user?.userId;

      if (isMongoConnected) {
        const newProfile = new Profile({ ...profileData, user: userId });
        await newProfile.save();
        res.status(201).json(newProfile);
        return;
      } else {
        const newProfile = {
          _id: "local_prof_" + Date.now().toString(36),
          ...profileData,
          user: userId
        };
        localDb.saveProfile(newProfile);
        res.status(201).json(newProfile);
        return;
      }
    } catch (error: any) {
      console.error("Profile Save Error:", error);
      res.status(500).json({ error: error.message || "Failed to save profile" });
    }
  });

  app.post("/api/profile/reminders", async (req: any, res: Response) => {
    try {
      const { studyReminderEnabled, studyReminderEmail } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.json({ success: true, message: "Settings saved locally for this session. Sign in to sync across devices.", local: true });
        return;
      }

      if (isMongoConnected) {
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: userId },
          { studyReminderEnabled, studyReminderEmail },
          { new: true, upsert: true }
        );
        res.json(updatedProfile);
        return;
      } else {
        const updatedProfile = localDb.updateProfileReminders(userId, studyReminderEnabled, studyReminderEmail);
        res.json(updatedProfile);
        return;
      }
    } catch (error: any) {
      console.error("Profile Reminders Update Error:", error);
      res.status(500).json({ error: error.message || "Failed to update study reminder settings" });
    }
  });

  app.post("/api/profile/reminders/test", async (req: any, res: Response) => {
    try {
      const { studyReminderEmail, role, pendingMilestone } = req.body;
      const name = req.user?.name || "Student";

      if (!studyReminderEmail) {
        res.status(400).json({ error: "Reminder email is required to send a test nudge." });
        return;
      }

      const subject = `🚀 PathFinder Daily Nudge: Time to master your "${role || 'Career'}" skills!`;
      
      const emailContent = `
========================================
📧 SIMULATED EMAIL INBOX NOTIFICATION
========================================
To: ${studyReminderEmail}
Subject: ${subject}
Date: Today (Daily Study Reminder Opt-In)
----------------------------------------

Hello ${name}! 👋

This is your PathFinder Daily Career Nudge. Standard college courses don't always cover the exact tools the industry demands, but you are actively bridging that gap! 

🎯 YOUR NEXT TARGET MILESTONE:
"${pendingMilestone || 'Identify high-value tech skills and draft your project plans'}"

💡 PATHFINDER MENTOR ACTIONABLE ADVICE:
- Try to dedicate just 25-40 minutes toward this milestone today. Consistency always beats short, intensive cramming!
- If you're stuck, remember that you can chat with your PathFinder AI Mentor anytime in the app to get a step-by-step breakdown or a starting template!

🔥 OFF-CAMPUS EDGE:
Don't just code in private—share your learning progress on LinkedIn using the #PathFinderCrew hashtag to build visibility. Industry professionals love seeing proactive builders!

Keep pushing forward. Your tier-defying career trajectory is happening one milestone at a time!

Best of luck from your team,
-- The PathFinder AI Family
========================================
`;

      console.log(`[Email Simulated] Sent study reminder nudge email to ${studyReminderEmail}`);
      res.json({
        success: true,
        message: "Simulated nudge email triggered successfully!",
        preview: emailContent
      });
    } catch (error: any) {
      console.error("Test reminder error:", error);
      res.status(500).json({ error: error.message || "Failed to send simulated daily reminder" });
    }
  });

  // --- Recommendation and AI Generation Routes ---
  app.post("/api/recommendation", async (req: any, res: Response) => {
    try {
      const profile = req.body;
      const userId = req.user?.userId;

      if (!profile.name || !profile.collegeTier || !profile.skills || !profile.interests) {
        res.status(400).json({ error: "Profile details are incomplete" });
        return;
      }

      // 1. Prepare prompt for Gemini
      const prompt = `Based on the following student profile, provide a highly personalized career recommendation, localized for the context of a Tier ${profile.collegeTier.replace('tier', '')} college student. 
    
      Student Profile:
      - Name: ${profile.name}
      - Education: ${profile.education} (${profile.fieldOfStudy})
      - College Tier: ${profile.collegeTier}
      - Skills: ${profile.skills.join(', ')}
      - Interests: ${profile.interests.join(', ')}
      - Preferred Work: ${profile.preferredWorkType}

      Focus on:
      1. Bridging the gap between tier 2/3 education and top-tier jobs or dream competitive exam results.
      2. Niche roles or careers that match their current skills, education level (Intermediate, B.Tech, Graduation, Post-Graduation, or Government Exams), and specific interests.
      3. A step-by-step roadmap for the next 12 months with highly relevant milestones.
      4. Specific off-campus placement strategies, networking, or preparation hacks.
      5. Curated resources: You MUST actively suggest "FREE" high-quality resources, including the absolute BEST YouTube channels (e.g. CodeWithHarry, Love Babbar, Apna College, freeCodeCamp, Unacademy, StudyIQ, Bankersadda, etc.) and free course playlists relevant to their selected education/domain. Mark "isFree" as true for these resources and specify real or representative links if possible.
      
      Please provide the response in a structured JSON format.`;

      // 2. Call Gemini API
      console.log("Calling Gemini 3.5 Flash backend engine for student:", profile.name);
      
      const response = await getGeminiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["role", "description", "suitabilityScore", "suitabilityBreakdown", "roadmap", "resources", "offCampusStrategy", "gapAnalysis"],
            properties: {
              role: { type: Type.STRING },
              description: { type: Type.STRING },
              suitabilityScore: { type: Type.NUMBER },
              suitabilityBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["skill", "matchLevel"],
                  properties: {
                    skill: { type: Type.STRING },
                    matchLevel: { type: Type.NUMBER }
                  }
                }
              },
              roadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["phase", "description", "milestones"],
                  properties: {
                    phase: { type: Type.STRING },
                    description: { type: Type.STRING },
                    milestones: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  }
                }
              },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["title", "type", "isFree"],
                  properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["course", "article", "project", "community"] },
                    link: { type: Type.STRING },
                    isFree: { type: Type.BOOLEAN }
                  }
                }
              },
              offCampusStrategy: { type: Type.STRING },
              gapAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["collegeCurriculum", "industryRequirement", "actionToBridge"],
                  properties: {
                    collegeCurriculum: { type: Type.STRING },
                    industryRequirement: { type: Type.STRING },
                    actionToBridge: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const recommendationData = JSON.parse(response.text);

      // 3. Save to database or local storage
      if (isMongoConnected) {
        const newRec = new Recommendation({
          ...recommendationData,
          user: userId,
          completedMilestones: {}
        });
        await newRec.save();
        res.status(201).json(newRec);
        return;
      } else {
        const newRec = {
          _id: "local_rec_" + Date.now().toString(36),
          ...recommendationData,
          user: userId,
          completedMilestones: {},
          createdAt: new Date()
        };
        localDb.saveRecommendation(newRec);
        res.status(201).json(newRec);
        return;
      }
    } catch (error: any) {
      console.error("Vite Backend Gemini Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate roadmap from backend AI" });
    }
  });

  // Get saved recommendations for the authenticated user
  app.get("/api/recommendations", async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.json([]);
        return;
      }

      if (isMongoConnected) {
        const recs = await Recommendation.find({ user: userId }).sort({ createdAt: -1 });
        res.json(recs);
        return;
      } else {
        const recs = localDb.getRecommendations().filter(r => r.user === userId);
        res.json(recs);
        return;
      }
    } catch (error: any) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update recommendation milestones checklist
  app.post("/api/recommendation/:id/milestones", async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { completedMilestones } = req.body;

      if (isMongoConnected) {
        const updated = await Recommendation.findByIdAndUpdate(
          id,
          { completedMilestones },
          { new: true }
        );
        res.json(updated);
        return;
      } else {
        const updated = localDb.updateRecommendationMilestone(id, completedMilestones);
        if (updated) {
          res.json(updated);
        } else {
          res.status(404).json({ error: "Recommendation not found" });
        }
        return;
      }
    } catch (error: any) {
      console.error("Update milestones error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Secure Chat AI assistant Route proxy ---
  app.post("/api/chat", async (req: any, res: Response) => {
    try {
      const { message, history, profile, recommendation } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const name = profile?.name || "Student";
      const education = profile?.education || "Engineering";
      const fieldOfStudy = profile?.fieldOfStudy || "Computer Science";
      const collegeTier = profile?.collegeTier ? profile.collegeTier.replace('tier', '') : '2/3';
      const skills = profile?.skills ? profile.skills.join(', ') : 'None specified yet';
      const interests = profile?.interests ? profile.interests.join(', ') : 'None specified yet';
      const preferredWorkType = profile?.preferredWorkType || 'Remote';

      const systemInstruction = `You are PathFinder AI Assistant, an elite career mentor specialized in Tier 2/3 student success, exams, and technical/non-technical upskilling.
          
      Student Profile:
      - Name: ${name}
      - Education: ${education} (${fieldOfStudy})
      - College Tier: Tier ${collegeTier}
      - Skills: ${skills}
      - Interests: ${interests}
      - Preferred Work: ${preferredWorkType}

      Current Path/Role: ${recommendation ? recommendation.role : 'None yet'}
      Current Roadmap: ${recommendation ? JSON.stringify(recommendation.roadmap) : 'No roadmap yet'}

      CONTEXT: The user is asking for personalized step-by-step suggestions, free resource referrals, or advice.
      
      YOUR ROLE: 
      1. Provide extremely granular, actionable steps (e.g., "This week, spend 2 hours on X", "Finish this specific module on Y").
      2. If a roadmap exists, break down the CURRENT phase into weekly or daily tasks.
      3. Recommend specific FREE courses, playlists, and outstanding YouTube channels (such as CodeWithHarry, Love Babbar, Apna College, freeCodeCamp, Unacademy, StudyIQ IAS, WSCube Tech, GateSmashers, Jenny's Lectures, Physics Wallah, etc.) aligned with their selected career or exam.
      4. Focus on "Off-Campus" hacks: LinkedIn cold outreach templates, portfolio tips, and niche communities.
      5. Avoid generic advice. Mention specific tools, libraries, or platforms related to their interests (${interests}).
      6. Use Markdown (bolding, lists, code blocks, tables) to make information highly readable and engaging.
      
      Always address ${name} warmly but maintain a high-performance mentorship tone.`;

      const contents = [];

      // Format previous chat messages for multi-turn conversational contents
      if (Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }

      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      console.log(`Calling Gemini Chat Assistant securely for student: ${name}`);
      const response = await getGeminiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Secure Chat Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI chat mentor" });
    }
  });


  // --- Vite & Production asset rendering middleware setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
