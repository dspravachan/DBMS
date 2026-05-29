require('dotenv').config();
const db = require('./src/config/db');
const { v4: uuidv4 } = require('uuid');

(async () => {
  try {
    // 1. Check which restaurants exist
    const [rests] = await db.execute('SELECT id, name, is_active FROM restaurants');
    console.log('Current restaurants:');
    rests.forEach(r => console.log(`  ${r.is_active ? '✅' : '❌'} [${r.id}] ${r.name}`));

    // 2. Re-activate any soft-deleted restaurants
    const inactive = rests.filter(r => !r.is_active);
    if (inactive.length > 0) {
      await db.execute('UPDATE restaurants SET is_active = TRUE WHERE is_active = FALSE');
      console.log(`\n✅ Re-activated ${inactive.length} restaurant(s):`, inactive.map(r => r.name));
    } else {
      console.log('\n✅ All restaurants already active.');
    }

    // 3. Seed weekly menu if missing
    const [menuRows] = await db.execute('SELECT COUNT(*) AS cnt FROM weekly_menu');
    if (menuRows[0].cnt === 0) {
      console.log('\n📋 Seeding weekly menu data...');
      const [plans] = await db.execute('SELECT id, restaurant_id FROM meal_plans LIMIT 3');
      const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const BREAKFASTS = ['Idli Sambar','Poha','Upma','Paratha','Oats Porridge','Egg Toast','Dosa'];
      const LUNCHES = ['Dal Rice','Paneer Masala','Chole Bhature','Rajma Rice','Veg Biryani','Pulao','Khichdi'];
      const DINNERS = ['Roti Sabzi','Grilled Chicken','Pasta','Fried Rice','Soup & Bread','Daal Makhani','Paneer Tikka'];

      for (const plan of plans) {
        for (let i = 0; i < DAYS.length; i++) {
          await db.execute(
            `INSERT IGNORE INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, breakfast_calories, lunch_name, lunch_calories, dinner_name, dinner_calories)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), plan.id, plan.restaurant_id, DAYS[i], BREAKFASTS[i], 350, LUNCHES[i], 500, DINNERS[i], 450]
          );
        }
        console.log(`  ✅ Seeded menu for plan: ${plan.id}`);
      }
    } else {
      console.log(`\n✅ Weekly menu already has ${menuRows[0].cnt} entries.`);
    }

    // 4. Check memberships exist
    const [mems] = await db.execute('SELECT id, name, price, is_active FROM memberships');
    console.log('\nMemberships:');
    if (mems.length === 0) {
      console.log('  ⚠️  No memberships! Seeding...');
      const memData = [
        { name: 'Silver', price: 199, days: 30, discount: 5, free_del: 2, perks: ['Priority Support', 'Early Access to New Plans'] },
        { name: 'Gold',   price: 499, days: 30, discount: 10, free_del: 5, perks: ['Priority Support', 'Free Dessert Monthly', 'Early Access'] },
        { name: 'Platinum', price: 999, days: 30, discount: 20, free_del: 15, perks: ['24/7 Support', 'Free Desserts Weekly', 'Exclusive Plans', 'Dedicated Manager'] },
      ];
      for (const m of memData) {
        await db.execute(
          `INSERT INTO memberships (id, name, price, duration_days, subscription_discount, free_deliveries, perks, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [uuidv4(), m.name, m.price, m.days, m.discount, m.free_del, JSON.stringify(m.perks)]
        );
        console.log(`  ✅ Created ${m.name} membership`);
      }
    } else {
      mems.forEach(m => console.log(`  ${m.is_active ? '✅' : '❌'} ${m.name} — ₹${m.price}`));
    }

    console.log('\n✅ All done!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
  process.exit(0);
})();
