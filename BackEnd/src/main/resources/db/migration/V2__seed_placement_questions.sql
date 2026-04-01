-- V2_1__seed_placement_questions: Sample placement questions for adaptive CEFR test
-- A1, A2, B1 bands per skill
-- Renamed from V2__seed_placement_questions.sql to avoid Flyway version conflict

-- GRAMMAR questions
INSERT INTO PLACEMENT_QUESTION (skill, cefr_band, difficulty_weight, question_text, correct_answer, explanation, option_a, option_b, option_c, option_d, is_active) VALUES
-- A1 Grammar
('GRAMMAR', 'A1', 0.1, 'She ___ a teacher.', 'is', 'A1: Subject-verb agreement', 'is', 'are', 'am', 'be', TRUE),
('GRAMMAR', 'A1', 0.15, 'I ___ to school every day.', 'go', 'A1: Simple present affirmative', 'go', 'going', 'goes', 'gone', TRUE),
('GRAMMAR', 'A1', 0.2, 'The cat is ___ the table.', 'on', 'A1: Preposition of place', 'on', 'in', 'at', 'to', TRUE),
('GRAMMAR', 'A1', 0.25, '___ name is Anna.', 'My', 'A1: Possessive adjectives', 'My', 'I', 'Me', 'Mine', TRUE),
('GRAMMAR', 'A1', 0.3, 'I ___ like coffee.', 'do not', 'A1: Simple present negative', 'do not', 'does not', 'am not', 'not', TRUE),
('GRAMMAR', 'A1', 0.35, 'This is ___ apple.', 'an', 'A1: Indefinite article', 'an', 'a', 'the', 'some', TRUE),
('GRAMMAR', 'A1', 0.4, 'They ___ playing football now.', 'are', 'A1: Present continuous', 'are', 'is', 'am', 'do', TRUE),

-- A2 Grammar
('GRAMMAR', 'A2', 0.3, 'If I ___ rich, I would travel the world.', 'were', 'A2: Second conditional', 'were', 'am', 'will be', 'be', TRUE),
('GRAMMAR', 'A2', 0.35, 'She has lived here ___ 2010.', 'since', 'A2: Time expressions', 'since', 'for', 'during', 'while', TRUE),
('GRAMMAR', 'A2', 0.4, 'He asked me where I ___.', 'lived', 'A2: Reported speech (past simple)', 'lived', 'live', 'living', 'am living', TRUE),
('GRAMMAR', 'A2', 0.45, 'The book ___ by millions of people.', 'has been read', 'A2: Present perfect passive', 'has been read', 'has read', 'is reading', 'was read', TRUE),
('GRAMMAR', 'A2', 0.5, 'I wish I ___ harder at school.', 'had studied', 'A2: Third conditional / wish past', 'had studied', 'study', 'studied', 'would study', TRUE),
('GRAMMAR', 'A2', 0.55, 'I need ___ sugar. Can you pass me the ___?', 'some, sugar', 'A2: Countable vs uncountable nouns', 'some, sugar', 'any, sugar', 'some, sugars', 'a, sugars', TRUE),
('GRAMMAR', 'A2', 0.6, 'He was so tired that he ___ asleep immediately.', 'fell', 'A2: Past simple vs continuous + result', 'fell', 'fall', 'was falling', 'has fallen', TRUE),

