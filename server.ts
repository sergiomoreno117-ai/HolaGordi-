import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 0,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    weight REAL,
    height REAL,
    age INTEGER,
    gender TEXT,
    goal TEXT,
    activity_level TEXT,
    injuries TEXT,
    ai_instructions TEXT,
    has_seen_tutorial INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    steps INTEGER DEFAULT 0,
    water REAL DEFAULT 0,
    creatine INTEGER DEFAULT 0,
    exercise_done INTEGER DEFAULT 0,
    runners_distance REAL DEFAULT 0,
    walking_distance REAL DEFAULT 0,
    UNIQUE(user_id, date),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS consumed_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    name TEXT,
    brand TEXT,
    calories_per_100 REAL,
    protein_per_100 REAL,
    carbs_per_100 REAL,
    fat_per_100 REAL,
    unit TEXT,
    amount REAL,
    timestamp INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS shopping_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    supermarket TEXT,
    estimated_price REAL,
    is_favorite INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed admin if not exists
const adminEmail = "sergiomoreno117@gmail.com";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Admin Sergio",
    adminEmail,
    "admin123", // In a real app, use hashing like bcrypt
    "admin"
  );
}

const app = express();
app.use(express.json());

// Mock Email Service
const sendEmail = (to: string, subject: string, body: string) => {
  console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  console.log(`Body: ${body}`);
};

// Auth Routes
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(username, email, password);
    const userId = result.lastInsertRowid;
    
    // Initialize profile
    db.prepare("INSERT INTO user_profiles (user_id) VALUES (?)").run(userId);
    
    sendEmail(email, "Bienvenido a HolaGordi!", `Hola ${username}, ¡bienvenido a la aplicación!`);
    res.json({ success: true, userId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
  
  if (user) {
    db.prepare("UPDATE users SET is_active = 1, last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
    
    // Notify admin
    sendEmail(adminEmail, "Nuevo inicio de sesión", `El usuario ${user.username} (${user.email}) ha iniciado sesión.`);
    
    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const { userId } = req.body;
  db.prepare("UPDATE users SET is_active = 0 WHERE id = ?").run(userId);
  res.json({ success: true });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user) {
    sendEmail(email, "Restablecer contraseña", `Tu contraseña es: ${user.password} (En una app real enviaríamos un link)`);
    res.json({ success: true, message: "Correo enviado" });
  } else {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
});

// User Data Routes
app.get("/api/user/:userId/data", (req, res) => {
  const { userId } = req.params;
  const date = new Date().toDateString();
  
  const profile = db.prepare("SELECT * FROM user_profiles WHERE user_id = ?").get(userId);
  const stats = db.prepare("SELECT * FROM daily_stats WHERE user_id = ? AND date = ?").get(userId, date);
  const consumed = db.prepare("SELECT * FROM consumed_products WHERE user_id = ? AND date = ?").all(userId, date);
  const shopping = db.prepare("SELECT * FROM shopping_list WHERE user_id = ?").all(userId);
  
  res.json({
    profile: profile ? {
      ...profile,
      hasSeenTutorial: !!profile.has_seen_tutorial,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      activityLevel: profile.activity_level,
      aiInstructions: profile.ai_instructions
    } : null,
    stats: stats || { steps: 0, water: 0, creatine: 0, exercise_done: 0, runners_distance: 0, walking_distance: 0 },
    consumed: consumed.map((p: any) => ({
      name: p.name,
      brand: p.brand,
      caloriesPer100: p.calories_per_100,
      proteinPer100: p.protein_per_100,
      carbsPer100: p.carbs_per_100,
      fatPer100: p.fat_per_100,
      unit: p.unit,
      amount: p.amount,
      timestamp: p.timestamp
    })),
    shopping: shopping.map((i: any) => ({
      name: i.name,
      supermarket: i.supermarket,
      estimatedPrice: i.estimated_price,
      isFavorite: !!i.is_favorite
    }))
  });
});

app.post("/api/user/:userId/profile", (req, res) => {
  const { userId } = req.params;
  const { displayName, avatarUrl, weight, height, age, gender, goal, activityLevel, injuries, aiInstructions, hasSeenTutorial } = req.body;
  
  db.prepare(`
    INSERT OR REPLACE INTO user_profiles 
    (user_id, display_name, avatar_url, weight, height, age, gender, goal, activity_level, injuries, ai_instructions, has_seen_tutorial)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, displayName, avatarUrl, weight, height, age, gender, goal, activityLevel, injuries, aiInstructions, hasSeenTutorial ? 1 : 0);
  
  res.json({ success: true });
});

app.post("/api/user/:userId/stats", (req, res) => {
  const { userId } = req.params;
  const date = new Date().toDateString();
  const { steps, water, creatine, exerciseDone, runnersDistance, walkingDistance } = req.body;
  
  db.prepare(`
    INSERT INTO daily_stats (user_id, date, steps, water, creatine, exercise_done, runners_distance, walking_distance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
    steps = excluded.steps,
    water = excluded.water,
    creatine = excluded.creatine,
    exercise_done = excluded.exercise_done,
    runners_distance = excluded.runners_distance,
    walking_distance = excluded.walking_distance
  `).run(userId, date, steps, water, creatine ? 1 : 0, exerciseDone ? 1 : 0, runnersDistance, walkingDistance);
  
  res.json({ success: true });
});

app.post("/api/user/:userId/consumed", (req, res) => {
  const { userId } = req.params;
  const date = new Date().toDateString();
  const { product, amount } = req.body;
  
  db.prepare(`
    INSERT INTO consumed_products 
    (user_id, date, name, brand, calories_per_100, protein_per_100, carbs_per_100, fat_per_100, unit, amount, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, 
    date, 
    product.name, 
    product.brand, 
    product.caloriesPer100, 
    product.proteinPer100, 
    product.carbsPer100, 
    product.fatPer100, 
    product.unit, 
    amount, 
    Date.now()
  );
  
  res.json({ success: true });
});

app.delete("/api/user/:userId/consumed/:timestamp", (req, res) => {
  const { userId, timestamp } = req.params;
  db.prepare("DELETE FROM consumed_products WHERE user_id = ? AND timestamp = ?").run(userId, timestamp);
  res.json({ success: true });
});

app.post("/api/user/:userId/shopping", (req, res) => {
  const { userId } = req.params;
  const { items } = req.body; // Array of items
  
  db.prepare("DELETE FROM shopping_list WHERE user_id = ? AND is_favorite = 0").run(userId);
  
  const insert = db.prepare("INSERT INTO shopping_list (user_id, name, supermarket, estimated_price, is_favorite) VALUES (?, ?, ?, ?, ?)");
  for (const item of items) {
    insert.run(userId, item.name, item.supermarket, item.estimatedPrice, item.isFavorite ? 1 : 0);
  }
  
  res.json({ success: true });
});

// Admin Routes
app.get("/api/admin/users", (req, res) => {
  const users = db.prepare("SELECT id, username, email, role, is_active, last_login FROM users").all();
  res.json(users);
});

app.post("/api/admin/reset-password", (req, res) => {
  const { userId, newPassword } = req.body;
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, userId);
  res.json({ success: true });
});

// Vite middleware
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
