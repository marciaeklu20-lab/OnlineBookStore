-- ============================================================
-- BookFlow Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- GENRES
-- ============================================================
INSERT INTO genres (name, slug, emoji, display_order) VALUES
  ('Fiction',       'fiction',      '📖', 1),
  ('Non-Fiction',   'non-fiction',  '🧠', 2),
  ('Biography',     'biography',    '👤', 3),
  ('Business',      'business',     '💼', 4),
  ('Science',       'science',      '🔬', 5),
  ('Self-Help',     'self-help',    '🌱', 6),
  ('Children',      'children',     '🎨', 7),
  ('Religion',      'religion',     '✝️', 8),
  ('Education',     'education',    '🎓', 9),
  ('Technology',    'technology',   '💻', 10),
  ('Young Adult',   'young-adult',  '🌟', 11),
  ('History',       'history',      '📜', 12),
  ('Romance',       'romance',      '❤️', 13),
  ('Thriller',      'thriller',     '🔪', 14),
  ('Philosophy',    'philosophy',   '🤔', 15);

-- ============================================================
-- AUTHORS
-- ============================================================
INSERT INTO authors (id, name, bio, nationality) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'James Clear',         'Author of Atomic Habits, expert on habits and performance.',                          'American'),
  ('a1000000-0000-0000-0000-000000000002', 'Paulo Coelho',        'Brazilian lyricist and novelist, author of The Alchemist.',                           'Brazilian'),
  ('a1000000-0000-0000-0000-000000000003', 'Yuval Noah Harari',   'Israeli public intellectual, historian and professor.',                               'Israeli'),
  ('a1000000-0000-0000-0000-000000000004', 'Robert T. Kiyosaki',  'American businessman and author of Rich Dad Poor Dad.',                               'American'),
  ('a1000000-0000-0000-0000-000000000005', 'Eckhart Tolle',       'Spiritual teacher and best-selling author of The Power of Now.',                      'German-Canadian'),
  ('a1000000-0000-0000-0000-000000000006', 'Napoleon Hill',       'American self-help author, best known for Think and Grow Rich.',                      'American'),
  ('a1000000-0000-0000-0000-000000000007', 'George Orwell',       'English novelist and critic, author of 1984 and Animal Farm.',                        'British'),
  ('a1000000-0000-0000-0000-000000000008', 'Cal Newport',         'Computer science professor and author on deep work and digital minimalism.',           'American'),
  ('a1000000-0000-0000-0000-000000000009', 'Malcolm Gladwell',    'Canadian journalist and author of The Tipping Point and Outliers.',                   'Canadian'),
  ('a1000000-0000-0000-0000-000000000010', 'Brené Brown',         'Research professor and author on vulnerability, courage and empathy.',                 'American'),
  ('a1000000-0000-0000-0000-000000000011', 'Michelle Obama',      'Former First Lady of the United States and author of Becoming.',                      'American'),
  ('a1000000-0000-0000-0000-000000000012', 'Chimamanda Ngozi Adichie', 'Nigerian author of Purple Hibiscus, Half of a Yellow Sun and Americanah.',       'Nigerian');

-- ============================================================
-- PUBLISHERS
-- ============================================================
INSERT INTO publishers (id, name, country) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Avery Publishing',     'USA'),
  ('b1000000-0000-0000-0000-000000000002', 'HarperOne',            'USA'),
  ('b1000000-0000-0000-0000-000000000003', 'Harvill Secker',       'UK'),
  ('b1000000-0000-0000-0000-000000000004', 'Warner Books',         'USA'),
  ('b1000000-0000-0000-0000-000000000005', 'New World Library',    'USA'),
  ('b1000000-0000-0000-0000-000000000006', 'Meridian',             'USA'),
  ('b1000000-0000-0000-0000-000000000007', 'Secker & Warburg',     'UK'),
  ('b1000000-0000-0000-0000-000000000008', 'Grand Central',        'USA'),
  ('b1000000-0000-0000-0000-000000000009', 'Little Brown',         'USA'),
  ('b1000000-0000-0000-0000-000000000010', 'Random House',         'USA'),
  ('b1000000-0000-0000-0000-000000000011', 'Penguin Books',        'UK'),
  ('b1000000-0000-0000-0000-000000000012', 'Fourth Estate',        'UK');

