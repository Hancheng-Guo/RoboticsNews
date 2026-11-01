#!/usr/bin/env node
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = resolve(process.env.ROBOTICS_NEWS_DB ?? join(root, 'data', 'robotics_news.sqlite'));
const schemaPath = join(root, 'data', 'schema.sql');

function usage() {
  console.log(`Usage:
  node scripts/db.mjs init
  node scripts/db.mjs add <entry.json>
  node scripts/db.mjs replace <entry.json>
  node scripts/db.mjs add-source <source.json>
  node scripts/db.mjs search [--q text] [--date YYYY-MM-DD] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
                             [--topic text] [--entity text] [--category value] [--status value] [--limit N]
  node scripts/db.mjs get <id>
  node scripts/db.mjs sources [--q text] [--active 0|1]
  node scripts/db.mjs stats

Set ROBOTICS_NEWS_DB to use another database file. Search matches Chinese and English substrings.`);
}

function options(args) {
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith('--') || i + 1 >= args.length) throw new Error(`Invalid option: ${args[i]}`);
    result[args[i].slice(2)] = args[i + 1];
  }
  return result;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} must be non-empty text`);
  return value.trim();
}

function date(value, name) {
  if (value !== undefined) {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
    if (!parsed || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new Error(`${name} must be a valid YYYY-MM-DD`);
    }
  }
  return value;
}

function textArray(value, name) {
  if (value === undefined || value === null) return '[]';
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new Error(`${name} must be a string array`);
  return JSON.stringify(value);
}

function optionalText(value) {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function openDb() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(readFileSync(schemaPath, 'utf8'));
  const columns = new Set(db.prepare('PRAGMA table_info(entries)').all().map(row => row.name));
  const additions = {
    first_author_name: 'TEXT', first_author_affiliations: "TEXT NOT NULL DEFAULT '[]'",
    abstract_original: 'TEXT', abstract_language: 'TEXT', abstract_source_url: 'TEXT', full_text_url: 'TEXT',
    full_text_contributions_zh: 'TEXT', full_text_contributions_en: 'TEXT', full_text_verified_at: 'TEXT'
  };
  for (const [name, type] of Object.entries(additions)) {
    if (!columns.has(name)) db.exec(`ALTER TABLE entries ADD COLUMN ${name} ${type}`);
  }
  return db;
}

function addEntry(db, item, replace = false) {
  const required = ['id', 'issue_date', 'category', 'title_original', 'title_zh', 'title_en',
    'summary_zh', 'summary_en', 'evidence_status', 'primary_url'];
  for (const key of required) requireText(item[key], key);
  date(item.issue_date, 'issue_date');
  if (!/^https?:\/\//.test(item.primary_url)) throw new Error('primary_url must be an HTTP(S) URL');
  if (item.category === 'paper' && item.editorial_status === 'published' && item.issue_date >= '2026-11-02') {
    for (const key of ['first_author_name', 'abstract_original', 'abstract_language', 'full_text_contributions_zh',
      'full_text_contributions_en', 'full_text_verified_at']) requireText(item[key], key);
    if (!Array.isArray(item.first_author_affiliations) || !item.first_author_affiliations.length ||
        item.first_author_affiliations.some(value => typeof value !== 'string' || !value.trim())) {
      throw new Error('Published papers require first_author_affiliations');
    }
    for (const key of ['abstract_source_url', 'full_text_url']) {
      if (!/^https?:\/\//.test(item[key] ?? '')) throw new Error(`${key} must be an HTTP(S) URL`);
    }
  }
  if (replace && !db.prepare('SELECT 1 FROM entries WHERE id = ?').get(item.id)) {
    throw new Error(`Cannot replace missing entry: ${item.id}`);
  }
  const score = item.score ?? {};
  const scores = ['novelty', 'impact', 'evidence', 'utility'].map(key => {
    const value = score[key] ?? 0;
    if (!Number.isInteger(value) || value < 0 || value > 2) throw new Error(`score.${key} must be 0, 1 or 2`);
    return value;
  });
  const fields = [
    'id', 'issue_date', 'event_time_original', 'event_time_bj', 'first_seen_at', 'last_verified_at',
    'category', 'topics', 'geography', 'entities', 'title_original', 'title_zh', 'title_en',
    'summary_zh', 'summary_en', 'why_it_matters_zh', 'limitations_zh', 'evidence_status',
    'deployment_stage', 'primary_url', 'supporting_urls', 'paper_id', 'first_author_name',
    'first_author_affiliations', 'abstract_original', 'abstract_language', 'abstract_source_url', 'full_text_url',
    'full_text_contributions_zh', 'full_text_contributions_en', 'full_text_verified_at', 'publication_status',
    'code_url', 'data_url', 'claim_evidence_notes', 'score_novelty', 'score_impact',
    'score_evidence', 'score_utility', 'editorial_status', 'placement', 'correction_of'
  ];
  const values = [
    item.id, item.issue_date, optionalText(item.event_time_original), optionalText(item.event_time_bj),
    optionalText(item.first_seen_at), optionalText(item.last_verified_at), item.category,
    textArray(item.topics, 'topics'), textArray(item.geography, 'geography'), textArray(item.entities, 'entities'),
    item.title_original, item.title_zh, item.title_en, item.summary_zh, item.summary_en,
    optionalText(item.why_it_matters_zh), optionalText(item.limitations_zh), item.evidence_status,
    item.deployment_stage ?? 'not_applicable', item.primary_url,
    textArray(item.supporting_urls, 'supporting_urls'), optionalText(item.paper_id),
    optionalText(item.first_author_name), textArray(item.first_author_affiliations, 'first_author_affiliations'),
    optionalText(item.abstract_original), optionalText(item.abstract_language), optionalText(item.abstract_source_url), optionalText(item.full_text_url),
    optionalText(item.full_text_contributions_zh), optionalText(item.full_text_contributions_en),
    optionalText(item.full_text_verified_at),
    item.publication_status ?? 'not_applicable', optionalText(item.code_url), optionalText(item.data_url),
    optionalText(item.claim_evidence_notes), ...scores, item.editorial_status ?? 'candidate',
    item.placement ?? 'unassigned',
    optionalText(item.correction_of)
  ];
  const update = replace ? ` ON CONFLICT(id) DO UPDATE SET ${fields.filter(field => field !== 'id')
    .map(field => `${field}=excluded.${field}`).join(', ')}, updated_at=datetime('now')` : '';
  db.prepare(`INSERT INTO entries (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})${update}`).run(...values);
}

function addSource(db, item) {
  for (const key of ['id', 'name', 'url', 'source_type']) requireText(item[key], key);
  if (!/^https?:\/\//.test(item.url)) throw new Error('url must be an HTTP(S) URL');
  db.prepare(`INSERT INTO sources
    (id,name,url,source_type,region,language,topics,access_method,update_frequency,owner,last_checked_at,active,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    item.id, item.name, item.url, item.source_type, optionalText(item.region), optionalText(item.language),
    textArray(item.topics, 'topics'), optionalText(item.access_method), optionalText(item.update_frequency),
    optionalText(item.owner), optionalText(item.last_checked_at), item.active ?? 1, optionalText(item.notes)
  );
}

