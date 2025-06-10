-- =============================================
-- VCS Bonus System - Sample Data Script
-- Run this in Supabase SQL Editor to populate the database with test data
-- =============================================

-- First, let's make sure we have the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. SAMPLE PRIZES
-- =============================================

INSERT INTO public.prizes (id, name, description, points, image_url, is_active) 
VALUES 
  (uuid_generate_v4(), 'VCS Hoodie', 'Stilingas VCS džemperis su logotipu. Minkštas ir šiltas.', 500, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', true),
  (uuid_generate_v4(), 'VCS Kepurė', 'Elegantiška VCS kepurė su logo. Tobulai tinka kasdienai.', 250, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', true),
  (uuid_generate_v4(), 'Programavimo knyga', 'Populiariausia programavimo knyga "Clean Code" lietuvių kalba.', 750, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', true),
  (uuid_generate_v4(), 'VCS Termosas', 'Izoliuotas termosas su VCS logotipu. Puikus karštiems gėrimams.', 350, 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400', true),
  (uuid_generate_v4(), 'Mechanical Keyboard', 'Aukštos kokybės mechaninė klaviatūra programuotojams.', 1200, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', true),
  (uuid_generate_v4(), 'VCS Marškinėliai', 'Kokybiški VCS marškinėliai su unikaliu dizainu.', 300, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true),
  (uuid_generate_v4(), 'Programuotojo pelė', 'Ergonomiška pelė ilgam darbui prie kompiuterio.', 450, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', true),
  (uuid_generate_v4(), 'VCS Krepšys', 'Praktiškas krepšys su VCS logo, tinkamas nešiojamam kompiuteriui.', 600, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', true),
  (uuid_generate_v4(), 'Coding Bootcamp voucher', 'Nuolaidos kuponas 20% specializuotam kursui (galioja 6 mėnesius).', 1000, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400', true),
  (uuid_generate_v4(), 'VCS Vanduo butelis', 'Ekologiškas vandens butelis su VCS logotipu.', 150, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', false);

-- =============================================
-- 2. SAMPLE CONTENT (FAQ, Rules)
-- =============================================

INSERT INTO public.content (page, content)
VALUES 
  ('faq', '## Dažnai užduodami klausimai

### Kaip gauti taškus?
Taškus galite gauti dalyvaudami VCS kursuose, seminaruose ir įvairiose veiklose. Taškų skaičius priklauso nuo kurso trukmės ir sudėtingumo.

### Kaip iškeisti taškus?
Taškus galite iškeisti į prizus "Prizai" skiltyje. Pasirinkite norimą prizą ir paspaudkite "Iškeisti". Administratorius patvirtins jūsų užklausą.

### Ar taškai turi galiojimo laiką?
Ne, taškai negalioja ir kaupiasi jūsų paskyroje iki jų iškeitimo.

### Kiek laiko užtrunka prizo patvirtinimas?
Paprastai prizo užklausa yra patvirtinama per 1-3 darbo dienas.

### Ar galiu atšaukti prizo užklausą?
Užklausas, kurios dar nepatvirtintos, galite atšaukti susisiekę su administratoriumi.'),
  
  ('rules', '## Bonus taškų sistemos taisyklės

### 1. Taškų gavimas
- Taškai skiriami už dalyvavimą VCS kursuose ir veiklose
- Taškų skaičius priklauso nuo kurso trukmės ir sudėtingumo
- Papildomi taškai gali būti skiriami už aktyvų dalyvavimą ir puikius rezultatus

### 2. Taškų naudojimas
- Taškus galite iškeisti į prizus bet kuriuo metu
- Vienu metu galite pateikti tik vieną prizo užklausą
- Patvirtinti prizai turi būti atsiimti per 30 dienų

### 3. Elgesio taisyklės
- Draudžiama perduoti taškus kitiems vartotojams
- Bandymas manipuliuoti sistema bus baudžiamas taškų atemimo
- Gerbkite kitus sistemos vartotojus

### 4. Administratorių teisės
- Administratoriai gali pridėti ar atimti taškus
- Administratoriai turi teisę atmesti prizo užklausas
- Sprendimas dėl sporų priimamas administratorių');

-- =============================================
-- 3. SAMPLE BONUS ENTRIES (Will be created after users are added)
-- Note: These will reference actual user IDs from auth.users table
-- You'll need to run the second part after creating some test users
-- =============================================

-- Sample bonus entries SQL (to be run after users are created):
/*
-- Replace USER_ID_1, USER_ID_2, etc. with actual user IDs from your auth.users table

INSERT INTO public.bonus_entries (user_id, user_name, course_name, price, points_awarded)
VALUES 
  ('USER_ID_1', 'Jonas Jonaitis', 'React pradmenys', 150.00, 300),
  ('USER_ID_1', 'Jonas Jonaitis', 'JavaScript ES6+', 120.00, 240),
  ('USER_ID_1', 'Jonas Jonaitis', 'Aktyvus dalyvavimas seminare', 0.00, 50),
  
  ('USER_ID_2', 'Petras Petraitis', 'Python programavimas', 180.00, 360),
  ('USER_ID_2', 'Petras Petraitis', 'Duomenų bazės', 140.00, 280),
  ('USER_ID_2', 'Petras Petraitis', 'Namų darbo atsiskaitymas', 0.00, 75),
  
  ('USER_ID_3', 'Ana Anaitė', 'Full Stack Developer', 400.00, 800),
  ('USER_ID_3', 'Ana Anaitė', 'UI/UX Design', 200.00, 400),
  ('USER_ID_3', 'Ana Anaitė', 'Projekto pristatymas', 0.00, 100);
*/

-- =============================================
-- 4. INSTRUCTIONS FOR COMPLETING SETUP
-- =============================================

/*
INSTRUCTIONS TO COMPLETE SAMPLE DATA SETUP:

1. Create test users manually through your application or Supabase Auth UI:
   - Create at least 3-4 test users
   - Make sure to note their user IDs from auth.users table

2. Update user profiles with points:
   After creating bonus entries, update user total points:
   
   UPDATE public.profiles 
   SET total_points = (
     SELECT COALESCE(SUM(points_awarded), 0) 
     FROM public.bonus_entries 
     WHERE user_id = profiles.id
   );

3. Create sample redemptions:
   
   INSERT INTO public.prize_redemptions (user_id, user_name, prize_id, prize_name, point_cost, status, requested_at)
   VALUES 
     ('USER_ID_1', 'Jonas Jonaitis', 'PRIZE_ID_1', 'VCS Hoodie', 500, 'pending', NOW()),
     ('USER_ID_2', 'Petras Petraitis', 'PRIZE_ID_2', 'VCS Kepurė', 250, 'approved', NOW() - INTERVAL '2 days'),
     ('USER_ID_3', 'Ana Anaitė', 'PRIZE_ID_3', 'Programavimo knyga', 750, 'rejected', NOW() - INTERVAL '1 day');

4. To get the actual IDs for prizes and users, run these queries:
   
   -- Get prize IDs:
   SELECT id, name FROM public.prizes ORDER BY name;
   
   -- Get user IDs:
   SELECT id, email FROM auth.users ORDER BY email;
   
   -- Get profile IDs:
   SELECT id, name, email FROM public.profiles ORDER BY name;
*/

-- =============================================
-- 5. HELPFUL QUERIES FOR TESTING
-- =============================================

-- Check all data:
-- SELECT 'Prizes' as table_name, COUNT(*) as count FROM public.prizes
-- UNION ALL
-- SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles  
-- UNION ALL
-- SELECT 'Bonus Entries' as table_name, COUNT(*) as count FROM public.bonus_entries
-- UNION ALL
-- SELECT 'Redemptions' as table_name, COUNT(*) as count FROM public.prize_redemptions
-- UNION ALL
-- SELECT 'Content' as table_name, COUNT(*) as count FROM public.content;

-- View user stats:
-- SELECT p.name, p.email, p.total_points, 
--        COUNT(be.id) as bonus_entries_count,
--        COUNT(pr.id) as redemptions_count
-- FROM public.profiles p
-- LEFT JOIN public.bonus_entries be ON p.id = be.user_id
-- LEFT JOIN public.prize_redemptions pr ON p.id = pr.user_id
-- GROUP BY p.id, p.name, p.email, p.total_points
-- ORDER BY p.total_points DESC;

COMMIT; 