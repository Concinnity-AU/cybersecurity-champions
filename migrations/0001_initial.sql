-- Cybersecurity Champions Challenge — initial schema
-- D1 / SQLite

CREATE TABLE challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('spot_it', 'pick_stronger', 'scenario', 'real_ai')),
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_active INTEGER NOT NULL DEFAULT 1,
  image_path TEXT,
  correct_answer TEXT NOT NULL,
  metadata TEXT,
  source_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_translations (
  challenge_id INTEGER NOT NULL,
  language_code TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options TEXT NOT NULL,
  explanation TEXT NOT NULL,
  PRIMARY KEY (challenge_id, language_code),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  postcode TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  consent_program INTEGER NOT NULL,
  consent_marketing INTEGER NOT NULL DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  lead_id INTEGER,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  max_streak INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL,
  duration_seconds INTEGER,
  challenges_seen TEXT,
  answers TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  completion_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (completion_id) REFERENCES completions(id)
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_completions_session ON completions(session_id);
CREATE INDEX idx_completions_lead ON completions(lead_id);
CREATE INDEX idx_challenges_active_type ON challenges(is_active, type);
