import mongoose, { Schema, Document } from "mongoose";
import fs from "fs";
import path from "path";

// Define TypeScript interfaces for Models
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export interface IProfile extends Document {
  user?: string; // Optional reference to logged in user
  name: string;
  education: string;
  collegeTier: string;
  fieldOfStudy: string;
  skills: string[];
  interests: string[];
  preferredWorkType: string;
  studyReminderEnabled?: boolean;
  studyReminderEmail?: string;
}

export interface IRecommendation extends Document {
  user?: string; // Optional reference to logged in user
  role: string;
  description: string;
  suitabilityScore: number;
  suitabilityBreakdown: { skill: string; matchLevel: number }[];
  roadmap: { phase: string; description: string; milestones: string[] }[];
  resources: { title: string; type: string; link?: string; isFree: boolean }[];
  offCampusStrategy: string;
  gapAnalysis: { collegeCurriculum: string; industryRequirement: string; actionToBridge: string }[];
  completedMilestones: Record<string, boolean>;
  createdAt: Date;
}

// Mongoose Schemas definition
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProfileSchema = new Schema<IProfile>({
  user: { type: String, ref: "User" },
  name: { type: String, required: true },
  education: { type: String, required: true },
  collegeTier: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  skills: [{ type: String }],
  interests: [{ type: String }],
  preferredWorkType: { type: String, required: true },
  studyReminderEnabled: { type: Boolean, default: false },
  studyReminderEmail: { type: String }
});

const RecommendationSchema = new Schema<IRecommendation>({
  user: { type: String, ref: "User" },
  role: { type: String, required: true },
  description: { type: String, required: true },
  suitabilityScore: { type: Number, required: true },
  suitabilityBreakdown: [{
    skill: { type: String, required: true },
    matchLevel: { type: Number, required: true }
  }],
  roadmap: [{
    phase: { type: String, required: true },
    description: { type: String, required: true },
    milestones: [{ type: String }]
  }],
  resources: [{
    title: { type: String, required: true },
    type: { type: String, required: true },
    link: { type: String },
    isFree: { type: Boolean, required: true }
  }],
  offCampusStrategy: { type: String, required: true },
  gapAnalysis: [{
    collegeCurriculum: { type: String, required: true },
    industryRequirement: { type: String, required: true },
    actionToBridge: { type: String, required: true }
  }],
  completedMilestones: { type: Map, of: Boolean, default: {} },
  createdAt: { type: Date, default: Date.now }
});

// Compile Models
export const User = mongoose.model<IUser>("User", UserSchema);
export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
export const Recommendation = mongoose.model<IRecommendation>("Recommendation", RecommendationSchema);

