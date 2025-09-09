import fs from "fs";

// Read .env
let env = fs.readFileSync(".env", "utf-8");

// Fix FIREBASE_PRIVATE_KEY (normalize newlines)
env = env.replace(
  /FIREBASE_PRIVATE_KEY=(["']?)([\s\S]*?)\1(?=\n|$)/,
  (match, quote, key) => {
    const normalizedKey = key.replace(/\n/g, "\\n");
    return `FIREBASE_PRIVATE_KEY=${normalizedKey}`;
  }
);

// Save back
fs.writeFileSync(".env", env);
console.log("✅ Private key normalized with \\n");