-- B1 Grammar
('GRAMMAR', 'B1', 0.45, 'By the time I arrived, they ___ already ___.', 'had, left', 'B1: Past perfect simple', 'had, left', 'have, left', 'left', 'were leaving', TRUE),
('GRAMMAR', 'B1', 0.5, 'I suggest ___ the meeting until tomorrow.', 'postponing', 'B1: Gerund vs infinitive after verbs', 'postponing', 'to postpone', 'postpone', 'postponed', TRUE),
('GRAMMAR', 'B1', 0.55, '___ he was tired, he finished the project.', 'Although', 'B1: Subordinating conjunctions', 'Although', 'Because', 'So', 'However', TRUE),
('GRAMMAR', 'B1', 0.6, 'Had I known about the traffic, I ___ earlier.', 'would have left', 'B1: Third conditional inversion', 'would have left', 'would leave', 'left', 'had left', TRUE),
('GRAMMAR', 'B1', 0.65, 'The report ___ by the committee before the deadline.', 'must be reviewed', 'B1: Modal verbs for deduction', 'must be reviewed', 'can review', 'should review', 'might reviewed', TRUE),
('GRAMMAR', 'B1', 0.7, 'It is essential that every student ___ the exam.', 'take', 'B1: Subjunctive (mandative)', 'take', 'takes', 'took', 'taken', TRUE),
('GRAMMAR', 'B1', 0.75, 'She gave ___ impressive presentation ___ I have ever seen.', 'the most, that', 'B1: Superlative + relative clause', 'the most, that', 'more, which', 'most, what', 'very, that', TRUE),

-- VOCABULARY questions
-- A1 Vocabulary
('VOCABULARY', 'A1', 0.1, 'What is the opposite of HOT?', 'cold', 'A1: Basic adjectives', 'cold', 'warm', 'big', 'small', TRUE),
('VOCABULARY', 'A1', 0.15, 'How many ___ are there in a week?', 'days', 'A1: Time vocabulary', 'days', 'hours', 'months', 'minutes', TRUE),
('VOCABULARY', 'A1', 0.2, 'You can buy food at the ___.', 'supermarket', 'A1: Places', 'supermarket', 'library', 'school', 'hospital', TRUE),
('VOCABULARY', 'A1', 0.25, 'The opposite of FAST is ___', 'slow', 'A1: Speed adjectives', 'slow', 'quick', 'good', 'new', TRUE),
('VOCABULARY', 'A1', 0.3, 'A dog is a type of ___', 'animal', 'A1: Basic categories', 'animal', 'plant', 'food', 'city', TRUE),
('VOCABULARY', 'A1', 0.35, 'When it rains, you should take an ___', 'umbrella', 'A1: Weather objects', 'umbrella', 'sunglasses', 'hat', 'shoes', TRUE),
('VOCABULARY', 'A1', 0.4, 'How do you say "buying things" as a noun?', 'shopping', 'A1: Word formation (verb → noun)', 'shopping', 'shop', 'shops', 'shoping', TRUE),

-- A2 Vocabulary
('VOCABULARY', 'A2', 0.3, 'The company announced record ___ this year.', 'profits', 'A2: Business vocabulary', 'profits', 'losses', 'debts', 'costs', TRUE),
('VOCABULARY', 'A2', 0.35, 'To apply for a job, you need to submit a ___', 'resume', 'A2: Career vocabulary', 'resume', 'contract', 'salary', 'interview', TRUE),
('VOCABULARY', 'A2', 0.4, 'The car ___ broke down on the highway.', 'engine', 'A2: Technical vocabulary', 'engine', 'wheel', 'seat', 'door', TRUE),
('VOCABULARY', 'A2', 0.45, 'She is very ___ about the new project. She talks about it all the time.', 'enthusiastic', 'A2: Personality adjectives', 'enthusiastic', 'bored', 'tired', 'worried', TRUE),
('VOCABULARY', 'A2', 0.5, 'We need to ___ our expenses to stay within budget.', 'reduce', 'A2: Business verbs', 'reduce', 'increase', 'multiply', 'double', TRUE),
('VOCABULARY', 'A2', 0.55, 'The medicine had a positive ___ on his health.', 'effect', 'A2: Collocations', 'effect', 'affect', 'effort', 'infect', TRUE),
('VOCABULARY', 'A2', 0.6, 'He gave a detailed ___ of the incident.', 'account', 'A2: Reporting vocabulary', 'account', 'report', 'story', 'tale', TRUE),