// In-Memory/Local File Fallback Database class to ensure 100% operation without actual MongoDB config
class LocalDatabase {
  private tempDir = path.join(process.cwd(), "data");
  private usersFile = path.join(this.tempDir, "users.json");
  private profilesFile = path.join(this.tempDir, "profiles.json");
  private recommendationsFile = path.join(this.tempDir, "recommendations.json");

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      try {
        fs.mkdirSync(this.tempDir, { recursive: true });
      } catch (e) {
        console.error("Failed to create backup data directory:", e);
      }
    }
  }

  private loadFile<T>(filePath: string): T[] {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error loading backup file ${filePath}:`, e);
      return [];
    }
  }

  private saveFile<T>(filePath: string, data: T[]) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error(`Error writing backup file ${filePath}:`, e);
    }
  }

  // User operations
  getUsers(): any[] {
    return this.loadFile(this.usersFile);
  }

  saveUser(user: any) {
    const users = this.getUsers();
    users.push(user);
    this.saveFile(this.usersFile, users);
  }

  updateUserPassword(email: string, passwordHash: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx].passwordHash = passwordHash;
      this.saveFile(this.usersFile, users);
      return true;
    }
    return false;
  }

  // Profile operations
  getProfiles(): any[] {
    return this.loadFile(this.profilesFile);
  }

  saveProfile(profile: any) {
    const profiles = this.getProfiles();
    profiles.push(profile);
    this.saveFile(this.profilesFile, profiles);
  }

  // Recommendation operations
  getRecommendations(): any[] {
    return this.loadFile(this.recommendationsFile);
  }

  saveRecommendation(rec: any) {
    const recs = this.getRecommendations();
    recs.push(rec);
    this.saveFile(this.recommendationsFile, recs);
  }

  updateRecommendationMilestone(id: string, completedMilestones: Record<string, boolean>) {
    const recs = this.getRecommendations();
    const idx = recs.findIndex(r => r._id === id || r.id === id);
    if (idx !== -1) {
      recs[idx].completedMilestones = completedMilestones;
      this.saveFile(this.recommendationsFile, recs);
      return recs[idx];
    }
    return null;
  }

  updateProfileReminders(userId: string, studyReminderEnabled: boolean, studyReminderEmail: string) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.user === userId);
    if (idx !== -1) {
      profiles[idx].studyReminderEnabled = studyReminderEnabled;
      profiles[idx].studyReminderEmail = studyReminderEmail;
      this.saveFile(this.profilesFile, profiles);
      return profiles[idx];
    } else {
      const newProfile = {
        _id: "local_prof_" + Date.now().toString(36),
        user: userId,
        name: "Student",
        education: "",
        collegeTier: "tier3",
        fieldOfStudy: "",
        skills: [],
        interests: [],
        preferredWorkType: "any",
        studyReminderEnabled,
        studyReminderEmail
      };
      profiles.push(newProfile);
      this.saveFile(this.profilesFile, profiles);
      return newProfile;
    }
  }
}

export const localDb = new LocalDatabase();

// MongoDB Database Connector Helper
let isConnected = false;

function isMongoUriPlaceholder(uri: string): boolean {
  const placeholderPatterns = [
    /user:pass/i,
    /<username>/i,
    /<password>/i,
    /MY_[A-Z0-9_]+/i,
    /example\.com/i,
    /example\.net/i
  ];
  return placeholderPatterns.some(pattern => pattern.test(uri));
}

export async function connectToDatabase(): Promise<boolean> {
  if (isConnected) return true;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || isMongoUriPlaceholder(mongoUri)) {
    console.log("⚠️ No valid MONGODB_URI provided. Falling back to local custom JSON storage.");
    return false;
  }

  try {
    // Improved timeout settings for better reliability with MongoDB Atlas
    // serverSelectionTimeoutMS: 10s - Time to find a server
    // socketTimeoutMS: 30s - Socket keepalive timeout
    // connectTimeoutMS: 10s - Connection establishment timeout
    // heartbeatFrequencyMS: 10s - How often to check server health
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      // Ensure SSL/TLS for MongoDB Atlas
      ssl: true,
      retryWrites: true,
      // Connection pooling for better performance
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    isConnected = true;
    console.log("🚀 MongoDB Atlas Connection established successfully! ✅");
    console.log(`📊 Connected to MongoDB Atlas cluster at: ${mongoUri.split('@')[1]?.split('/')[0] || 'unknown'}`);
    return true;
  } catch (error: any) {
    console.error("🔴 MongoDB Atlas Connection failed. Details:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.codeName || 'UNKNOWN'}`);
    
    // Provide specific troubleshooting hints
    if (error.message.includes('authentication failed')) {
      console.error("   ⚠️  Authentication failed - Check username/password and IP whitelist in MongoDB Atlas");
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo')) {
      console.error("   ⚠️  Network error - Check your internet connection and MongoDB Atlas cluster is running");
    } else if (error.message.includes('ENOTFOUND')) {
      console.error("   ⚠️  DNS error - Check the connection string URL");
    }
    
    console.warn("⏪ Falling back to local JSON database for offline functionality...");
    return false;
  }
}
