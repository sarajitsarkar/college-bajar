const mongoose = require('mongoose');
const User = require('./models/User.model');
const Category = require('./models/Category.model');
const FeeRule = require('./models/FeeRule.model');
require('dotenv').config();

const DEFAULT_CATEGORIES = [
  { name: 'Study Materials', icon: '📚' },
  { name: 'Calculators', icon: '🔢' },
  { name: 'Books', icon: '📖' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Lab Equipment', icon: '🔬' },
  { name: 'Project Equipment', icon: '🔧' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Tools', icon: '🛠️' },
  { name: 'Accessories', icon: '🎒' },
  { name: 'Other', icon: '📦' },
];

const DEFAULT_FEE_RULE = {
  name: 'Standard Tiered Fee',
  type: 'tiered',
  tiers: [
    { minAmount: 0,  maxAmount: 20,   fee: 1 },
    { minAmount: 21, maxAmount: 50,   fee: 3 },
    { minAmount: 51, maxAmount: 100,  fee: 5 },
    { minAmount: 101, maxAmount: null, fee: 10 },
  ],
  isActive: true,
  priority: 1,
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@collegebajar.com',
        phone: '9999999999',
        passwordHash: 'admin@123',  // will be hashed by pre-save hook
        role: 'admin',
        collegeName: 'College Bajar HQ',
      });
      console.log('✅ Admin user created: admin@collegebajar.com / admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Seed categories
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      }
    }

    // Seed default fee rule
    const feeExists = await FeeRule.findOne({ name: DEFAULT_FEE_RULE.name });
    if (!feeExists) {
      await FeeRule.create(DEFAULT_FEE_RULE);
      console.log('✅ Default fee rule created');
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