-- B1 Vocabulary
('VOCABULARY', 'B1', 0.45, 'The politician tried to ___ public opinion.', 'influence', 'B1: Persuasion verbs', 'influence', 'ignore', 'follow', 'copy', TRUE),
('VOCABULARY', 'B1', 0.5, 'Her ___ was so poor that nobody understood the presentation.', 'articulation', 'B1: Communication skills', 'articulation', 'vocabulary', 'grammar', 'confidence', TRUE),
('VOCABULARY', 'B1', 0.55, 'The board reached a unanimous ___ on the matter.', 'decision', 'B1: Corporate vocabulary', 'decision', 'compromise', 'discussion', 'meeting', TRUE),
('VOCABULARY', 'B1', 0.6, 'He was made ___ after 20 years of service.', 'redundant', 'B1: Employment vocabulary', 'redundant', 'retired', 'resigned', 'promoted', TRUE),
('VOCABULARY', 'B1', 0.65, 'The study showed a significant ___ between smoking and lung disease.', 'correlation', 'B1: Academic vocabulary', 'correlation', 'difference', 'similarity', 'contrast', TRUE),
('VOCABULARY', 'B1', 0.7, 'The government introduced new ___ to protect the environment.', 'legislation', 'B1: Policy vocabulary', 'legislation', 'regulation', 'both', 'neither', TRUE),
('VOCABULARY', 'B1', 0.75, 'To ___ a meeting means to arrange it.', 'convene', 'B1: Formal vocabulary', 'convene', 'adjourn', 'attend', 'cancel', TRUE),

-- READING questions
-- A1 Reading
('READING', 'A1', 0.1, '"I am going to the store." What is the speaker doing?', 'going to the store', 'A1: Reading comprehension', 'going to the store', 'working at home', 'sleeping', 'studying', TRUE),
('READING', 'A1', 0.15, 'What does "open" mean on a door?', 'not closed', 'A1: Everyday reading', 'not closed', 'broken', 'locked', 'painted', TRUE),
('READING', 'A1', 0.2, 'A menu listing "Soup, Salad, Chicken, Dessert" shows:', 'choices of food', 'A1: Text interpretation', 'choices of food', 'prices', 'locations', 'people', TRUE),
('READING', 'A1', 0.25, 'If a sign says "No Parking", you should ___', 'not park there', 'A1: Sign interpretation', 'not park there', 'park quickly', 'pay to park', 'leave your car', TRUE),
('READING', 'A1', 0.3, 'A train schedule with "Arrive 14:00" means the train ___ at 2 PM.', 'arrives', 'A1: Schedule reading', 'arrives', 'departs', 'stops', 'cancels', TRUE),
('READING', 'A1', 0.35, 'What does "Sale ends today" tell you?', 'today is the last day', 'A1: Notice interpretation', 'today is the last day', 'sale starts today', 'sale is good', 'today only sale', TRUE),
('READING', 'A1', 0.4, '"Closed for holidays" on a shop means the shop is ___', 'not open', 'A1: Notice interpretation', 'not open', 'very busy', 'hiring staff', 'renovating', TRUE),

-- A2 Reading
('READING', 'A2', 0.3, 'A weather forecast says "Rain expected in the afternoon." What should you bring?', 'an umbrella', 'A2: Forecast comprehension', 'an umbrella', 'sunglasses', 'a coat', 'nothing', TRUE),
('READING', 'A2', 0.35, '"First come, first served" means ___', 'people are served in arrival order', 'A2: Policy comprehension', 'people are served in arrival order', 'only first customers', 'everyone gets served', 'no waiting', TRUE),
('READING', 'A2', 0.4, 'An email ending with "Best regards" is ___', 'formal and polite', 'A2: Email conventions', 'formal and polite', 'angry', 'very casual', 'confidential', TRUE),
('READING', 'A2', 0.45, '"Subject to availability" in an offer means ___', 'depends on stock', 'A2: Terms comprehension', 'depends on stock', 'always available', 'sold out', 'very popular', TRUE),
('READING', 'A2', 0.5, 'A news headline "Economy Grows 3%" suggests ___', 'positive economic news', 'A2: News headline interpretation', 'positive economic news', 'recession', 'unemployment rise', 'bankruptcy', TRUE),
('READING', 'A2', 0.55, '"Strictly no refund" means ___', 'money cannot be returned', 'A2: Policy comprehension', 'money cannot be returned', 'store credit only', 'exchange possible', 'guarantee void', TRUE),
('READING', 'A2', 0.6, 'A recipe instruction "fold in the flour gently" means ___', 'mix carefully', 'A2: Instruction comprehension', 'mix carefully', 'stir vigorously', 'heat up', 'add water', TRUE),

