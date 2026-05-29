-- ============================================================
-- MealMatrix v2 - Seed Data
-- Run AFTER schema.sql
-- ============================================================

USE mealmatrix_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS (1 admin + 4 regular users)
-- Passwords are bcrypt hashed: admin123 / password123
-- ============================================================
INSERT INTO users (id, name, email, password_hash, role, phone, address, avatar_url, is_active) VALUES
('u-admin-001', 'Admin User', 'admin@mealmatrix.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin', '+91-9000000001', '1 Admin Lane, Mumbai, Maharashtra 400001', NULL, TRUE),
('u-user-001', 'Priya Sharma', 'priya@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'user', '+91-9876543210', '12 Park Street, Mumbai, Maharashtra 400002', NULL, TRUE),
('u-user-002', 'Rahul Verma', 'rahul@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'user', '+91-9876543211', '45 MG Road, Bengaluru, Karnataka 560001', NULL, TRUE),
('u-user-003', 'Ananya Singh', 'ananya@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'user', '+91-9876543212', '78 Lake View, Hyderabad, Telangana 500001', NULL, TRUE),
('u-user-004', 'Dev Patel', 'dev@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'user', '+91-9876543213', '33 Anna Salai, Chennai, Tamil Nadu 600002', NULL, TRUE);

-- ============================================================
-- RESTAURANTS (5 restaurants)
-- ============================================================
INSERT INTO restaurants (id, name, description, cuisine_type, address, city, image_url, rating, delivery_time, min_order, is_active, owner_name) VALUES
('r-indian-001', 'Spice Garden', 'Authentic North Indian cuisine with traditional recipes passed down through generations. Known for rich curries and tandoor-grilled specialties.', 'Indian', '42 Curry Lane, Andheri West', 'Mumbai', '/images/restaurant_indian.png', 4.50, '30-45 min', 150.00, TRUE, 'Ramesh Kumar'),
('r-burger-001', 'Burger Barn', 'Gourmet burgers made with premium ingredients. From classic beef patties to innovative veggie options, we have something for everyone.', 'American', '18 Food Street, Koramangala', 'Bengaluru', '/images/restaurant_burger.png', 4.20, '20-35 min', 200.00, TRUE, 'Suresh Pillai'),
('r-italian-001', 'La Bella Cucina', 'Authentic Italian dining experience with fresh pasta, wood-fired pizzas, and classic desserts prepared by our Italian-trained chefs.', 'Italian', '5 Italian Quarter, Banjara Hills', 'Hyderabad', '/images/restaurant_italian.png', 4.70, '35-50 min', 300.00, TRUE, 'Marco Rossi'),
('r-japanese-001', 'Sakura Sushi', 'Premium Japanese dining featuring fresh sushi, sashimi, ramen, and traditional Japanese specialties. Bringing the flavors of Tokyo to your doorstep.', 'Japanese', '22 Cherry Blossom Road, Egmore', 'Chennai', '/images/restaurant_japanese.png', 4.60, '40-55 min', 350.00, TRUE, 'Yuki Tanaka'),
('r-healthy-001', 'Green Bowl', 'Nutritious and delicious healthy meals crafted by certified nutritionists. Perfect for fitness enthusiasts, diet-conscious individuals, and anyone pursuing a healthier lifestyle.', 'Healthy', '9 Wellness Avenue, Powai', 'Mumbai', '/images/restaurant_dessert.png', 4.40, '25-40 min', 250.00, TRUE, 'Nisha Joshi');

-- ============================================================
-- FOODS (20+ food items)
-- ============================================================
INSERT INTO foods (id, restaurant_id, name, description, price, image_url, category, is_veg, is_popular, calories, is_available) VALUES
-- Spice Garden (Indian)
('f-001', 'r-indian-001', 'Butter Chicken', 'Tender chicken in a rich, creamy tomato-butter sauce. A timeless North Indian classic served with naan or rice.', 320.00, '/images/food_butter_chicken.png', 'Main Course', FALSE, TRUE, 450, TRUE),
('f-002', 'r-indian-001', 'Paneer Tikka', 'Succulent cottage cheese cubes marinated in spiced yogurt and grilled to perfection in our clay oven. A vegetarian delight.', 280.00, '/images/food_paneer_tikka.png', 'Starters', TRUE, TRUE, 310, TRUE),
('f-003', 'r-indian-001', 'Chicken Biryani', 'Aromatic basmati rice slow-cooked with marinated chicken, whole spices, caramelized onions and saffron. A royal feast.', 350.00, '/images/food_biryani.png', 'Rice', FALSE, TRUE, 620, TRUE),
('f-004', 'r-indian-001', 'Masala Dosa', 'Crispy golden crepe made from fermented rice and lentil batter, filled with spiced potato masala. Served with sambar and chutneys.', 150.00, '/images/food_masala_dosa.png', 'Breakfast', TRUE, TRUE, 280, TRUE),
('f-005', 'r-indian-001', 'Dal Makhani', 'Slow-cooked black lentils simmered overnight with cream and butter. A velvety, protein-rich comfort food.', 220.00, '/images/food_butter_chicken.png', 'Main Course', TRUE, FALSE, 340, TRUE),

-- Burger Barn (American)
('f-006', 'r-burger-001', 'Gourmet Classic Burger', 'Double beef patty with aged cheddar, crispy bacon, fresh lettuce, tomato, and our signature house sauce in a brioche bun.', 350.00, '/images/food_gourmet_burger.png', 'Burgers', FALSE, TRUE, 720, TRUE),
('f-007', 'r-burger-001', 'Veggie Supreme Burger', 'Grilled portobello mushroom patty with avocado, roasted peppers, Swiss cheese, and garlic aioli on a whole wheat bun.', 280.00, '/images/food_gourmet_burger.png', 'Burgers', TRUE, TRUE, 480, TRUE),
('f-008', 'r-burger-001', 'BBQ Chicken Burger', 'Crispy fried chicken breast glazed with smoky BBQ sauce, pickled jalapeños, coleslaw, and honey mustard in a sesame bun.', 320.00, '/images/food_gourmet_burger.png', 'Burgers', FALSE, FALSE, 640, TRUE),
('f-009', 'r-burger-001', 'Loaded Cheese Fries', 'Crispy fries topped with melted nacho cheese, jalapeños, sour cream, and chives. The ultimate indulgent side.', 180.00, '/images/food_gourmet_burger.png', 'Sides', TRUE, FALSE, 520, TRUE),

-- La Bella Cucina (Italian)
('f-010', 'r-italian-001', 'Margherita Pizza', 'Classic Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella di bufala, and fragrant basil leaves on a wood-fired crust.', 420.00, '/images/food_margherita_pizza.png', 'Pizza', TRUE, TRUE, 580, TRUE),
('f-011', 'r-italian-001', 'Pasta Carbonara', 'Traditional Roman spaghetti carbonara with guanciale, Pecorino Romano, free-range eggs, and freshly cracked black pepper. No cream, just tradition.', 380.00, '/images/food_pasta_carbonara.png', 'Pasta', FALSE, TRUE, 680, TRUE),
('f-012', 'r-italian-001', 'Chocolate Lava Cake', 'Warm dark chocolate fondant with a gooey molten center, served with vanilla gelato and raspberry coulis. A heavenly dessert.', 280.00, '/images/food_chocolate_lava_cake.png', 'Desserts', TRUE, TRUE, 420, TRUE),
('f-013', 'r-italian-001', 'Penne Arrabbiata', 'Al dente penne in a fiery tomato sauce with garlic, red chili flakes, and fresh parsley. A boldly flavored vegetarian pasta.', 320.00, '/images/food_pasta_carbonara.png', 'Pasta', TRUE, FALSE, 540, TRUE),

-- Sakura Sushi (Japanese)
('f-014', 'r-japanese-001', 'Sushi Platter (12 pcs)', 'Assortment of 12 premium sushi pieces: salmon nigiri, tuna maki, avocado roll, California roll, and chef selection. Served with wasabi and pickled ginger.', 650.00, '/images/food_sushi_platter.png', 'Sushi', FALSE, TRUE, 380, TRUE),
('f-015', 'r-japanese-001', 'Tonkotsu Ramen', 'Rich, creamy pork bone broth ramen with chashu pork belly, soft-boiled marinated egg, bamboo shoots, nori, and green onions. Soul-warming perfection.', 480.00, '/images/food_ramen.png', 'Ramen', FALSE, TRUE, 720, TRUE),
('f-016', 'r-japanese-001', 'Vegetable Tempura', 'Lightly battered and crispy fried seasonal vegetables served with tentsuyu dipping sauce. A delicate Japanese classic.', 350.00, '/images/food_sushi_platter.png', 'Starters', TRUE, FALSE, 310, TRUE),
('f-017', 'r-japanese-001', 'Dragon Roll', 'Shrimp tempura and cucumber inside, topped with thinly sliced avocado and tobiko. Served with spicy mayo. A crowd favorite.', 520.00, '/images/food_sushi_platter.png', 'Sushi', FALSE, TRUE, 420, TRUE),

-- Green Bowl (Healthy)
('f-018', 'r-healthy-001', 'Quinoa Power Bowl', 'Organic quinoa with roasted chickpeas, kale, cherry tomatoes, cucumber, avocado, and tahini-lemon dressing. High protein, nutrient dense.', 360.00, '/images/food_paneer_tikka.png', 'Bowls', TRUE, TRUE, 420, TRUE),
('f-019', 'r-healthy-001', 'Grilled Chicken Salad', 'Herb-marinated grilled chicken breast over mixed greens, walnuts, cranberries, feta cheese, and apple cider vinaigrette. Light and satisfying.', 320.00, '/images/food_butter_chicken.png', 'Salads', FALSE, TRUE, 380, TRUE),
('f-020', 'r-healthy-001', 'Acai Smoothie Bowl', 'Blended acai, banana, and almond milk topped with granola, fresh berries, chia seeds, coconut flakes, and honey. A nutrient-packed breakfast.', 280.00, '/images/food_chocolate_lava_cake.png', 'Breakfast', TRUE, TRUE, 320, TRUE),
('f-021', 'r-healthy-001', 'Detox Green Juice', 'Cold-pressed blend of spinach, cucumber, celery, green apple, lemon, and ginger. 100% natural, no preservatives, maximum nutrition.', 180.00, '/images/food_masala_dosa.png', 'Beverages', TRUE, FALSE, 85, TRUE);

-- ============================================================
-- MEAL PLANS (3 per restaurant = 15 plans)
-- ============================================================
INSERT INTO meal_plans (id, restaurant_id, plan_name, plan_type, meal_type, description, price, duration_days, meals_per_day, delivery_frequency, is_active) VALUES
-- Spice Garden Plans
('mp-001', 'r-indian-001', 'Spice Weekly Veg', 'weekly', 'veg', 'A week of authentic North Indian vegetarian cuisine. Enjoy fresh rotis, sabzis, dal, and rice combinations every day.', 1499.00, 7, 3, 'Daily', TRUE),
('mp-002', 'r-indian-001', 'Indian Monthly Feast', 'monthly', 'non-veg', 'Full month of diverse Indian meals with non-veg options. Includes special weekend menus with biryani and kebabs.', 4999.00, 30, 3, 'Daily', TRUE),
('mp-003', 'r-indian-001', 'Ayurveda Diet Plan', 'custom', 'veg', 'Specially curated ayurvedic meal plan with seasonal vegetables, superfoods, and balanced nutrition for holistic health.', 2199.00, 14, 2, 'Daily', TRUE),

-- Burger Barn Plans
('mp-004', 'r-burger-001', 'Burger Weekly Box', 'weekly', 'both', 'Your weekly fix of gourmet burgers, loaded fries, and refreshing shakes. Mix of veg and non-veg options.', 1799.00, 7, 2, 'Daily', TRUE),
('mp-005', 'r-burger-001', 'American Monthly Plan', 'monthly', 'non-veg', 'Full month of American classics. Variety of burgers, wraps, and sides with weekly menu rotation.', 5499.00, 30, 2, 'Daily', TRUE),
('mp-006', 'r-burger-001', 'Healthy Burger Plan', 'custom', 'veg', 'Vegetarian gourmet burgers with superfood sides. Perfect for health-conscious burger lovers.', 1299.00, 7, 1, 'Daily', TRUE),

-- La Bella Cucina Plans
('mp-007', 'r-italian-001', 'Italian Weekly Veg', 'weekly', 'veg', 'A curated week of authentic Italian vegetarian cuisine. Fresh pasta, wood-fired pizzas, and classic salads.', 2199.00, 7, 2, 'Daily', TRUE),
('mp-008', 'r-italian-001', 'Italian Monthly Deluxe', 'monthly', 'both', 'Premium Italian dining experience for a month. Includes pasta, pizza, risotto, and dessert variations.', 6999.00, 30, 3, 'Daily', TRUE),
('mp-009', 'r-italian-001', 'Pasta & Pizza Custom', 'custom', 'veg', '10-day rotating pasta and pizza plan with 5 different varieties. Italian at its finest.', 1899.00, 10, 2, 'Daily', TRUE),

-- Sakura Sushi Plans
('mp-010', 'r-japanese-001', 'Sushi Weekly Plan', 'weekly', 'both', 'A week of premium Japanese cuisine. Freshly prepared sushi, ramen, and traditional Japanese dishes.', 2999.00, 7, 2, 'Daily', TRUE),
('mp-011', 'r-japanese-001', 'Japanese Monthly Box', 'monthly', 'non-veg', 'Comprehensive monthly Japanese meal plan with rotating sushi, ramen, tempura, and bento boxes.', 8499.00, 30, 3, 'Daily', TRUE),
('mp-012', 'r-japanese-001', 'Zen Veg Japan', 'custom', 'veg', 'Vegetarian Japanese cuisine focused on tofu, vegetable tempura, edamame, and vegetarian sushi rolls.', 1999.00, 7, 2, 'Daily', TRUE),

-- Green Bowl Plans
('mp-013', 'r-healthy-001', 'Green Weekly Reset', 'weekly', 'veg', 'A 7-day nutritional reset with balanced plant-based meals designed by certified nutritionists. Boost energy and wellbeing.', 2499.00, 7, 3, 'Daily', TRUE),
('mp-014', 'r-healthy-001', 'Fitness Monthly Plan', 'monthly', 'both', 'Month-long high-protein fitness meal plan. Balanced macros for muscle building and fat loss. Chef + nutritionist designed.', 7499.00, 30, 3, 'Daily', TRUE),
('mp-015', 'r-healthy-001', 'Detox 7-Day Plan', 'custom', 'veg', 'Intensive 7-day detox program with cold-pressed juices, smoothie bowls, and light cleansing meals. Restart your body.', 1999.00, 7, 3, 'Daily', TRUE);

-- ============================================================
-- WEEKLY MENU (all 7 days for first 5 plans as samples)
-- ============================================================
-- Spice Weekly Veg (mp-001)
INSERT INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description) VALUES
('wm-001', 'mp-001', 'r-indian-001', 'Monday', 'Masala Dosa with Sambar', 'Dal Makhani with Jeera Rice', 'Paneer Butter Masala with Naan', 280, 480, 420, 'A wholesome Monday to start the week right'),
('wm-002', 'mp-001', 'r-indian-001', 'Tuesday', 'Poha with Chai', 'Chole Bhature', 'Aloo Gobhi with Roti', 220, 560, 380, 'Traditional home-style Indian comfort food'),
('wm-003', 'mp-001', 'r-indian-001', 'Wednesday', 'Idli Sambar', 'Rajma Chawal', 'Palak Paneer with Chapati', 200, 520, 400, 'Protein-rich mid-week nourishment'),
('wm-004', 'mp-001', 'r-indian-001', 'Thursday', 'Upma with Coconut Chutney', 'Baingan Bharta with Roti', 'Mixed Veg Curry with Rice', 240, 440, 460, 'Flavorful Thursday spread with variety'),
('wm-005', 'mp-001', 'r-indian-001', 'Friday', 'Besan Chilla with Green Chutney', 'Kadai Paneer with Naan', 'Dal Tadka with Jeera Rice', 260, 500, 420, 'Rich and festive Friday menu'),
('wm-006', 'mp-001', 'r-indian-001', 'Saturday', 'Paratha with Curd', 'Veg Biryani with Raita', 'Shahi Paneer with Lachha Paratha', 380, 580, 540, 'Special weekend indulgence menu'),
('wm-007', 'mp-001', 'r-indian-001', 'Sunday', 'Puri Bhaji', 'Malai Kofta with Rice', 'Paneer Tikka with Mint Chutney', 420, 620, 480, 'Festive Sunday menu to end the week');

-- Italian Weekly Veg (mp-007)
INSERT INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description) VALUES
('wm-008', 'mp-007', 'r-italian-001', 'Monday', 'Bruschetta al Pomodoro', 'Margherita Pizza', 'Pasta Primavera', 240, 580, 520, 'Classic Italian Monday to kick off the week'),
('wm-009', 'mp-007', 'r-italian-001', 'Tuesday', 'Caprese Salad', 'Penne Arrabbiata', 'Risotto ai Funghi', 280, 540, 560, 'Rich mushroom and tomato Tuesday'),
('wm-010', 'mp-007', 'r-italian-001', 'Wednesday', 'Frittata Verdure', 'Lasagna Vegetariana', 'Minestrone Soup with Focaccia', 360, 680, 420, 'Hearty mid-week Italian comfort'),
('wm-011', 'mp-007', 'r-italian-001', 'Thursday', 'Yogurt with Honey and Walnuts', 'Tagliatelle al Pesto', 'Pizza Quattro Formaggi', 220, 580, 640, 'Cheese and herb Thursday delight'),
('wm-012', 'mp-007', 'r-italian-001', 'Friday', 'Granola con Frutta', 'Eggplant Parmigiana', 'Gnocchi al Pomodoro', 300, 560, 580, 'Light start, hearty Friday dinner'),
('wm-013', 'mp-007', 'r-italian-001', 'Saturday', 'Pancakes con Nutella', 'Ribollita Toscana', 'Spaghetti Aglio e Olio with Tiramisu', 420, 500, 740, 'Weekend Italian luxury spread'),
('wm-014', 'mp-007', 'r-italian-001', 'Sunday', 'Cornetto e Cappuccino', 'Pasta al Forno', 'Pizza Diavola with Chocolate Lava Cake', 380, 640, 860, 'Ultimate Italian Sunday feast');

-- Green Weekly Reset (mp-013)
INSERT INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description) VALUES
('wm-015', 'mp-013', 'r-healthy-001', 'Monday', 'Acai Smoothie Bowl', 'Quinoa Power Bowl', 'Lentil Soup with Whole Grain Bread', 320, 420, 340, 'Energizing start to the clean eating week'),
('wm-016', 'mp-013', 'r-healthy-001', 'Tuesday', 'Greek Yogurt with Berries', 'Grilled Chicken Salad', 'Baked Salmon with Steamed Broccoli', 280, 380, 420, 'High protein, lean Tuesday menu'),
('wm-017', 'mp-013', 'r-healthy-001', 'Wednesday', 'Overnight Oats with Chia', 'Buddha Bowl with Tahini', 'Vegetable Stir Fry with Brown Rice', 310, 440, 380, 'Plant-powered mid-week reset'),
('wm-018', 'mp-013', 'r-healthy-001', 'Thursday', 'Green Smoothie + Boiled Eggs', 'Chickpea Mediterranean Salad', 'Turkey Lettuce Wraps', 260, 360, 310, 'Low calorie, high fiber Thursday'),
('wm-019', 'mp-013', 'r-healthy-001', 'Friday', 'Banana Pancakes (2 ingredient)', 'Kale Caesar Salad', 'Grilled Tofu with Quinoa', 340, 320, 400, 'Light and clean Friday eating'),
('wm-020', 'mp-013', 'r-healthy-001', 'Saturday', 'Avocado Toast on Sourdough', 'Rainbow Veggie Bowl', 'Baked Sweet Potato with Black Beans', 380, 440, 420, 'Colorful and nutritious Saturday'),
('wm-021', 'mp-013', 'r-healthy-001', 'Sunday', 'Detox Green Juice + Granola Bowl', 'Power Protein Salad', 'Cauliflower Rice Stir Fry', 300, 400, 350, 'Reset Sunday for a fresh week ahead');

-- Sushi Weekly Plan (mp-010)
INSERT INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description) VALUES
('wm-022', 'mp-010', 'r-japanese-001', 'Monday', 'Tamago Gohan (Egg over Rice)', 'Sushi Platter (12 pcs)', 'Tonkotsu Ramen', 280, 380, 720, 'Authentic Japanese Monday journey'),
('wm-023', 'mp-010', 'r-japanese-001', 'Tuesday', 'Miso Soup with Tofu', 'Dragon Roll Set', 'Teriyaki Chicken Bento', 180, 420, 540, 'Balanced flavors of Japan on Tuesday'),
('wm-024', 'mp-010', 'r-japanese-001', 'Wednesday', 'Matcha Pancakes', 'Salmon Poke Bowl', 'Vegetable Tempura Udon', 340, 460, 520, 'Mid-week Japanese fusion experience'),
('wm-025', 'mp-010', 'r-japanese-001', 'Thursday', 'Japanese Style Oatmeal', 'Rainbow Roll Set', 'Shoyu Ramen with Chashu', 290, 400, 680, 'Umami-rich Thursday selection'),
('wm-026', 'mp-010', 'r-japanese-001', 'Friday', 'Onigiri (2 pcs)', 'Spicy Tuna Roll Set', 'Shabu Shabu Hot Pot', 320, 440, 580, 'Festive Japanese Friday evening'),
('wm-027', 'mp-010', 'r-japanese-001', 'Saturday', 'Japanese Breakfast Plate', 'Chef Special Omakase (6 pcs)', 'Wagyu Beef Ramen', 380, 560, 780, 'Premium Saturday Japanese experience'),
('wm-028', 'mp-010', 'r-japanese-001', 'Sunday', 'Tamagoyaki with Rice', 'Sashimi Platter', 'Katsu Curry with Rice', 310, 340, 620, 'Elegant Sunday Japanese feast');

