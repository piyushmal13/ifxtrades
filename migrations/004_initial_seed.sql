-- Migration 004: Initial Institutional Seed Data

-- 1. Webinars
INSERT INTO webinars (slug, title, description, venue, sponsor_tier, hotel_sponsor, capacity, price, is_premium, registration_deadline, starts_at)
VALUES 
('macro-liquidity-divergence-2026', 
 'The Great Divergence: Institutional Macro Outlook (Q2 2026)', 
 'A deep-dive briefing for institutional mandates focusing on G7 rates dispersion, FX liquidity fragmentation, and systematic carry-trade risk governance.', 
 'The Savoy Executive Suite, London', 
 'PLATINUM', 
 'The Savoy', 
 150, 
 499.00, 
 TRUE, 
 NOW() + INTERVAL '10 days', 
 NOW() + INTERVAL '15 days'),
('hft-execution-surveillance', 
 'HFT Execution & Surveillance Frameworks', 
 'Technical roundtable on algorithmic order flow monitoring, transaction cost analysis (TCA), and anti-gaming execution logic for liquid FX pairs.', 
 'Virtual Broadcast Studio (Haverford)', 
 'GOLD', 
 NULL, 
 500, 
 0.00, 
 FALSE, 
 NOW() + INTERVAL '5 days', 
 NOW() + INTERVAL '7 days');

-- 2. Webinar Agenda Items
INSERT INTO webinar_agenda_items (webinar_id, time, topic, speaker_name, speaker_linkedin, sort_order)
SELECT id, '09:00 AM', 'Opening Remarks: Global Liquidity Map', 'Alexander Sterling', 'https://linkedin.com/in/sterlingsilva', 1 FROM webinars WHERE slug = 'macro-liquidity-divergence-2026';
INSERT INTO webinar_agenda_items (webinar_id, time, topic, speaker_name, sort_order)
SELECT id, '10:30 AM', 'G7 Rate Paths & Correlation Breakdowns', 'Dr. Elena Rossi', 2 FROM webinars WHERE slug = 'macro-liquidity-divergence-2026';

-- 3. Algorithms
INSERT INTO algorithms (slug, name, description, risk_classification, monthly_roi_pct, min_capital, price, compliance_disclaimer)
VALUES 
('ifx-genesis-8', 
 'IFX Genesis-8: HFT Correlation Scalper', 
 'State-of-the-art high-frequency mean reversion model targeting liquid G10 currency pairs with sub-millisecond execution response and dynamic risk envelopes.', 
 'HIGH', 
 5.85, 
 50000.00, 
 4500.00, 
 'Strategy utilize leveraged exposure. Minimum mandate adherence required for institutional access.'),
('alpha-flow-core', 
 'AlphaFlow Core: Macro Execution Suite', 
 'A robust systematic trend-following model utilizing multi-factor liquidity filters to capture long-term macro shifts in FX and precious metals.', 
 'MEDIUM', 
 3.40, 
 100000.00, 
 2900.00, 
 'Backtested results provided for informational purposes. Live execution subject to slippage and market depth.');

-- 4. University Courses
INSERT INTO university_courses (slug, title, category, description, plan_required)
VALUES 
('institutional-order-flow', 
 'Institutional Order Flow & Market Mechanics', 
 'INSTITUTIONAL', 
 'Master the mechanics of bank-level execution, VWAP/TWAP manipulation, and cross-exchange liquidity discovery.', 
 'premium'),
('macro-fundamentals-certification', 
 'Macro Fundamentals Certification (Level I)', 
 'BEGINNER', 
 'Foundational framework for understanding global rates, inflation transmission, and central bank balance sheet dynamics.', 
 'free');

-- 5. Course Lessons
INSERT INTO course_lessons (course_id, title, sort_order, duration_minutes, is_free)
SELECT id, 'Market Microstructure 101: The Order Book', 1, 45, TRUE FROM university_courses WHERE slug = 'institutional-order-flow';
INSERT INTO course_lessons (course_id, title, sort_order, duration_minutes, is_free)
SELECT id, 'Advanced VWAP Logic & Execution Algos', 2, 60, FALSE FROM university_courses WHERE slug = 'institutional-order-flow';

-- 6. Blog Posts
INSERT INTO blog_posts (slug, title, excerpt, body, category, author_name)
VALUES 
('erosion-of-g7-carry', 
 'The Erosion of G7 Carry: Navigating the New Macro Regime', 
 'Institutional research into the breakdown of traditional carry trade models and the rise of dispersion-driven volatility.', 
 'The landscape of global macro has shifted. As central banks diverge in their fight against inflationary lag, the traditional carry trade is being replaced by more sophisticated dispersion models...', 
 'Macro', 
 'IFX Research Desk'),
('hft-liquidity-traps', 
 'HFT Liquidity Traps: Identifying False Breakouts in FX', 
 'A technical analysis of algorithmic wash-trading and how to identify institutional-grade liquidity zones.', 
 'Order flow analysis reveal that many retail breakouts are actually liquidity traps designed by high-frequency market makers...', 
 'Technical Analysis', 
 'Dr. Marcus Vane');

-- 7. Reviews
INSERT INTO reviews (company_name, quote, broker_endorsement, is_featured)
VALUES 
('Belmont Asset Management', 
 'The transparency of the IFX Genesis-8 execution engine is unparalleled. It is the gold standard for our algorithmic mandate.', 
 'Regulated Execution Broker #1', 
 TRUE),
('Vanguard Partners (Geneva)', 
 'IFX University provides the only education track that actually bridges the gap between retail theory and bank-level reality.', 
 NULL, 
 TRUE);
