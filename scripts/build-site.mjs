#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = resolve(process.env.ROBOTICS_NEWS_DB ?? join(root, 'data', 'robotics_news.sqlite'));
const out = resolve(process.env.ROBOTICS_NEWS_SITE_DIR ?? join(root, 'site'));
const pdfDir = resolve(process.env.ROBOTICS_NEWS_PDF_DIR ?? join(root, 'diarys'));
const pdfPublicBase = process.env.ROBOTICS_NEWS_PDF_URL_BASE ?? 'https://raw.githubusercontent.com/Hancheng-Guo/RoboticsNews/main/diarys';
const python = process.env.ROBOTICS_NEWS_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
const todayBj = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
function latestMonday() {
  const day = new Date(`${todayBj()}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}
function nextMonday() {
  const day = new Date(`${todayBj()}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + (8 - day.getUTCDay()) % 7 || 7);
  return day.toISOString().slice(0, 10);
}
const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const url = value => /^https?:\/\//i.test(value ?? '') ? html(value) : '#';

function argDate() {
  const args = process.argv.slice(2).filter(arg => arg !== '--preview');
  if (args.length === 0) return process.argv.includes('--preview') ? nextMonday() : latestMonday();
  if (args.length !== 2 || args[0] !== '--date') throw new Error('Usage: node scripts/build-site.mjs [--date YYYY-MM-DD]');
  const value = args[1];
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
  if (!d || Number.isNaN(d.valueOf()) || d.toISOString().slice(0, 10) !== value) throw new Error('Invalid issue date');
  if (d.getUTCDay() !== 1) throw new Error('Weekly issue date must be a Monday in Beijing time');
  return value;
}