-- B1 Reading
('READING', 'B1', 0.45, 'A news article beginning "Despite economic challenges..." implies ___', 'economy faced difficulties', 'B1: Tone and implication', 'economy faced difficulties', 'economy is thriving', 'economy is irrelevant', 'economy is stable', TRUE),
('READING', 'B1', 0.5, '"The policy is under review" most likely means:', 'changes may come', 'B1: Corporate language', 'changes may come', 'policy is cancelled', 'policy is permanent', 'no decision made', TRUE),
('READING', 'B1', 0.55, 'A contract clause "Either party may terminate with 30 days notice" allows ___', 'ending the contract with notice', 'B1: Legal language', 'ending the contract with notice', 'immediate termination', 'no termination', 'extension', TRUE),
('READING', 'B1', 0.6, '"Provisional approval" in a document means ___', 'conditional agreement', 'B1: Conditional language', 'conditional agreement', 'full rejection', 'full approval', 'pending review', TRUE),
('READING', 'B1', 0.65, 'A report stating "Revenue increased significantly, though costs rose proportionally" suggests ___', 'profit may not have improved', 'B1: Analytical reading', 'profit may not have improved', 'company is very profitable', 'costs decreased', 'both improved equally', TRUE),
('READING', 'B1', 0.7, 'An instruction "Please refer to Appendix B for further details" directs you to ___', 'look at the additional section', 'B1: Document navigation', 'look at the additional section', 'ignore the main text', 'contact support', 'start from beginning', TRUE),
('READING', 'B1', 0.75, '"Notwithstanding the above provisions" in a contract means ___', 'despite the previous section', 'B1: Legal vocabulary', 'despite the previous section', 'in addition to', 'instead of', 'together with', TRUE),

-- LISTENING questions
-- A1 Listening
('LISTENING', 'A1', 0.1, 'You hear: "Turn left at the corner." What should you do?', 'go left', 'A1: Direction comprehension', 'go left', 'go right', 'go straight', 'stop', TRUE),
('LISTENING', 'A1', 0.15, 'You hear: "How much is this book?" What is being asked?', 'the price', 'A1: Question comprehension', 'the price', 'the title', 'the author', 'the page count', TRUE),
('LISTENING', 'A1', 0.2, 'You hear: "The store opens at 9 AM." When does it open?', '9 oclock in the morning', 'A1: Time comprehension', '9 oclock in the morning', '9 oclock at night', 'in 9 minutes', 'every 9 hours', TRUE),
('LISTENING', 'A1', 0.25, 'You hear: "It is raining outside." What is the weather?', 'rainy', 'A1: Weather comprehension', 'rainy', 'sunny', 'snowy', 'windy', TRUE),
('LISTENING', 'A1', 0.3, 'You hear: "I would like a coffee, please." What does the speaker want?', 'to order coffee', 'A1: Intent comprehension', 'to order coffee', 'to sell coffee', 'to make coffee', 'to drink tea', TRUE),
('LISTENING', 'A1', 0.35, 'You hear: "She is a doctor." What is her job?', 'doctor', 'A1: Job identification', 'doctor', 'teacher', 'nurse', 'lawyer', TRUE),
('LISTENING', 'A1', 0.4, 'You hear: "The meeting is at 3 oclock." When is it?', '3 PM', 'A1: Time comprehension', '3 PM', '3 AM', 'in 3 hours', 'every 3 hours', TRUE),

