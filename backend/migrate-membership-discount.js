require('dotenv').config();
const db = require('./src/config/db');

(async () => {
  try {
    // Check if column already exists
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'membership_discount'
    `, [process.env.DB_NAME]);

    if (cols.length > 0) {
      console.log('ℹ️  Column already exists — skipping');
    } else {
      await db.execute(`ALTER TABLE orders ADD COLUMN membership_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00`);
      console.log('✅ membership_discount column added to orders table');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
})();
