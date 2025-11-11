import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcrypt";

const db = drizzle(process.env.DATABASE_URL);

async function seedAdmin() {
  console.log("🌱 Seeding admin account...");

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    await db.execute(`
      INSERT INTO users (email, password, name, role, loginMethod, createdAt, updatedAt, lastSignedIn)
      VALUES (
        'admin@sas.com',
        '${hashedPassword}',
        'Administrador',
        'admin',
        'email',
        NOW(),
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        password = VALUES(password),
        role = 'admin'
    `);

    console.log("✅ Admin account created!");
    console.log("📧 Email: admin@sas.com");
    console.log("🔑 Password: admin123");
    console.log("");
    console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
