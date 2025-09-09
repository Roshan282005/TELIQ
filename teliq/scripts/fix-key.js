import fs from "fs";

// Read .env file
let env = fs.readFileSync(".env", "utf-8");

// Normalize FIREBASE_PRIVATE_KEY newlines
env = env.replace(
  /FIREBASE_PRIVATE_KEY=(["']?)([\s\S]*?)\1(?=\n|$)/,
  (match, quote, key) => {
    const normalizedKey = key.replace(/\n/g, "\\n");
    return `FIREBASE_PRIVATE_KEY=${normalizedKey}`;
  }
);

// Save back to .env
fs.writeFileSync(".env", env);

console.log("✅ FIREBASE_PRIVATE_KEY normalized with \\n");