function decode(row) {
  if (!row) return row;
  for (const key of ['topics', 'geography', 'entities', 'supporting_urls', 'first_author_affiliations']) {
    if (key in row) row[key] = JSON.parse(row[key]);
  }
  if ('score_novelty' in row) {
    row.score = { novelty: row.score_novelty, impact: row.score_impact,
      evidence: row.score_evidence, utility: row.score_utility };
    for (const key of ['score_novelty', 'score_impact', 'score_evidence', 'score_utility']) delete row[key];
  }
  return row;
}

function search(db, opt) {
  const allowed = new Set(['q', 'date', 'from', 'to', 'topic', 'entity', 'category', 'status', 'limit']);
  for (const key of Object.keys(opt)) if (!allowed.has(key)) throw new Error(`Unknown option: --${key}`);
  const where = [], params = [];
  if (opt.date) { where.push('issue_date = ?'); params.push(date(opt.date, 'date')); }
  if (opt.from) { where.push('issue_date >= ?'); params.push(date(opt.from, 'from')); }
  if (opt.to) { where.push('issue_date <= ?'); params.push(date(opt.to, 'to')); }
  if (opt.category) { where.push('category = ?'); params.push(opt.category); }
  if (opt.status) { where.push('editorial_status = ?'); params.push(opt.status); }
  if (opt.topic) {
    where.push('EXISTS (SELECT 1 FROM json_each(entries.topics) WHERE instr(lower(value), lower(?)) > 0)');
    params.push(opt.topic);
  }
  if (opt.entity) {
    where.push('EXISTS (SELECT 1 FROM json_each(entries.entities) WHERE instr(lower(value), lower(?)) > 0)');
    params.push(opt.entity);
  }
  if (opt.q) {
    where.push(`(${['title_original','title_zh','title_en','summary_zh','summary_en','why_it_matters_zh',
      'limitations_zh','claim_evidence_notes','paper_id','first_author_name',
      'first_author_affiliations','abstract_original','full_text_contributions_zh',
      'full_text_contributions_en'].map(field => `instr(lower(coalesce(${field},'')),lower(?)) > 0`).join(' OR ')})`);
    params.push(...Array(14).fill(opt.q));
  }
  const limit = opt.limit === undefined ? 50 : Number(opt.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('limit must be 1–500');
  const sql = `SELECT id, issue_date, category, topics, entities, title_zh, title_en, evidence_status,
    editorial_status, primary_url FROM entries ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY issue_date DESC, (score_novelty+score_impact+score_evidence+score_utility) DESC, id LIMIT ?`;
  return db.prepare(sql).all(...params, limit).map(decode);
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help') { usage(); return; }
  const db = openDb();
  try {
    if (command === 'init') {
      console.log(`Initialized ${dbPath}`);
    } else if (command === 'add' || command === 'replace' || command === 'add-source') {
      if (args.length !== 1) throw new Error(`${command} requires one JSON file`);
      const data = JSON.parse(readFileSync(resolve(args[0]), 'utf8'));
      const items = Array.isArray(data) ? data : [data];
      db.exec('BEGIN');
      try {
        for (const item of items) command === 'add-source' ? addSource(db, item) : addEntry(db, item, command === 'replace');
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
      console.log(`${command === 'replace' ? 'Replaced' : 'Added'} ${items.length} ${command === 'add-source' ? 'sources' : 'entries'}`);
    } else if (command === 'search') {
      console.log(JSON.stringify(search(db, options(args)), null, 2));
    } else if (command === 'get') {
      if (args.length !== 1) throw new Error('get requires one ID');
      const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(args[0]);
      if (!row) { process.exitCode = 1; console.error(`Entry not found: ${args[0]}`); }
      else console.log(JSON.stringify(decode(row), null, 2));
    } else if (command === 'sources') {
      const opt = options(args);
      for (const key of Object.keys(opt)) if (!['q','active'].includes(key)) throw new Error(`Unknown option: --${key}`);
      const rows = db.prepare(`SELECT * FROM sources WHERE (? IS NULL OR active = ?)
        AND (? IS NULL OR instr(lower(name || ' ' || url || ' ' || coalesce(notes,'')),lower(?)) > 0)
        ORDER BY name`).all(opt.active ?? null, opt.active ?? null, opt.q ?? null, opt.q ?? null);
      console.log(JSON.stringify(rows.map(decode), null, 2));
    } else if (command === 'stats') {
      console.log(JSON.stringify({
        entries: db.prepare('SELECT count(*) AS n FROM entries').get().n,
        sources: db.prepare('SELECT count(*) AS n FROM sources').get().n,
        by_category: db.prepare('SELECT category, count(*) AS n FROM entries GROUP BY category ORDER BY n DESC').all(),
        by_issue_date: db.prepare('SELECT issue_date, count(*) AS n FROM entries GROUP BY issue_date ORDER BY issue_date DESC LIMIT 30').all()
      }, null, 2));
    } else { throw new Error(`Unknown command: ${command}`); }
  } finally { db.close(); }
}

try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