function layout(title, body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="机器人学研究进展周报：论文、技术和产业动态"><title>${html(title)} · RoboticsNews</title><link rel="stylesheet" href="style.css"></head><body><header class="site-header"><div class="shell header-inner"><a class="brand" href="index.html">Robotics<span>News</span></a><span class="header-note">机器人学研究进展周报</span></div></header><div class="ai-disclosure" role="note"><div class="shell"><strong>AI生成</strong><span>内容由 AI 辅助整理与总结；请以每条原始来源为准。</span></div></div>${body}<footer class="site-footer"><div class="shell">RoboticsNews · 每周一追踪可核实的机器人学进展</div></footer></body></html>`;
}

const labels = {
  lead: '本周重点', research: '学术研究', industry: '工业与应用', ecosystem: '生态动态',
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
  if (item.category === 'paper') {
    links.push(`<a href="${url(item.abstract_source_url)}" target="_blank" rel="noopener noreferrer">摘要原文 ↗</a>`);
    links.push(`<a href="${url(item.first_author_affiliation_source_url)}" target="_blank" rel="noopener noreferrer">单位依据 ↗</a>`);
  }
  const content = item.category === 'paper'
    ? `<p class="paper-affiliation"><strong>第一作者：</strong>${html(item.first_author_name)}<br><strong>第一作者单位：</strong>${html(item.first_author_affiliations.join('；'))}</p><div class="paper-abstract"><h4>论文摘要原文 / Original abstract</h4><p lang="${html(item.abstract_language ?? 'en')}">${html(item.abstract_original)}</p>${item.abstract_zh_translation ? `<h4>摘要中文翻译</h4><p lang="zh-CN">${html(item.abstract_zh_translation)}</p>` : ''}</div>`
    : `<p>${html(item.summary_zh)}</p><p class="entry-en" lang="en">${html(item.summary_en)}</p>`;
  return `<article class="entry" id="${html(item.id)}"><div class="tags">${tags.map(t => `<span class="tag">${html(t)}</span>`).join('')}<span class="tag">${item.event_time_bj ? '北京时间' : '原文日期'} ${html((item.event_time_bj ?? item.event_time_original ?? '').slice(0, 10))}</span></div><h3>${html(item.title_zh)}</h3><p class="entry-en-title">${html(item.title_en)}</p>${content}${item.why_it_matters_zh ? `<p><strong>意义：</strong>${html(item.why_it_matters_zh)}</p>` : ''}${item.limitations_zh ? `<p class="limitations"><strong>局限：</strong>${html(item.limitations_zh)}</p>` : ''}<div class="entry-links">${links.join('')}</div></article>`;
}

function issuePage(issue) {
  const groups = sections.map(key => [key, issue.entries.filter(e => e.placement === key)]).filter(([, items]) => items.length);
  const body = `<main class="shell"><section class="hero"><div class="eyebrow">WEEKLY BRIEF · ${html(issue.date)}</div><h1>机器人学研究进展周报</h1><p class="hero-sub">Robotics Research & Industry · Weekly Brief</p><div class="hero-meta"><span>北京时间 ${html(issue.date)} 发布</span><span>${issue.entries.length} 条合格新增</span><a class="pdf-link" href="${url(issue.pdf_url)}" target="_blank" rel="noopener noreferrer">查看本期 PDF ↗</a></div></section><p class="issue-note">覆盖北京时间 ${html(issue.coverage_start)} 00:00 至 ${html(issue.coverage_end)} 24:00 首次公开的信息。${issue.entries.length ? '企业或机构单方发布的内容会明确标注；点击每条原始来源查看依据。' : '本期未检出符合采编标准的新增进展。'}</p>${groups.map(([key, items]) => `<section class="content-section"><div class="section-title"><span class="section-mark"></span><h2>${labels[key]}</h2><span class="section-count">${items.length}</span></div><div class="entries">${items.map(entryCard).join('')}</div></section>`).join('')}</main>`;
  return layout(`${issue.date} 周报`, body);
}

function emptyPage() {
  const body = `<main class="shell"><section class="hero home-hero"><div class="eyebrow">RESEARCH · SYSTEMS · INDUSTRY</div><h1>机器人学研究<br><em>进展周报</em></h1><p class="hero-sub">面向研究人员与工程师。每周一聚焦上一周值得核实、值得追踪的机器人学进展。</p><div class="hero-meta"><span>每周一北京时间 08:00</span><span>论文摘要原文与第一作者单位</span><span>网页与 PDF</span></div></section><section class="content-section"><p class="empty">本期暂无已发布内容。</p></section></main>`;
  return layout('周报', body);
}

function previewPage(date) {
  const start = new Date(`${date}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date(`${date}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  const body = `<main class="shell"><section class="hero home-hero"><div class="eyebrow">WEEKLY BRIEF · COMING SOON</div><h1>机器人学研究<br><em>进展周报</em></h1><p class="hero-sub">面向研究人员与工程师，汇总上一完整自然周的学术、技术与产业进展。</p><div class="hero-meta"><span>下期：北京时间 ${html(date)} 周一 08:00</span><span>覆盖 ${html(start.toISOString().slice(0, 10))} 至 ${html(end.toISOString().slice(0, 10))}</span></div></section><section class="content-section"><p class="empty">周报正在编制中。完整统计窗口结束并完成核验后，本页将更新为本期内容和 PDF。</p></section></main>`;
  return layout('周报预告', body);
}

function main() {
  const date = argDate();
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, '.nojekyll'), '');
  const sourceStyle = join(root, 'site', 'style.css');
  const targetStyle = join(out, 'style.css');
  if (targetStyle !== sourceStyle) writeFileSync(targetStyle, readFileSync(sourceStyle));
  if (process.argv.includes('--preview')) {
    rmSync(join(out, 'current.json'), { force: true });
    writeFileSync(join(out, 'index.html'), previewPage(date));
    console.log(`Built weekly preview for ${date}`);
    return;
  }
  let entries = [];
  if (existsSync(dbPath)) {
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
      const rows = db.prepare(`SELECT * FROM entries WHERE issue_date = ? AND editorial_status = 'published'
        ORDER BY (score_novelty + score_impact + score_evidence + score_utility) DESC, id`).all(date);
      entries = rows.map(row => {
        const { claim_evidence_notes, full_text_url, full_text_contributions_zh,
          full_text_contributions_en, full_text_verified_at, ...publicRow } = row;
        return { ...publicRow, topics: JSON.parse(row.topics), geography: JSON.parse(row.geography),
          entities: JSON.parse(row.entities), supporting_urls: JSON.parse(row.supporting_urls),
          first_author_affiliations: JSON.parse(row.first_author_affiliations ?? '[]') };
      });
    } finally { db.close(); }
  }
  const issuePath = join(root, 'data', 'issues', `${date}.json`);
  if (entries.length || existsSync(issuePath)) {
    const meta = existsSync(issuePath) ? JSON.parse(readFileSync(issuePath, 'utf8')) : {};
    const coverageDate = new Date(`${date}T00:00:00Z`);
    coverageDate.setUTCDate(coverageDate.getUTCDate() - 1);
    const coverageEnd = coverageDate.toISOString().slice(0, 10);
    coverageDate.setUTCDate(coverageDate.getUTCDate() - 6);
    const coverageStart = coverageDate.toISOString().slice(0, 10);
    if ((meta.coverage_start && meta.coverage_start !== coverageStart) ||
        (meta.coverage_end && meta.coverage_end !== coverageEnd)) throw new Error('Issue metadata coverage must match the prior Monday–Sunday');
    const issue = { date, coverage_start: coverageStart,
      coverage_end: coverageEnd, timezone: 'Asia/Shanghai',
      pdf_url: `${pdfPublicBase.replace(/\/$/, '')}/${date}.pdf`, entries };
    for (const item of entries) {
      if (item.category === 'paper' && (!item.first_author_name || !item.first_author_affiliations.length ||
          !/^https?:\/\//i.test(item.first_author_affiliation_source_url ?? '') ||
          !item.abstract_original || !item.abstract_language || !/^https?:\/\//i.test(item.abstract_source_url ?? '') ||
          (!/^zh(?:-|$)/i.test(item.abstract_language) && !item.abstract_zh_translation))) {
        throw new Error(`Published paper ${item.id} lacks first-author affiliation, original abstract, or Chinese translation`);
      }
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
