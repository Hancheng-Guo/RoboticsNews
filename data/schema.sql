PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  issue_date TEXT NOT NULL CHECK (issue_date GLOB '????-??-??'),
  event_time_original TEXT,
  event_time_bj TEXT,
  first_seen_at TEXT,
  last_verified_at TEXT,
  category TEXT NOT NULL CHECK (category IN ('paper','industry','open_source','policy','standard','market','funding','event','other')),
  topics TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(topics) AND json_type(topics) = 'array'),
  geography TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(geography) AND json_type(geography) = 'array'),
  entities TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(entities) AND json_type(entities) = 'array'),
  title_original TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_zh TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  why_it_matters_zh TEXT,
  limitations_zh TEXT,
  evidence_status TEXT NOT NULL CHECK (evidence_status IN ('peer_reviewed','preprint','official_claim','independent_evidence','unverified','corrected')),
  deployment_stage TEXT NOT NULL DEFAULT 'not_applicable' CHECK (deployment_stage IN ('not_applicable','concept','demo','lab','pilot','paid','scaled','undisclosed')),
  primary_url TEXT NOT NULL,
  supporting_urls TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(supporting_urls) AND json_type(supporting_urls) = 'array'),
  paper_id TEXT,
  first_author_name TEXT,
  first_author_affiliations TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(first_author_affiliations) AND json_type(first_author_affiliations) = 'array'),
  first_author_affiliation_source_url TEXT,
  abstract_original TEXT,
  abstract_language TEXT,
  abstract_source_url TEXT,
  abstract_zh_translation TEXT,
  abstract_credit TEXT,
  publication_status TEXT NOT NULL DEFAULT 'not_applicable' CHECK (publication_status IN ('preprint','under_review','accepted','published','not_applicable')),
  code_url TEXT,
  data_url TEXT,
  claim_evidence_notes TEXT,
  score_novelty INTEGER NOT NULL DEFAULT 0 CHECK (score_novelty BETWEEN 0 AND 2),
  score_impact INTEGER NOT NULL DEFAULT 0 CHECK (score_impact BETWEEN 0 AND 2),
  score_evidence INTEGER NOT NULL DEFAULT 0 CHECK (score_evidence BETWEEN 0 AND 2),
  score_utility INTEGER NOT NULL DEFAULT 0 CHECK (score_utility BETWEEN 0 AND 2),
  editorial_status TEXT NOT NULL DEFAULT 'candidate' CHECK (editorial_status IN ('candidate','verifying','approved','held','rejected','published','corrected')),
  placement TEXT NOT NULL DEFAULT 'unassigned' CHECK (placement IN ('unassigned','lead','research','industry','ecosystem','paper_briefs','corrections')),
  correction_of TEXT REFERENCES entries(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entries_issue_date ON entries(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_category_date ON entries(category, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_status_date ON entries(editorial_status, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_paper_id ON entries(paper_id);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('primary','discovery')),
  region TEXT,
  language TEXT,
  topics TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(topics) AND json_type(topics) = 'array'),
  access_method TEXT,
  update_frequency TEXT,
  owner TEXT,
  last_checked_at TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes TEXT
);