-- ============================================================
-- BOOKS
-- ============================================================
INSERT INTO books (id, isbn, title, slug, description, author_id, publisher_id, publication_date, page_count, price_paperback, price_digital, currency, featured, bestseller, formats) VALUES

  ('c1000000-0000-0000-0000-000000000001',
   '9780735211292', 'Atomic Habits',
   'atomic-habits',
   'An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving every day.',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   '2018-10-16', 320, 45.00, 28.00, 'GHS', TRUE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": true, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000002',
   '9780062315007', 'The Alchemist',
   'the-alchemist',
   'A fable about following your dream. Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
   'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   '1988-01-01', 197, 38.00, 22.00, 'GHS', TRUE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000003',
   '9780062316097', 'Sapiens',
   'sapiens-a-brief-history-of-humankind',
   'A Brief History of Humankind. How did Homo sapiens come to dominate the world? Starting from examining the cognitive revolution 70,000 years ago.',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   '2011-01-01', 464, 52.00, 32.00, 'GHS', TRUE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": true, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000004',
   '9781612680194', 'Rich Dad Poor Dad',
   'rich-dad-poor-dad',
   'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not. The #1 Personal Finance book of all time.',
   'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004',
   '1997-04-01', 207, 42.00, 25.00, 'GHS', FALSE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000005',
   '9781577314806', 'The Power of Now',
   'the-power-of-now',
   'A Guide to Spiritual Enlightenment. To make the journey into the Now we will need to leave our analytical mind and its false created self behind.',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005',
   '1997-01-01', 236, 36.00, 20.00, 'GHS', FALSE, FALSE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000006',
   '9781585424337', 'Think and Grow Rich',
   'think-and-grow-rich',
   'The landmark bestseller now revised and updated for the 21st century. The most famous of all teachers of success spent years studying the wealthy.',
   'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006',
   '1937-01-01', 320, 30.00, 18.00, 'GHS', FALSE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": false, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000007',
   '9780451524935', '1984',
   '1984-george-orwell',
   'Written in 1948, 1984 was George Orwell''s chilling prophecy about the future. Big Brother is watching you.',
   'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000007',
   '1949-06-08', 328, 28.00, 16.00, 'GHS', FALSE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": true, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000008',
   '9781455586691', 'Deep Work',
   'deep-work',
   'Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task.',
   'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008',
   '2016-01-05', 296, 44.00, 27.00, 'GHS', FALSE, FALSE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000009',
   '9780316346627', 'Outliers',
   'outliers-the-story-of-success',
   'The Story of Success. In this stunning new book, Malcolm Gladwell takes us on an intellectual journey through the world of "outliers."',
   'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009',
   '2008-11-18', 309, 40.00, 24.00, 'GHS', FALSE, FALSE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000010',
   '9781592408412', 'Daring Greatly',
   'daring-greatly',
   'How the Courage to Be Vulnerable Transforms the Way We Live, Love, Parent, and Lead.',
   'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010',
   '2012-09-11', 320, 38.00, 23.00, 'GHS', FALSE, FALSE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000011',
   '9781524763138', 'Becoming',
   'becoming-michelle-obama',
   'An intimate, powerful, and inspiring memoir by the former First Lady of the United States.',
   'a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000011',
   '2018-11-13', 448, 50.00, 30.00, 'GHS', TRUE, TRUE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": true, "audiobook": true, "mobi": false}'),

  ('c1000000-0000-0000-0000-000000000012',
   '9780307455925', 'Americanah',
   'americanah',
   'A powerful, tender story of race and identity by the acclaimed author Chimamanda Ngozi Adichie.',
   'a1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000012',
   '2013-05-14', 477, 42.00, 26.00, 'GHS', TRUE, FALSE,
   '{"pdf": true, "epub": true, "paperback": true, "hardcover": false, "audiobook": true, "mobi": false}');

-- ============================================================
-- BOOK_GENRES (assign genres to books)
-- ============================================================
-- Atomic Habits → Self-Help, Business
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000001', id FROM genres WHERE slug IN ('self-help', 'business');

-- The Alchemist → Fiction, Philosophy
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000002', id FROM genres WHERE slug IN ('fiction', 'philosophy');

-- Sapiens → Non-Fiction, History, Science
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000003', id FROM genres WHERE slug IN ('non-fiction', 'history', 'science');

-- Rich Dad Poor Dad → Business, Self-Help
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000004', id FROM genres WHERE slug IN ('business', 'self-help');

-- The Power of Now → Self-Help, Philosophy, Religion
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000005', id FROM genres WHERE slug IN ('self-help', 'philosophy', 'religion');

-- Think and Grow Rich → Self-Help, Business
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000006', id FROM genres WHERE slug IN ('self-help', 'business');

-- 1984 → Fiction, Thriller
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000007', id FROM genres WHERE slug IN ('fiction', 'thriller');

-- Deep Work → Self-Help, Business, Technology
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000008', id FROM genres WHERE slug IN ('self-help', 'business', 'technology');

-- Outliers → Non-Fiction, Business
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000009', id FROM genres WHERE slug IN ('non-fiction', 'business');

-- Daring Greatly → Self-Help
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000010', id FROM genres WHERE slug IN ('self-help');

-- Becoming → Biography
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000011', id FROM genres WHERE slug IN ('biography');

-- Americanah → Fiction
INSERT INTO book_genres (book_id, genre_id) SELECT 'c1000000-0000-0000-0000-000000000012', id FROM genres WHERE slug IN ('fiction');

-- ============================================================
-- STARTER BADGES
-- ============================================================
INSERT INTO badges (slug, name, description, tier, rarity, condition_rule) VALUES
  ('first-purchase',  'First Chapter',     'Made your first purchase',               'bronze',   'common',    '{"type": "purchases", "value": 1}'),
  ('book-worm',       'Book Worm',         'Completed 5 books',                      'silver',   'uncommon',  '{"type": "books_completed", "value": 5}'),
  ('avid-reader',     'Avid Reader',       'Completed 25 books',                     'gold',     'rare',      '{"type": "books_completed", "value": 25}'),
  ('critic',          'Critic',            'Wrote 10 reviews',                       'silver',   'uncommon',  '{"type": "reviews_written", "value": 10}'),
  ('streak-7',        '7-Day Streak',      'Read for 7 days in a row',               'bronze',   'common',    '{"type": "reading_streak", "value": 7}'),
  ('streak-30',       'Monthly Reader',    'Read for 30 days in a row',              'gold',     'rare',      '{"type": "reading_streak", "value": 30}'),
  ('club-founder',    'Club Founder',      'Created your first book club',           'silver',   'uncommon',  '{"type": "clubs_created", "value": 1}'),
  ('bibliophile',     'Bibliophile',       'Purchased 50 books',                     'platinum', 'legendary', '{"type": "purchases", "value": 50}');
