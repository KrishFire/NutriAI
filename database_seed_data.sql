-- Seed Data for NutriAI Database
-- Run this AFTER running database_setup.sql and database_rls_policies.sql

-- Insert common food items for testing and user convenience
INSERT INTO public.food_items (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, verified) VALUES
-- Fruits
('Apple', 'Generic', 1, 'medium (182g)', 95, 0.5, 25, 0.3, 4.4, true),
('Banana', 'Generic', 1, 'medium (118g)', 105, 1.3, 27, 0.4, 3.1, true),
('Orange', 'Generic', 1, 'medium (154g)', 62, 1.2, 15.4, 0.2, 3.1, true),
('Strawberries', 'Generic', 1, 'cup (152g)', 49, 1, 11.7, 0.5, 3, true),

-- Vegetables
('Broccoli', 'Generic', 1, 'cup chopped (91g)', 25, 3, 5, 0.3, 2.3, true),
('Spinach', 'Generic', 1, 'cup raw (30g)', 7, 0.9, 1.1, 0.1, 0.7, true),
('Carrots', 'Generic', 1, 'medium (61g)', 25, 0.5, 6, 0.1, 1.7, true),
('Sweet Potato', 'Generic', 1, 'medium baked (114g)', 112, 2, 26, 0.1, 3.9, true),

-- Proteins
('Chicken Breast', 'Generic', 100, 'grams', 165, 31, 0, 3.6, 0, true),
('Salmon', 'Generic', 100, 'grams', 208, 20, 0, 13, 0, true),
('Eggs', 'Generic', 1, 'large (50g)', 70, 6, 0.6, 5, 0, true),
('Greek Yogurt', 'Fage', 170, 'grams', 100, 18, 6, 0, 0, true),

-- Grains
('Brown Rice', 'Generic', 1, 'cup cooked (195g)', 216, 5, 45, 1.8, 3.5, true),
('Oatmeal', 'Generic', 1, 'cup cooked (234g)', 147, 6, 25, 3, 4, true),
('Quinoa', 'Generic', 1, 'cup cooked (185g)', 222, 8, 39, 3.6, 5.2, true),
('Whole Wheat Bread', 'Generic', 1, 'slice (28g)', 81, 4, 14, 1.1, 1.9, true),

-- Nuts and Seeds
('Almonds', 'Generic', 28, 'grams (about 23 nuts)', 164, 6, 6, 14, 3.5, true),
('Peanut Butter', 'Jif', 32, 'grams (2 tbsp)', 190, 8, 8, 16, 2, true),
('Chia Seeds', 'Generic', 28, 'grams (2 tbsp)', 137, 4.4, 12, 8.6, 10.6, true),

-- Dairy
('Milk', 'Generic', 240, 'ml (1 cup)', 149, 8, 12, 8, 0, true),
('Cheddar Cheese', 'Generic', 28, 'grams (1 slice)', 113, 7, 1, 9, 0, true),

-- Common Prepared Foods
('Avocado Toast', 'Generic', 1, 'slice bread + 1/2 avocado', 250, 8, 20, 18, 8, true),
('Caesar Salad', 'Generic', 1, 'serving (85g)', 180, 4, 8, 16, 2, true),
('Protein Smoothie', 'Generic', 1, 'cup (240ml)', 200, 25, 15, 5, 3, true);

-- Insert macro calculation functions for common goals
-- This would be used by the app to calculate daily targets

-- Example daily calorie calculations (these would be used by the app)
-- BMR calculation: Mifflin-St Jeor Equation
-- Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
-- Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

-- Activity multipliers:
-- Sedentary (little/no exercise): BMR × 1.2
-- Light activity (light exercise 1-3 days/week): BMR × 1.375
-- Moderate (moderate exercise 3-5 days/week): BMR × 1.55
-- Very active (hard exercise 6-7 days/week): BMR × 1.725
-- Extra active (very hard exercise, physical job): BMR × 1.9

-- Goal adjustments:
-- Weight loss: -500 calories/day (1 lb/week)
-- Maintain: +0 calories/day
-- Weight gain: +500 calories/day (1 lb/week)

-- Default macro split:
-- Protein: 30% of calories (4 cal/g)
-- Carbs: 40% of calories (4 cal/g)
-- Fat: 30% of calories (9 cal/g)