-- Burger Weekly Box (mp-004)
INSERT INTO weekly_menu (id, meal_plan_id, restaurant_id, day_of_week, breakfast_name, lunch_name, dinner_name, breakfast_calories, lunch_calories, dinner_calories, description) VALUES
('wm-029', 'mp-004', 'r-burger-001', 'Monday', 'Egg Muffin Sandwich', 'Gourmet Classic Burger + Fries', NULL, 420, 840, NULL, 'Power start Monday with gourmet burger'),
('wm-030', 'mp-004', 'r-burger-001', 'Tuesday', 'Banana Protein Shake', 'Veggie Supreme Burger + Salad', NULL, 280, 640, NULL, 'Light and nutritious Tuesday'),
('wm-031', 'mp-004', 'r-burger-001', 'Wednesday', 'Avocado Toast', 'BBQ Chicken Burger + Cheese Fries', NULL, 360, 1020, NULL, 'Mid-week indulgent lunch'),
('wm-032', 'mp-004', 'r-burger-001', 'Thursday', 'Yogurt Parfait', 'Mushroom Swiss Burger + Rings', NULL, 310, 780, NULL, 'Umami Thursday burger delight'),
('wm-033', 'mp-004', 'r-burger-001', 'Friday', 'Smoothie Bowl', 'Double Stack Burger + Loaded Fries', NULL, 340, 1100, NULL, 'TGIF burger extravaganza'),
('wm-034', 'mp-004', 'r-burger-001', 'Saturday', 'Pancake Stack', 'Pulled Pork Burger + Coleslaw', NULL, 560, 920, NULL, 'Weekend special pulled pork edition'),
('wm-035', 'mp-004', 'r-burger-001', 'Sunday', 'Full English Breakfast', 'Premium Wagyu Burger + Truffle Fries', NULL, 680, 1200, NULL, 'Luxury Sunday burger experience');

