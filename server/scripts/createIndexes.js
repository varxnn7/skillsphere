const mongoose = require('mongoose');
require('dotenv').config();

const createIndexes = async () => {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected! Creating indexes...');

  const db = mongoose.connection.db;

  // ── Users ──
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  console.log('✓ Users indexes created');

  // ── Gigs ──
  await db.collection('gigs').createIndex({ status: 1, isApproved: 1 });
  await db.collection('gigs').createIndex({ skills: 1 });
  await db.collection('gigs').createIndex({ client: 1 });
  await db.collection('gigs').createIndex({ createdAt: -1 });
  await db.collection('gigs').createIndex({ title: 'text', description: 'text' });
  console.log('✓ Gigs indexes created');

  // ── Proposals ──
  await db.collection('proposals').createIndex({ gig: 1, freelancer: 1 });
  await db.collection('proposals').createIndex({ freelancer: 1 });
  console.log('✓ Proposals indexes created');

  // ── Messages ──
  await db.collection('messages').createIndex({ conversation: 1, createdAt: -1 });
  console.log('✓ Messages indexes created');

  // ── Payments ──
  await db.collection('payments').createIndex({ client: 1 });
  await db.collection('payments').createIndex({ freelancer: 1 });
  await db.collection('payments').createIndex({ status: 1 });
  await db.collection('payments').createIndex({ createdAt: -1 });
  console.log('✓ Payments indexes created');

  // ── Notifications ──
  await db.collection('notifications').createIndex({ user: 1, isRead: 1 });
  await db.collection('notifications').createIndex({ createdAt: -1 });
  console.log('✓ Notifications indexes created');

  // ── Conversations ──
  await db.collection('conversations').createIndex({ participants: 1 });
  await db.collection('conversations').createIndex({ lastMessageAt: -1 });
  console.log('✓ Conversations indexes created');

  // ── Reviews ──
  await db.collection('reviews').createIndex({ freelancer: 1 });
  await db.collection('reviews').createIndex({ gig: 1 });
  console.log('✓ Reviews indexes created');

  console.log('\n✅ All indexes created successfully!');
  process.exit(0);
};

createIndexes().catch((err) => {
  console.error('Error creating indexes:', err);
  process.exit(1);
});
