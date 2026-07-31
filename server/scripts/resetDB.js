/**
 * SkillSphere — Full Database Reset Script
 * ─────────────────────────────────────────────────────────────────────
 * Drops ALL collections (users, profiles, gigs, proposals, payments,
 * disputes, conversations, messages, notifications, reviews, admin logs)
 * and then creates a fresh admin account.
 *
 * Usage (from /server directory):
 *   node scripts/resetDB.js
 * ─────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

// ── Admin to re-create after reset ───────────────────────────────────
const ADMIN = {
  name: 'SkillSphere Admin',
  email: 'admin@skillsphere.com',
  password: 'Admin@123',
};

// ── Inline User schema (no app imports needed) ────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:                  { type: String, required: true, trim: true },
    email:                 { type: String, required: true, unique: true },
    password:              { type: String, select: false },
    role:                  { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
    avatar:                { type: String, default: '' },
    isEmailVerified:       { type: Boolean, default: false },
    isGoogleAuth:          { type: Boolean, default: false },
    isSuspended:           { type: Boolean, default: false },
    twoFactorEnabled:      { type: Boolean, default: false },
    resetPasswordToken:    String,
    resetPasswordExpire:   Date,
    emailVerificationToken:String,
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

async function resetDatabase() {
  if (!MONGO_URI || MONGO_URI.startsWith('MONGO_URI=')) {
    console.error('\n❌  MONGO_URI is not set in .env — aborting.\n');
    process.exit(1);
  }

  console.log('\n⏳  Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅  Connected to MongoDB\n');

  const db = mongoose.connection.db;

  // ── List all collections in the database ────────────────────────────
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  if (collectionNames.length === 0) {
    console.log('ℹ️   Database is already empty — nothing to drop.\n');
  } else {
    console.log(`🗑️   Dropping ${collectionNames.length} collection(s)...`);
    for (const name of collectionNames) {
      await db.collection(name).drop();
      console.log(`     ✓ Dropped: ${name}`);
    }
    console.log('\n✅  All collections dropped.\n');
  }

  // ── Create fresh admin account ───────────────────────────────────────
  console.log('👤  Creating fresh admin account...');
  const salt   = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(ADMIN.password, salt);

  await User.create({
    name:            ADMIN.name,
    email:           ADMIN.email,
    password:        hashed,
    role:            'admin',
    isEmailVerified: true,
    isSuspended:     false,
  });

  console.log('\n🎉  Database reset complete!\n');
  console.log('   ┌─────────────────────────────────────────┐');
  console.log('   │       Fresh Admin Credentials            │');
  console.log('   ├─────────────────────────────────────────┤');
  console.log(`   │  Email    : ${ADMIN.email}    │`);
  console.log(`   │  Password : ${ADMIN.password}                   │`);
  console.log('   │  Role     : admin                        │');
  console.log('   └─────────────────────────────────────────┘');
  console.log('\n   ➜  Login at: http://localhost:5173/login\n');
  console.log('   Now register new Client and Freelancer accounts from the UI.\n');

  await mongoose.disconnect();
  process.exit(0);
}

resetDatabase().catch(err => {
  console.error('\n❌  Reset failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