-- ============================================================
-- COUPONS
-- ============================================================
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, max_uses, used_count, is_active, expires_at) VALUES
('c-001', 'WELCOME10', 'percent', 10.00, 200.00, 100.00, 1000, 45, TRUE, DATE_ADD(NOW(), INTERVAL 90 DAY)),
('c-002', 'DIET20', 'percent', 20.00, 500.00, 200.00, 500, 12, TRUE, DATE_ADD(NOW(), INTERVAL 60 DAY)),
('c-003', 'FIRST50', 'flat', 50.00, 300.00, 50.00, 200, 88, TRUE, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('c-004', 'SAVE100', 'flat', 100.00, 800.00, 100.00, 100, 5, TRUE, DATE_ADD(NOW(), INTERVAL 45 DAY)),
('c-005', 'WEEKEND15', 'percent', 15.00, 400.00, 150.00, 300, 0, TRUE, DATE_ADD(NOW(), INTERVAL 120 DAY));

-- ============================================================
-- MEMBERSHIPS (Silver, Gold, Platinum)
-- ============================================================
INSERT INTO memberships (id, name, price, duration_days, perks, subscription_discount, free_deliveries, is_active) VALUES
('mem-001', 'Silver', 299.00, 30, '["5% off on all orders","2 free deliveries per month","Priority customer support","Early access to new restaurants"]', 5, 2, TRUE),
('mem-002', 'Gold', 599.00, 30, '["10% off on all orders","10 free deliveries per month","Priority customer support","Early access to new restaurants","Exclusive member deals","Birthday discount 20%"]', 10, 10, TRUE),
('mem-003', 'Platinum', 999.00, 30, '["15% off on all orders","Unlimited free deliveries","24/7 dedicated support","Early access to new restaurants","Exclusive member deals","Birthday discount 30%","Monthly surprise box","Personal nutritionist consultation"]', 15, 9999, TRUE);

-- ============================================================
-- WALLETS
-- ============================================================
INSERT INTO wallet (id, user_id, balance) VALUES
('w-001', 'u-user-001', 1250.00),
('w-002', 'u-user-002', 500.00),
('w-003', 'u-user-003', 2000.00),
('w-004', 'u-user-004', 0.00),
('w-admin-001', 'u-admin-001', 0.00);

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, reference_id) VALUES
('wt-001', 'w-001', 'credit', 2000.00, 'Wallet recharge via UPI', 'UPI-TXN-20240101'),
('wt-002', 'w-001', 'debit', 750.00, 'Payment for order #ORD-001', 'ORD-001'),
('wt-003', 'w-002', 'credit', 1000.00, 'Wallet recharge via card', 'CARD-TXN-20240102'),
('wt-004', 'w-002', 'debit', 500.00, 'Subscription payment', 'SUB-001'),
('wt-005', 'w-003', 'credit', 5000.00, 'Wallet recharge via netbanking', 'NET-TXN-20240103'),
('wt-006', 'w-003', 'debit', 2999.00, 'Subscription payment for Sushi Weekly', 'SUB-002'),
('wt-007', 'w-003', 'credit', 100.00, 'Refund for cancelled order', 'REFUND-001');

