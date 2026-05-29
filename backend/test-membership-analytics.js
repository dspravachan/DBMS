require('dotenv').config();
const db = require('./src/config/db');

(async () => {
  // Test the new membership distribution query
  const [dist] = await db.execute(
    `SELECT m.name, COUNT(um.id) AS value
     FROM memberships m
     LEFT JOIN user_memberships um ON um.membership_id = m.id
       AND um.is_active = TRUE AND um.end_date >= CURDATE()
     WHERE m.is_active = TRUE
     GROUP BY m.id, m.name
     ORDER BY m.price ASC`
  );
  console.log('Membership Distribution:', dist);

  const [[{ monthly_revenue }]] = await db.execute(
    "SELECT COALESCE(SUM(amount), 0) AS monthly_revenue FROM payments WHERE status = 'success' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())"
  );
  console.log('Monthly Revenue:', monthly_revenue);

  const [[{ avg_rating }]] = await db.execute(
    'SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating FROM restaurants WHERE is_active = TRUE'
  );
  console.log('Avg Restaurant Rating:', avg_rating);

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
