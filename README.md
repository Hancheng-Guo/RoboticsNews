# RoboticsNews

机器人学研究进展周报的采编规则见 [EDITORIAL_GUIDE.md](docs/EDITORIAL_GUIDE.md)，网页/PDF 规则与结构模板见 [PRESENTATION_SPEC.md](docs/PRESENTATION_SPEC.md) 和 [ISSUE_TEMPLATE.md](docs/ISSUE_TEMPLATE.md)。新会话接手与每期发布的操作流程见 [WEEKLY_OPERATIONS.md](docs/WEEKLY_OPERATIONS.md)。每周一北京时间 08:00 发布，汇总上一个完整自然周（周一至周日）的进展。

## 数据存储与查找

条目和信源保存在 `data/robotics_news.sqlite`，使用 Node.js 24 的内置 SQLite，无需安装依赖。表结构和备份说明见 [data/README.md](data/README.md)。数据库文件不纳入 Git；脚本和字段定义纳入 Git。

```powershell
node scripts/db.mjs init
node scripts/db.mjs add path/to/entry.json
node scripts/db.mjs replace path/to/updated-entry.json
node scripts/db.mjs search --date 2026-11-02
node scripts/db.mjs search --q 触觉 --topic manipulation --status published
node scripts/db.mjs search --entity "Example Lab" --category paper --limit 20
node scripts/db.mjs get example-2026-11-02-001
node scripts/db.mjs stats
```

单条记录格式见 [data/entry.example.json](data/entry.example.json)。`add` 支持一个 JSON 对象或对象数组，重复 ID 会报错；修改已有记录时使用 `replace`，并保留原创建时间。`search` 的关键词匹配支持中英文子串；日期、类别、状态、主题、机构可以组合筛选。`sources` 列出已登记的信源；用 `add-source source.json` 添加信源，字段参见 `data/schema.sql` 的 `sources` 表。设置环境变量 `ROBOTICS_NEWS_DB` 可指定另一数据库路径。

## 生成周报网页与 PDF

先运行 `node scripts/db.mjs init` 迁移旧数据库。将条目的 `editorial_status` 设为 `published`，并填写周一的 `issue_date`、中英概述和 `placement`。论文还须填写第一作者姓名、其全部单位和能显示该单位的一手依据 URL（可与论文原始链接相同）、所引版本的摘要原文与来源；非中文摘要另填忠实的中文翻译。网页和 PDF 分别标记“第一作者”“第一作者单位”并链接单位依据，不要求阅读论文全文或撰写全文贡献总结。完成后运行：

```powershell
$env:ROBOTICS_NEWS_PYTHON = 'C:\path\to\python.exe' # 需安装 reportlab；若 python 已在 PATH 可省略
node scripts/build-site.mjs --date 2026-11-02
```

在完整统计周结束、正式内容尚未核验完成时，可以先发布下一期预告页：

```powershell
node scripts/build-site.mjs --preview --date 2026-11-02
```

预告只生成 `site/index.html`，会移除旧的 `site/current.json`，不生成空白 PDF。正式出版时重新运行不带 `--preview` 的命令。

不传 `--date` 时，默认以最近一个北京时间周一为刊期。刊期日期必须是周一；例如 2026-11-02 刊覆盖 2026-10-26 至 2026-11-01。周报应在覆盖周结束后、周一 08:00 发布。脚本从本地 SQLite 读取该刊期**已发布**条目，覆盖 `site/index.html` 与 `site/current.json`，并在仓库根目录的 `diarys/YYYY-MM-DD.pdf` 新增该期 PDF。网页只显示本期内容；旧 PDF 按日期保留，网页通过 GitHub 原始文件链接访问 PDF。刊期元数据可写在 `data/issues/YYYY-MM-DD.json`，已核实条目可保存为 `data/issues/YYYY-MM-DD.entries.json` 并导入数据库。没有条目且没有刊期元数据时，首页显示暂无内容；有刊期元数据时仍生成 PDF。PDF 使用 Python 3 与 `reportlab`；网页生成使用 Node.js 24 的内置 SQLite。若仓库地址改变，设置 `ROBOTICS_NEWS_PDF_URL_BASE` 为 `diarys` 的公开 URL 基址；PDF 输出目录可由 `ROBOTICS_NEWS_PDF_DIR` 覆盖。

在 GitHub 仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。提交并推送 `site/` 后，[Pages 工作流](.github/workflows/pages.yml)会发布网站；预期项目站点地址为 `https://hancheng-guo.github.io/RoboticsNews/`，以工作流返回的实际 URL 为准。本地数据库不会上传，只有 `site/` 内的已发布内容会公开。若用户在任务中明确授权直接发布，完成核验后可提交、推送并验证站点；否则先交给用户审阅，获得明确同意后再提交、推送。网页顶部和 PDF 首页均标明“AI生成”。