-- ============================================================
-- USER MEMBERSHIPS
-- ============================================================
INSERT INTO user_memberships (id, user_id, membership_id, start_date, end_date, is_active) VALUES
('um-001', 'u-user-001', 'mem-002', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE),
('um-002', 'u-user-003', 'mem-003', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
INSERT INTO subscriptions (id, user_id, restaurant_id, meal_plan_id, start_date, end_date, status, paused_until, auto_renew, delivery_address, total_amount) VALUES
('sub-001', 'u-user-001', 'r-indian-001', 'mp-001', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'active', NULL, TRUE, '12 Park Street, Mumbai, Maharashtra 400002', 1499.00),
('sub-002', 'u-user-003', 'r-japanese-001', 'mp-010', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'active', NULL, FALSE, '78 Lake View, Hyderabad, Telangana 500001', 2999.00),
('sub-003', 'u-user-002', 'r-healthy-001', 'mp-013', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'active', NULL, TRUE, '45 MG Road, Bengaluru, Karnataka 560001', 2499.00);

-- ============================================================
-- DELIVERIES (sample for today and past days)
-- ============================================================
INSERT INTO deliveries (id, subscription_id, user_id, delivery_date, meal_type, delivery_status, delivery_time, notes) VALUES
('del-001', 'sub-001', 'u-user-001', CURDATE(), 'breakfast', 'delivered', '08:30:00', 'Left at door'),
('del-002', 'sub-001', 'u-user-001', CURDATE(), 'lunch', 'out_for_delivery', '12:45:00', NULL),
('del-003', 'sub-001', 'u-user-001', CURDATE(), 'dinner', 'pending', NULL, NULL),
('del-004', 'sub-002', 'u-user-003', CURDATE(), 'breakfast', 'delivered', '08:15:00', NULL),
('del-005', 'sub-002', 'u-user-003', CURDATE(), 'lunch', 'preparing', NULL, NULL),
('del-006', 'sub-003', 'u-user-002', CURDATE(), 'breakfast', 'delivered', '07:45:00', 'Ring bell twice'),
('del-007', 'sub-003', 'u-user-002', CURDATE(), 'lunch', 'out_for_delivery', '13:00:00', NULL),
('del-008', 'sub-001', 'u-user-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'breakfast', 'delivered', '08:20:00', NULL),
('del-009', 'sub-001', 'u-user-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'lunch', 'delivered', '12:30:00', NULL),
('del-010', 'sub-001', 'u-user-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'dinner', 'delivered', '19:15:00', NULL);

-- ============================================================
-- ORDERS
-- ============================================================
INSERT INTO orders (id, user_id, restaurant_id, total_amount, status, coupon_id, payment_id, delivery_address, special_instructions) VALUES
('ord-001', 'u-user-001', 'r-indian-001', 750.00, 'delivered', 'c-001', NULL, '12 Park Street, Mumbai, Maharashtra 400002', 'Extra spicy please'),
('ord-002', 'u-user-002', 'r-burger-001', 630.00, 'preparing', NULL, NULL, '45 MG Road, Bengaluru, Karnataka 560001', 'No onions in the burger'),
('ord-003', 'u-user-003', 'r-japanese-001', 1170.00, 'confirmed', 'c-003', NULL, '78 Lake View, Hyderabad, Telangana 500001', NULL),
('ord-004', 'u-user-004', 'r-italian-001', 700.00, 'pending', NULL, NULL, '33 Anna Salai, Chennai, Tamil Nadu 600002', 'Well done pasta');

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO order_items (id, order_id, food_id, quantity, price) VALUES
('oi-001', 'ord-001', 'f-001', 1, 320.00),
('oi-002', 'ord-001', 'f-003', 1, 350.00),
('oi-003', 'ord-001', 'f-002', 1, 280.00),
('oi-004', 'ord-002', 'f-006', 1, 350.00),
('oi-005', 'ord-002', 'f-009', 1, 180.00),
('oi-006', 'ord-002', 'f-008', 1, 320.00),
('oi-007', 'ord-003', 'f-014', 1, 650.00),
('oi-008', 'ord-003', 'f-015', 1, 480.00),
('oi-009', 'ord-003', 'f-016', 1, 350.00),
('oi-010', 'ord-004', 'f-010', 1, 420.00),
('oi-011', 'ord-004', 'f-011', 1, 380.00),
('oi-012', 'ord-004', 'f-012', 1, 280.00);

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO payments (id, user_id, order_id, subscription_id, amount, status, method, transaction_id) VALUES
('pay-001', 'u-user-001', 'ord-001', NULL, 675.00, 'success', 'wallet', 'TXN-MM-20240101-001'),
('pay-002', 'u-user-002', 'ord-002', NULL, 630.00, 'pending', 'upi', 'TXN-MM-20240102-002'),
('pay-003', 'u-user-003', 'ord-003', NULL, 1120.00, 'success', 'card', 'TXN-MM-20240103-003'),
('pay-004', 'u-user-001', NULL, 'sub-001', 1499.00, 'success', 'wallet', 'TXN-MM-20240104-004'),
('pay-005', 'u-user-003', NULL, 'sub-002', 2999.00, 'success', 'wallet', 'TXN-MM-20240105-005'),
('pay-006', 'u-user-002', NULL, 'sub-003', 2499.00, 'success', 'netbanking', 'TXN-MM-20240106-006');

-- ============================================================
-- RATINGS
-- ============================================================
INSERT INTO ratings (id, user_id, food_id, restaurant_id, meal_plan_id, stars, review_text) VALUES
('rat-001', 'u-user-001', 'f-001', NULL, NULL, 5, 'Absolutely amazing butter chicken! The sauce was perfectly balanced and the chicken was incredibly tender. Will definitely order again!'),
('rat-002', 'u-user-001', NULL, 'r-indian-001', NULL, 5, 'Spice Garden is hands down the best Indian restaurant I have tried. Authentic flavors, generous portions, and quick delivery!'),
('rat-003', 'u-user-002', 'f-006', NULL, NULL, 4, 'Great burger with quality ingredients. The brioche bun was fresh and the patty was perfectly cooked. A bit pricey but worth it.'),
('rat-004', 'u-user-002', NULL, 'r-burger-001', NULL, 4, 'Consistently good burgers. The loaded cheese fries are addictive. Delivery is always on time.'),
('rat-005', 'u-user-003', 'f-014', NULL, NULL, 5, 'Best sushi I have had outside of Japan! The fish is incredibly fresh and the presentation is beautiful. Highly recommend!'),
('rat-006', 'u-user-003', NULL, 'r-japanese-001', NULL, 5, 'Sakura Sushi is a gem! Authentic Japanese experience with premium ingredients. The ramen is soul-warming.'),
('rat-007', 'u-user-004', 'f-010', NULL, NULL, 4, 'Classic Margherita done right. Simple, fresh ingredients with a perfect char on the crust. Reminds me of Naples!'),
('rat-008', 'u-user-001', NULL, NULL, 'mp-001', 5, 'The Spice Weekly Veg plan is incredible value for money. Fresh food every day, great variety, and on-time delivery!'),
('rat-009', 'u-user-003', NULL, NULL, 'mp-010', 5, 'The Sushi Weekly Plan exceeded all expectations. Every day brings something new and exciting. Absolutely love it!'),
('rat-010', 'u-user-002', NULL, NULL, 'mp-013', 4, 'Green Bowl weekly plan helped me eat healthier without sacrificing taste. The nutritionist-designed menus really make a difference.');

-- ============================================================
-- CART (current cart items for users)
-- ============================================================
INSERT INTO cart (id, user_id, food_id, quantity) VALUES
('cart-001', 'u-user-002', 'f-018', 2),
('cart-002', 'u-user-002', 'f-020', 1),
('cart-003', 'u-user-004', 'f-011', 1),
('cart-004', 'u-user-004', 'f-012', 2);

-- ============================================================
-- WISHLIST
-- ============================================================
INSERT INTO wishlist (id, user_id, food_id) VALUES
('wish-001', 'u-user-001', 'f-014'),
('wish-002', 'u-user-001', 'f-015'),
('wish-003', 'u-user-002', 'f-001'),
('wish-004', 'u-user-003', 'f-011'),
('wish-005', 'u-user-004', 'f-006');

-- ============================================================
-- OFFERS
-- ============================================================
INSERT INTO offers (id, restaurant_id, title, description, discount_percent, valid_from, valid_to, is_active) VALUES
('off-001', 'r-indian-001', 'Weekend Indian Feast', 'Get 20% off on all orders above ₹500 this weekend. Enjoy authentic Indian flavors at a great price!', 20, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), TRUE),
('off-002', 'r-burger-001', 'Burger Monday Madness', 'Buy any 2 burgers and get fries free every Monday. Best burger deals in town!', 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE),
('off-003', 'r-italian-001', 'Italian Happy Hours', '15% off on all pizzas and pastas between 3PM-6PM daily. Authentic Italian at a discount!', 15, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), TRUE),
('off-004', 'r-japanese-001', 'Sushi Saturday Special', '25% off on all sushi platters every Saturday. Fresh, premium sushi at unbeatable prices!', 25, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), TRUE),
('off-005', 'r-healthy-001', 'New Year Detox Deal', '30% off on all detox plans for the new year health kick. Start 2024 right with Green Bowl!', 30, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY), TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Update restaurant ratings from actual ratings data
-- ============================================================
UPDATE restaurants r 
SET rating = (
    SELECT COALESCE(ROUND(AVG(rt.stars), 2), 0) 
    FROM ratings rt 
    WHERE rt.restaurant_id = r.id
)
WHERE EXISTS (
    SELECT 1 FROM ratings rt WHERE rt.restaurant_id = r.id
);

-- ============================================================
-- Done - MealMatrix v2 Seed Data Inserted
-- ============================================================
