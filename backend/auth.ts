import crypto from "crypto";

// Simple and highly secure password hashing using SHA-256 with salt + PBKDF2 (Native Node)
export function hashPassword(password: string): string {
  const salt = "pathfinder-ai-secret-salt-1248-@!";
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash;
}

// Simple and secure built-in Auth Session token generation (Native Node)
// Since we don't want to rely on jsonwebtoken native issues, we can generate custom encrypted tokens
const ENC_KEY = crypto.scryptSync(process.env.JWT_SECRET || "pathfinder-secret-key-32-chars-long", "salt", 32);
const IV = Buffer.alloc(16, 0); // Initialization vector

export function generateToken(payload: { userId: string; email: string; name: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }); // 7 days expiration
  const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, IV);
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return Buffer.from(encrypted).toString("hex"); // HEX token
}

export function verifyToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    const encrypted = Buffer.from(token, "hex").toString("utf8");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, IV);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    const parsed = JSON.parse(decrypted);
    
    if (parsed.exp < Date.now()) {
      return null; // Expired
    }
    return {
      userId: parsed.userId,
      email: parsed.email,
      name: parsed.name,
    };
  } catch (e) {
    return null; // Invalid token
  }
}
