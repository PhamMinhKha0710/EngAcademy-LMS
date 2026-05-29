-- Remove duplicate daily quests (keep newest id per user + date)
DELETE dq1 FROM DAILY_QUEST dq1
INNER JOIN DAILY_QUEST dq2
  ON dq1.user_id = dq2.user_id
 AND dq1.quest_date = dq2.quest_date
 AND dq1.id < dq2.id;

-- Prevent duplicate quests per user per day
CREATE UNIQUE INDEX uk_daily_quest_user_date ON DAILY_QUEST (user_id, quest_date);