-- A2 Listening
('LISTENING', 'A2', 0.3, 'You hear: "If it rains tomorrow, we will cancel the trip." What happens if it rains?', 'trip is cancelled', 'A2: Conditional comprehension', 'trip is cancelled', 'trip continues', 'trip moves earlier', 'trip moves indoors', TRUE),
('LISTENING', 'A2', 0.35, 'You hear: "I have been working here for five years." How long?', '5 years', 'A2: Duration comprehension', '5 years', '5 months', 'since 5 years ago', '5 weeks', TRUE),
('LISTENING', 'A2', 0.4, 'You hear: "You are advised to arrive early." What is the recommendation?', 'come early', 'A2: Advice comprehension', 'come early', 'come late', 'do not come', 'come on time', TRUE),
('LISTENING', 'A2', 0.45, 'You hear: "Not only did she finish on time, but she also exceeded expectations." This means she ___', 'did very well', 'A2: Contrast comprehension', 'did very well', 'finished late', 'failed expectations', 'did average work', TRUE),
('LISTENING', 'A2', 0.5, 'You hear: "The book is due back by Friday." What must you do?', 'return it by Friday', 'A2: Obligation comprehension', 'return it by Friday', 'buy it by Friday', 'read it by Friday', 'write about it', TRUE),
('LISTENING', 'A2', 0.55, 'You hear: "Had I known, I would have helped." What does this mean?', 'did not help because did not know', 'A2: Inverted conditional', 'did not help because did not know', 'helped without knowing', 'will help now', 'wants to help', TRUE),
('LISTENING', 'A2', 0.6, 'You hear: "The project was completed ahead of schedule." What happened?', 'finished early', 'A2: Time expression comprehension', 'finished early', 'finished late', 'on schedule', 'cancelled', TRUE),

-- B1 Listening
('LISTENING', 'B1', 0.45, 'You hear: "While the results are promising, further research is needed." This suggests ___', 'results look good but incomplete', 'B1: Academic register', 'results look good but incomplete', 'results are negative', 'research is complete', 'results are wrong', TRUE),
('LISTENING', 'B1', 0.5, 'You hear: "The management has been accused of negligence." What happened?', 'management blamed for carelessness', 'B1: News register', 'management blamed for carelessness', 'management praised', 'management resigned', 'management promoted', TRUE),
('LISTENING', 'B1', 0.55, 'You hear: "On the one hand it is cheaper, on the other hand quality may suffer." The speaker is ___', 'weighing pros and cons', 'B1: Contrast markers', 'weighing pros and cons', 'being decisive', 'complaining', 'agreeing with both', TRUE),
('LISTENING', 'B1', 0.6, 'You hear: "He failed not because of lack of effort, but rather because of circumstance." This means effort was ___', 'not the reason for failure', 'B1: Contrast and cause', 'not the reason for failure', 'the reason for failure', 'increased effort needed', 'effort was irrelevant', TRUE),
('LISTENING', 'B1', 0.65, 'You hear: "It goes without saying that safety is our top priority." This emphasizes ___', 'safety is very important', 'B1: Emphasis expressions', 'safety is very important', 'safety is questionable', 'safety is secondary', 'safety is a habit', TRUE),
('LISTENING', 'B1', 0.7, 'You hear: "Subsequent to the meeting, a decision was made." What happened?', 'decision after the meeting', 'B1: Formal register', 'decision after the meeting', 'decision before meeting', 'no decision made', 'meeting was cancelled', TRUE),
('LISTENING', 'B1', 0.75, 'You hear: "Were the budget to be cut, services would inevitably suffer." This describes ___', 'what would happen if budget cut', 'B1: Hypothetical conditional', 'what would happen if budget cut', 'budget already cut', 'budget increased', 'services already suffering', TRUE);
