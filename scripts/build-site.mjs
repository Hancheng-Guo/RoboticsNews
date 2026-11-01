#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = resolve(process.env.ROBOTICS_NEWS_DB ?? join(root, 'data', 'robotics_news.sqlite'));
const out = resolve(process.env.ROBOTICS_NEWS_SITE_DIR ?? join(root, 'site'));
const pdfDir = resolve(process.env.ROBOTICS_NEWS_PDF_DIR ?? join(root, 'diarys'));
const pdfPublicBase = process.env.ROBOTICS_NEWS_PDF_URL_BASE ?? 'https://raw.githubusercontent.com/Hancheng-Guo/RoboticsNews/main/diarys';
const python = process.env.ROBOTICS_NEWS_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
const todayBj = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const url = value => /^https?:\/\//i.test(value ?? '') ? html(value) : '#';

function argDate() {
  const args = process.argv.slice(2);
  if (args.length === 0) return todayBj();
  if (args.length !== 2 || args[0] !== '--date') throw new Error('Usage: node scripts/build-site.mjs [--date YYYY-MM-DD]');
  const value = args[1];
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
  if (!d || Number.isNaN(d.valueOf()) || d.toISOString().slice(0, 10) !== value) throw new Error('Invalid issue date');
  return value;
}

function layout(title, body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="机器人学研究进展三日报：论文、技术和产业动态"><title>${html(title)} · RoboticsNews</title><link rel="stylesheet" href="style.css"></head><body><header class="site-header"><div class="shell header-inner"><a class="brand" href="index.html">Robotics<span>News</span></a><span class="header-note">机器人学研究进展三日报</span></div></header>${body}<footer class="site-footer"><div class="shell">RoboticsNews · 每三天追踪可核实的机器人学进展</div></footer></body></html>`;
}

const labels = {
  lead: '今日重点', research: '学术研究', industry: '工业与应用', ecosystem: '生态动态',
  paper_briefs: '论文速览', corrections: '补录与更正', unassigned: '其他进展'
};
const evidence = {
  peer_reviewed: '同行评审', preprint: '预印本', official_claim: '机构宣称，未独立验证',
  independent_evidence: '有独立证据', corrected: '已更正', unverified: '待核实'
};
const sections = ['lead', 'research', 'industry', 'ecosystem', 'paper_briefs', 'corrections', 'unassigned'];

function entryCard(item) {
  const tags = [evidence[item.evidence_status] ?? item.evidence_status, ...(item.topics ?? []).slice(0, 3)];
  const links = [`<a href="${url(item.primary_url)}" target="_blank" rel="noopener noreferrer">原始来源 ↗</a>`];
  if (item.code_url) links.push(`<a href="${url(item.code_url)}" target="_blank" rel="noopener noreferrer">代码 ↗</a>`);
  if (item.data_url) links.push(`<a href="${url(item.data_url)}" target="_blank" rel="noopener noreferrer">数据 ↗</a>`);
  return `<article class="entry" id="${html(item.id)}"><div class="tags">${tags.map(t => `<span class="tag">${html(t)}</span>`).join('')}<span class="tag">${item.event_time_bj ? '北京时间' : '原文日期'} ${html((item.event_time_bj ?? item.event_time_original ?? '').slice(0, 10))}</span></div><h3>${html(item.title_zh)}</h3><p class="entry-en-title">${html(item.title_en)}</p><p>${html(item.summary_zh)}</p><p class="entry-en" lang="en">${html(item.summary_en)}</p>${item.why_it_matters_zh ? `<p><strong>意义：</strong>${html(item.why_it_matters_zh)}</p>` : ''}${item.limitations_zh ? `<p class="limitations"><strong>局限：</strong>${html(item.limitations_zh)}</p>` : ''}<div class="entry-links">${links.join('')}</div></article>`;
}

function issuePage(issue) {
  const groups = sections.map(key => [key, issue.entries.filter(e => e.placement === key)]).filter(([, items]) => items.length);
  const note = issue.editorial_note_zh ? `<section class="content-section"><div class="section-title"><span class="section-mark"></span><h2>编辑说明</h2></div><p>${html(issue.editorial_note_zh)}</p><p class="entry-en" lang="en">${html(issue.editorial_note_en)}</p></section>` : '';
  const checks = (issue.source_checks ?? []).length ? `<section class="content-section"><div class="section-title"><span class="section-mark"></span><h2>核查记录</h2></div><div class="entries">${issue.source_checks.map(c => `<article class="entry"><h3>${html(c.title_zh)}</h3><p>${html(c.result_zh)}</p><p class="entry-en" lang="en">${html(c.result_en)}</p><div class="entry-links">${c.urls.map((u, i) => `<a href="${url(u)}" target="_blank" rel="noopener noreferrer">依据 ${i + 1} ↗</a>`).join('')}</div></article>`).join('')}</div></section>` : '';
  const body = `<main class="shell"><section class="hero"><div class="eyebrow">THREE-DAY BRIEF · ${html(issue.date)}</div><h1>机器人学研究进展三日报</h1><p class="hero-sub">Robotics Research & Industry · Three-Day Brief</p><div class="hero-meta"><span>北京时间 ${html(issue.date)} 发布</span><span>${issue.entries.length} 条合格新增</span><a class="pdf-link" href="${url(issue.pdf_url)}" target="_blank" rel="noopener noreferrer">查看本期 PDF ↗</a></div></section><p class="issue-note">覆盖北京时间 ${html(issue.coverage_start)} 00:00 至 ${html(issue.coverage_end)} 24:00 首次公开的信息。${issue.entries.length ? '企业或机构单方发布的内容会明确标注；点击每条原始来源查看依据。' : '本期未检出符合采编标准的新增进展。'}</p>${note}${groups.map(([key, items]) => `<section class="content-section"><div class="section-title"><span class="section-mark"></span><h2>${labels[key]}</h2><span class="section-count">${items.length}</span></div><div class="entries">${items.map(entryCard).join('')}</div></section>`).join('')}${checks}</main>`;
  return layout(`${issue.date} 三日报`, body);
}

function emptyPage() {
  const body = `<main class="shell"><section class="hero home-hero"><div class="eyebrow">RESEARCH · SYSTEMS · INDUSTRY</div><h1>机器人学研究<br><em>进展三日报</em></h1><p class="hero-sub">面向研究人员与工程师。每三天聚焦值得核实、值得追踪的机器人学进展。</p><div class="hero-meta"><span>每三天北京时间 08:00</span><span>中英双语摘要</span><span>网页与 PDF</span></div></section><section class="content-section"><p class="empty">本期暂无已发布内容。</p></section></main>`;
  return layout('三日报', body);
}

function main() {
  const date = argDate();
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, '.nojekyll'), '');
  const sourceStyle = join(root, 'site', 'style.css');
  const targetStyle = join(out, 'style.css');
  if (targetStyle !== sourceStyle) writeFileSync(targetStyle, readFileSync(sourceStyle));
  let entries = [];
  if (existsSync(dbPath)) {
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
      const rows = db.prepare(`SELECT * FROM entries WHERE issue_date = ? AND editorial_status = 'published'
        ORDER BY (score_novelty + score_impact + score_evidence + score_utility) DESC, id`).all(date);
      entries = rows.map(row => ({ ...row, topics: JSON.parse(row.topics), geography: JSON.parse(row.geography),
        entities: JSON.parse(row.entities), supporting_urls: JSON.parse(row.supporting_urls) }));
    } finally { db.close(); }
  }
  const issuePath = join(root, 'data', 'issues', `${date}.json`);
  if (entries.length || existsSync(issuePath)) {
    const meta = existsSync(issuePath) ? JSON.parse(readFileSync(issuePath, 'utf8')) : {};
    const coverageDate = new Date(`${date}T00:00:00Z`);
    coverageDate.setUTCDate(coverageDate.getUTCDate() - 1);
    const coverageEnd = coverageDate.toISOString().slice(0, 10);
    coverageDate.setUTCDate(coverageDate.getUTCDate() - 2);
    const issue = { date, coverage_start: meta.coverage_start ?? coverageDate.toISOString().slice(0, 10),
      coverage_end: meta.coverage_end ?? coverageEnd, timezone: 'Asia/Shanghai',
      pdf_url: `${pdfPublicBase.replace(/\/$/, '')}/${date}.pdf`,
      editorial_note_zh: meta.editorial_note_zh ?? '', editorial_note_en: meta.editorial_note_en ?? '',
      source_checks: meta.source_checks ?? [], entries };
    for (const item of entries) {
      const eventDate = (item.event_time_bj ?? item.event_time_original)?.slice(0, 10);
      if (!eventDate || eventDate < issue.coverage_start || eventDate > issue.coverage_end) {
        throw new Error(`Entry ${item.id} is outside the Beijing coverage window`);
      }
    }
    const currentJson = join(out, 'current.json');
    mkdirSync(pdfDir, { recursive: true });
    writeFileSync(currentJson, JSON.stringify(issue, null, 2) + '\n');
    execFileSync(python, [join(root, 'scripts', 'build-pdf.py'), currentJson, join(pdfDir, `${date}.pdf`)], { stdio: 'inherit' });
    writeFileSync(join(out, 'index.html'), issuePage(issue));
  } else {
    writeFileSync(join(out, 'index.html'), emptyPage());
  }
  console.log(`Built ${out}; ${date}: ${entries.length} published entries`);
}

try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
