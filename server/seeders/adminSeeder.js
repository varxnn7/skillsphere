/**
 * Admin Seeder Script
 * ------------------------------------------------------------------
 * Creates the default SkillSphere admin account if it does not exist.
 *
 * Usage:
 *   npm run seed:admin          (from inside the /server directory)
 *   node seeders/adminSeeder.js (direct)
 *
 * Credentials created:
 *   Email   : admin@skillsphere.com
 *   Password: Admin@123
 *   Role    : admin
 * ------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Inline User schema so we don't pull in the full app ─────────────
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    password: { type: String, minlength: 6, select: false },
    role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
    avatar: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    isGoogleAuth: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

// ── Admin credentials ────────────────────────────────────────────────
const ADMIN_NAME     = 'SkillSphere Admin';
const ADMIN_EMAIL    = 'admin@skillsphere.com';
const ADMIN_PASSWORD = 'Admin@123';

// ── Main seeder function ─────────────────────────────────────────────
async function seedAdmin() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.startsWith('MONGO_URI=')) {
    console.error('❌  MONGO_URI is not set correctly in .env');
    process.exit(1);
  }

  try {
    console.log('⏳  Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅  Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      console.log('ℹ️   Admin already exists — no changes made.');
      console.log(`     Email : ${ADMIN_EMAIL}`);
      console.log(`     Role  : ${existing.role}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin user
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });

    console.log('🎉  Admin created successfully!');
    console.log('');
    console.log('   ┌──────────────────────────────────────┐');
    console.log('   │  SkillSphere Admin Credentials        │');
    console.log('   ├──────────────────────────────────────┤');
    console.log(`   │  Email   : ${ADMIN_EMAIL}     │`);
    console.log(`   │  Password: ${ADMIN_PASSWORD}               │`);
    console.log('   │  Role    : admin                     │');
    console.log('   └──────────────────────────────────────┘');
    console.log('');
    console.log('   Login at: http://localhost:5173/login');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌  Seeder failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
