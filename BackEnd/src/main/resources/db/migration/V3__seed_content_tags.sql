-- V5_1__seed_content_tags: Default tag taxonomy
-- Renamed from V5__seed_content_tags.sql to avoid Flyway version conflict

INSERT INTO CONTENT_TAG (name, category) VALUES
-- SKILL
('GRAMMAR', 'SKILL'), ('VOCABULARY', 'SKILL'), ('READING', 'SKILL'), ('LISTENING', 'SKILL'),
-- TOPIC
('Daily Life', 'TOPIC'), ('Travel', 'TOPIC'), ('Food & Restaurant', 'TOPIC'), ('Work & Career', 'TOPIC'),
('Health & Body', 'TOPIC'), ('Technology', 'TOPIC'), ('Science', 'TOPIC'), ('Arts & Culture', 'TOPIC'),
('News & Media', 'TOPIC'), ('Environment', 'TOPIC'), ('Sports', 'TOPIC'), ('Music & Entertainment', 'TOPIC'),
('Business & Finance', 'TOPIC'), ('Academic', 'TOPIC'),
-- LEVEL
('A1', 'LEVEL'), ('A2', 'LEVEL'), ('B1', 'LEVEL'), ('B2', 'LEVEL'), ('C1', 'LEVEL'), ('C2', 'LEVEL'),
-- TYPE
('Conversation', 'TYPE'), ('Grammar Focus', 'TYPE'), ('Vocabulary Builder', 'TYPE'), ('Listening Practice', 'TYPE'),
('Reading Comprehension', 'TYPE'), ('Writing Practice', 'TYPE'), ('Pronunciation', 'TYPE');
