# RoboticsNews 周报维护手册

本手册供新的会话或维护者直接接手周报。先按本文件执行操作，再用 [采编规范](EDITORIAL_GUIDE.md) 判断信源、选题和证据，按 [呈现规范](PRESENTATION_SPEC.md) 与 [周报模板](ISSUE_TEMPLATE.md) 核对网页和 PDF。遇到文档与程序不一致，以**实际代码和数据库结构**为准，修正文档后继续；不要猜测命令已经具备的功能。

## 1. 本项目究竟如何运行

| 对象 | 作用 | 是否提交到 Git |
| --- | --- | --- |
| `data/robotics_news.sqlite` | 本地条目与信源库；`scripts/db.mjs` 读写 | 否；换电脑或新克隆仓库时不会自动出现 |
| `data/issues/YYYY-MM-DD.entries.json` | 该刊期的可回填条目文件；日期为**周一刊期** | 可提交；先检查内容和许可 |
| `data/issues/YYYY-MM-DD.json` | 可选刊期元数据；`coverage_start/end` 必须等于上周一/周日 | 可提交；内部记录不会自动写入页面 |
| `site/index.html` | 当前网页；每次正式生成或预告生成都会覆盖 | 是 |
| `site/current.json` | 当前正式刊的机器可读公开数据；预告模式会删除 | 是，正式刊才存在 |
| `site/style.css`、`site/.nojekyll` | 页面样式、Pages 静态站点配置 | 是 |
| `diarys/YYYY-MM-DD.pdf` | 逐期 PDF 归档；旧文件应保留 | 是 |
| `.github/workflows/pages.yml` | 监听 `site/**` 推送并部署 GitHub Pages | 是 |

网页地址：[RoboticsNews 项目站点](https://hancheng-guo.github.io/RoboticsNews/)。PDF 链接指向仓库 `main` 分支根目录的 `diarys/`。当前构建脚本**不自动抓取新闻、不自动总结论文、也没有每周定时生成任务**；必须先完成采编并入库、生成，再交给用户审阅，获得明确同意后才提交和推送。GitHub Actions 只负责部署已提交的网站文件。

截至 2026-11-01 的一次性状态：网站是 2026-11-02 周报预告；旧 2026-11-01 三日报 PDF 是历史归档，不能直接改名冒充覆盖 10 月 26 日至 11 月 1 日的完整周报。接手时重新检查 `git status`、站点和数据库，以实时状态为准。

## 2. 新会话开始时先做什么

1. 在仓库根目录确认当前北京时间、分支、远端和未提交修改；不要覆盖他人正在编辑的文件。
2. 读本文件、[采编规范](EDITORIAL_GUIDE.md)、[呈现规范](PRESENTATION_SPEC.md)、[周报模板](ISSUE_TEMPLATE.md)、[README](../README.md)、[数据库说明](../data/README.md)。确认最近一次周报的刊期和站点状态。
3. 确认 Node.js 24、Python 3 和 `reportlab` 可用；执行 `node scripts/db.mjs init` 创建或迁移本地库。
4. 用 `node scripts/db.mjs stats` 检查库内是否有预期条目。**不能因为库为空就生成并发布空白周报**：先查找备份或已提交的 `data/issues/*.entries.json`，再按需导入。
5. 明确本次刊期 `YYYY-MM-DD`：必须是北京时间周一；覆盖上一周一 00:00（含）至本周一 00:00（不含）。例如 **2026-11-02 刊覆盖 2026-10-26 至 2026-11-01**。周日尚未结束时，只能发布预告。

```powershell
git status --short
git branch --show-current
git remote -v
node --version
node scripts/db.mjs init
node scripts/db.mjs stats
node scripts/db.mjs search --date 2026-11-02 --limit 100
```

`db.mjs` 的 `search --date` 查的是**刊期日期**，不是消息发生日期。项目目前没有按 `event_time_bj` 搜索的命令。`stats` 只能说明库中有多少记录，不能证明本周采集完整。数据库以本地文件为准；不要把它当成已同步到 GitHub 的数据。

### 从条目文件恢复数据库

本地库丢失时，先查找 `data/issues/YYYY-MM-DD.entries.json`。下面的 2026-11-02 文件名是**未来刊期示例**，只有文件确实存在并核对内容后才能执行。`add` 支持 JSON 对象数组；重复 ID 会报错。只导入确认过的文件，避免把历史记录改成新刊。

```powershell
node scripts/db.mjs init
node scripts/db.mjs add data/issues/2026-11-02.entries.json
node scripts/db.mjs search --date 2026-11-02 --limit 100
```

既有条目需要修改时，使用 `replace` 而非再次 `add`。`replace` 要求 ID 已存在；批量写入发生在事务中，任一条失败会回滚本批。停写后备份 SQLite，或用 SQLite 一致性备份方式处理正在使用的数据库。不要把 `data/*.sqlite`、其 WAL/SHM 文件提交到 Git。

## 3. 每周采集与候选池

按 [采编规范第 2–3 节](EDITORIAL_GUIDE.md) 的主题地图和信源目录持续扫描：arXiv 与论文/会议官方页面、高校与实验室公告、ROS/GitHub/Hugging Face 等技术平台、企业/客户原始公告、证券披露、监管与标准正文。全球范围内按价值入选，兼顾中国，不设地区或企业席位。学术为主，但不设固定比例。

发现线索时立即保存：原始 URL、发布主体、原始时间和时区、北京时间换算、首次发现时间、事件类型、候选理由。媒体转载和社交平台可帮忙发现，不单独支撑事实。核对的终点应是论文版本页及全文、会议录用页、项目仓库 release、企业公告、客户文件、监管披露或标准原文。链接失效、发布时间不清、正文与标题冲突时保持候选或暂缓状态。

逐个方向检索，避免只靠单一热词。至少覆盖机器人学习、操作与触觉、移动与导航、控制、感知、硬件形态、仿真与开源、安全与人机协作、行业应用、政策标准和投融资。周中持续去重和深读；周一凌晨只补足周日尾段与最终核验。

### 时间、去重和补录

- 以**新事件首次公开时间**落入上周窗口为准。发布日期只有日期时保留日期精度，不补造时分。涉及跨时区边界时核对原始页面时间戳并记录换算依据。
- DOI、arXiv ID、版本号、规范化 URL、产品型号和事件主体联合去重。同一论文的预印本、项目页和新闻稿通常归一条；正式录用、重大修订、开源代码或独立验证确有新增事实时可作为后续进展。
- 不因周一才发现的旧新闻自动纳入本刊。重要漏报先留在候选池，计划在下期“补录与更正”注明原事件日期与补录原因。**当前构建器会拒绝所有统计窗口外的 `event_time_bj`，补录旧事件前必须先实现并验证专门的补录规则**，不能改写原始事件日期来绕过校验。
- 已发布的旧刊不静默改写。更正需说明具体变化；影响 PDF 的更正应先保存旧 PDF，再生成修订版并保留可追溯的版本记录。当前脚本始终输出 `diarys/YYYY-MM-DD.pdf`，没有自动版本管理。
- 目标是 10–15 条主要内容；合格条目不足时减少数量。论文速览也必须满足论文核验与字段要求。

## 4. 选题与证据判定

候选先满足四个条件：直接关联机器人研发/应用；有新的事件或证据；能确认时间窗口；有可追溯的一手来源。再按新增量、影响、证据强度、读者可用性各 0–2 分排序，并保持主题多样性。评分辅助编辑，不取代核验。具体评分、排除项和分类型清单见 [采编规范第 4–6 节](EDITORIAL_GUIDE.md)。

对每条至少核对：标题中的事实、发布时间、主体、所有数字及单位、实验或部署条件、支持材料是否真的可访问、主张是否只来自机构本身。企业单方发布可入选甚至成为重点，但证据标签用 `official_claim`，标题和正文明确归属，页面显示“机构宣称，未独立验证”。预印本用 `preprint`，不能写成已同行评审。会议/期刊状态要在官方页面核对。

论文必须额外完成以下工作：

1. 打开**本条所引用版本**的论文全文，核对题名、第一作者、作者排序、第一作者所有单位、版本号、DOI/arXiv ID、首次公开/正式录用日期。单位以论文署名页为准；不根据作者国籍或新闻稿推断。
2. 从同一版本保存摘要原文到 `abstract_original`，保留原词、符号、数字及限定语；记录 `abstract_language`、`abstract_source_url`。核对公开转载摘要的许可与署名条件；未确认可发布时暂缓该论文，不用自行改写的摘要冒充原文。
3. 阅读方法、实验、结果表、消融和局限；记录实际阅读的 `full_text_url` 和 `full_text_verified_at`。对关键数字标注正文图/表/章节位置于内部 `claim_evidence_notes`，不得只凭摘要或新闻稿编写“全文总结”。
4. `full_text_contributions_zh` 与 `full_text_contributions_en` 写**基于全文的主要贡献**：新方法是什么，主要实验观察是什么、条件和基线是什么，相对已有工作的增量与边界是什么。区分作者报告与独立验证。页面顺序固定为“第一作者及单位 → 摘要原文 → 全文主要贡献”。
5. 检查代码、权重、数据、评测协议是否实际开放；“有链接”不等于“可复现”。别跨任务或跨评测协议直接比较数值。

## 5. 录入与状态流转

字段以 [schema.sql](../data/schema.sql) 和 [示例条目](../data/entry.example.json) 为准；`db.mjs` 不会替你完成事实核验。`id` 是稳定事件 ID，不随标题修改；`issue_date` 是周一刊期。`event_time_original` 保留源时区，`event_time_bj` 使用可核实的北京时间。日期只有日精度时可用 `YYYY-MM-DD`。`topics`、`geography`、`entities`、`supporting_urls`、`first_author_affiliations` 都是数组。

| 字段组 | 使用规则 |
| --- | --- |
| `title_original`, `title_zh`, `title_en`, `summary_zh`, `summary_en` | 所有条目都要填写；论文的 `summary_*` 为检索/数据字段，公开页面以原文摘要和全文贡献总结为主 |
| `category`, `placement` | 类型与栏目不同；`paper_briefs` 只是展示位置，不能降低论文核验门槛 |
| `evidence_status`, `publication_status`, `deployment_stage` | 分别表示证据状态、论文出版状态和实际部署阶段；不要混用 |
| `primary_url`, `supporting_urls`, `paper_id`, `code_url`, `data_url` | 原始材料与辅助证据；空缺时用 `null` 或空数组，不伪造 URL |
| `score`, `why_it_matters_zh`, `limitations_zh` | 排序和解释；具体限制应可定位到原始材料或明确写“未披露” |
| `claim_evidence_notes` | 内部核查记录；构建器不把该字段写进 `site/current.json`、网页或 PDF，但若提交条目 JSON 到公开仓库，该文件本身仍可被公众查看 |
| `editorial_status` | `candidate` → `verifying` → `approved` → `published`；证据不足用 `held`，不收录用 `rejected`，更正用 `corrected`。构建器只读取 `published` |

论文在 2026-11-02 及之后的刊期标为 `published` 时，数据库写入程序要求第一作者、单位、摘要原文及来源、全文链接与核验时间、两种语言的贡献总结。网页构建器再次检查这些字段。先保存候选 JSON，完成核验后再改为 `published` 并用 `add`/`replace` 入库。`add` 和 `replace` 都接受单个对象或对象数组文件。

```powershell
node scripts/db.mjs add data/issues/2026-11-02.entries.json
node scripts/db.mjs get example-2026-11-02-001
node scripts/db.mjs search --date 2026-11-02 --status published --limit 100
```

上述 `example-...` 是命令格式示意，不能作为真实新闻入库。正式条目文件应只包含真实核验结果。现有 2026-11-01 旧条目缺少新论文字段，不能简单把 `issue_date` 改成 2026-11-02；必须逐篇重查论文全文、第一作者单位、摘要许可，并补齐整周其他日期的采集。

## 6. 周一出版流程

### 6.1 截稿前

在周日结束前持续收集；周一 00:00 之后核对完整窗口。检查 `data/issues/YYYY-MM-DD.entries.json` 里的刊期、事件时间、重复条目、链接和许可。可选元数据 `data/issues/YYYY-MM-DD.json` 若写 `coverage_start/end`，必须准确为上一周一、周日；编辑说明和核查记录留在内部数据，不写入公开网页/PDF。

在发布前运行 `node scripts/db.mjs stats` 与 `search --date ... --status published`，确认数据库确实含有目标刊期已发布条目。不要通过新建一个空元数据文件来生成貌似正式的空刊。

### 6.2 生成

明确指定刊期，避免默认日期被当前时区或运行日误解。Windows 上的 `python` 可能指向不可运行的应用商店占位程序，必要时指定真实 Python 路径；Python 需安装 `reportlab`。

```powershell
$env:ROBOTICS_NEWS_PYTHON = 'C:\path\to\python.exe'
node scripts/build-site.mjs --date 2026-11-02
```

输出应是 `site/index.html`、`site/current.json`、`diarys/2026-11-02.pdf`。网页只保留当期，PDF 每期新文件。`--date` 非周一会失败；条目事件日期不在统计窗口、论文必填项缺失或元数据窗口不一致也会失败。失败后检查源数据再重试，不要绕过校验或发布半成品。

周报未到出版时间而需要先展示预告时：

```powershell
node scripts/build-site.mjs --preview --date 2026-11-02
```

预告会覆盖首页并删除 `site/current.json`，**不会生成 PDF**。它不是正式刊。不要为了测试在真实 `site/` 下执行预告或正式构建；测试时用 `ROBOTICS_NEWS_DB`、`ROBOTICS_NEWS_SITE_DIR` 和 `ROBOTICS_NEWS_PDF_DIR` 指向 `tmp/` 下隔离目录。

### 6.3 发布前检查

逐项确认：

- 日期是周一，窗口恰好是上周一至周日；没有把未结束的周报成完整刊，也没有因源站时区误放条目。
- `site/current.json` 的 `date`、`coverage_start/end`、条目数与正文一致；每条来源链接可打开；没有 `claim_evidence_notes`、编辑说明或核查记录。
- 每篇论文都显示**第一作者单位、摘要原文、全文主要贡献**，且摘要与所引版本逐字核对；PDF 和网页顺序一致。
- 企业宣称和预印本有恰当证据标签；数字、单位、会议/期刊状态、部署阶段及局限写法与原文一致。
- 网页顶部有醒目的 **`AI生成`**；PDF 首页有同样标记；网站上不出现编辑说明与内部核查记录。
- PDF 可以打开，标题、页数、中文和英文都正常显示，无截断、重叠或空页；PDF 链接指向本期真实文件。旧 PDF 未被删除或覆盖。
- `git diff` 中只包含预期文件；尤其检查 `site/index.html`、`site/current.json`、`diarys/YYYY-MM-DD.pdf` 和归档条目文件。不要提交本地 SQLite、临时文件、未授权摘要或内部敏感信息。

```powershell
git status --short
git diff --check
node scripts/db.mjs search --date 2026-11-02 --status published --limit 100
```

若系统有 Poppler，可用 `pdfinfo diarys/2026-11-02.pdf` 检查页数，并用 `pdftoppm -f 1 -l 1 -png diarys/2026-11-02.pdf tmp/weekly-cover` 渲染首页目视检查。多页时抽查中间页和末页。网页也需在浏览器查看桌面与窄屏布局。逐项对照[呈现规范](PRESENTATION_SPEC.md)和[周报模板](ISSUE_TEMPLATE.md)；只检查命令退出码不足以证明页面可读。

### 6.4 审阅、提交、部署和核验

完成核对后，**先把改动和检查结果交给用户审阅；未经用户明确同意，不得 commit 或 push**。用户审阅并明确授权后，才提交并推送网站、该期 PDF 和可公开的条目归档。现有 [Pages 工作流](../.github/workflows/pages.yml)只在 `site/**` 或工作流文件变化的 `main` 推送时启动；只推 PDF 不会触发网页部署。网站来源必须是 GitHub Actions。发布前检查公开仓库中可能暴露的内容。提交后检查对应工作流运行成功、站点实际返回本期内容、网页 PDF 链接可用。不要仅凭 `git push` 成功就声称网站已上线。

```powershell
git add site/index.html site/current.json site/style.css diarys/2026-11-02.pdf data/issues/2026-11-02.entries.json
git diff --cached --stat
git commit -m "Publish robotics weekly brief for 2026-11-02"
git push origin main
```

以上命令**只供用户审阅并明确授权后执行**；路径和日期是示例，按实际刊期替换。若 `site/current.json` 被预告模式删除，应在提交时显式暂存该删除。推送后到 GitHub Actions 的 **Deploy RoboticsNews site** 运行页查看状态，再打开[站点](https://hancheng-guo.github.io/RoboticsNews/)检查标题、刊期、`AI生成` 和 PDF。Pages/CDN 可能短暂延迟；工作流失败时先查日志，按错误原因修复，不通过删除历史部署或 PDF 作为常规排障手段。

## 7. 常见故障与处理

当前还有三项实现边界：没有自动采集或每周定时任务；没有批量导出 SQLite 刊期的命令，因此应在入库前维护可回填的条目 JSON；构建器尚未支持窗口外旧事件的补录。这些能力如需扩展，应先修改程序和验证流程，再更新本手册，不通过修改数据来伪装已经支持。

| 现象 | 先检查什么 | 处理 |
| --- | --- | --- |
| `Weekly issue date must be a Monday` | `--date` 是否为北京时间周一 | 用正确刊期，不改程序放宽限制 |
| `Entry ... is outside the Beijing coverage window` | `event_time_bj`、原始时区、刊期 | 核对源时间并换算；不在本周的新事件移至正确刊期或补录 |
| `Published paper ... lacks ... fields` | 第一作者/单位、原文摘要、全文 URL、贡献总结和核验时间 | 回到论文全文补齐；未核实则改回 `held`，不编造 |
| 本地没有数据库或条目数为 0 | 本地 `data/*.sqlite` 是否丢失、条目归档是否存在 | 恢复备份或导入经核实的归档；不要发布空刊 |
| Python 无法启动 / `reportlab` 缺失 | `ROBOTICS_NEWS_PYTHON` 路径与 Python 环境 | 指向可执行 Python，安装 `reportlab` 后在隔离输出目录重试 |
| 元数据窗口不一致 | `data/issues/YYYY-MM-DD.json` 的 `coverage_start/end` | 改成上周一/周日，不修改生成器的周界规则 |
| 站点仍显示旧刊或预告 | 新 `site/index.html` 是否已提交、Pages 工作流是否成功、缓存 | 核实提交 SHA 与部署、稍后强制刷新；避免重复制造部署 |
| PDF 链接 404 | 本期 PDF 是否提交并推送至 `diarys/`，仓库地址是否变化 | 补推 PDF；迁移仓库时设置 `ROBOTICS_NEWS_PDF_URL_BASE` |

## 8. 完成一期后向用户报告什么

简要写明：刊期与北京时间窗口、入选总数及论文数、网页与 PDF 链接、是否有补录/更正、部署是否成功、尚未核实而被暂缓的关键消息。若只完成预告或草稿，要明确写“预告/草稿”，不要声称正式周报已发布。

## 9. 可直接交给新会话的任务描述

> 请在 `RoboticsNews` 仓库中维护下一期机器人学周报。先读 `AGENTS.md`、`docs/WEEKLY_OPERATIONS.md`、`docs/EDITORIAL_GUIDE.md`、`docs/PRESENTATION_SPEC.md` 和 `docs/ISSUE_TEMPLATE.md`，确认当前北京时间、周一刊期和上一完整自然周的窗口。按信源目录采集并核实真实进展，论文逐篇读全文并补第一作者单位、摘要原文和中英全文贡献总结。将核实后的条目录入本地数据库并保存可恢复的刊期条目文件，生成当前网页和根目录 `diarys/` 中的新 PDF，检查 `AI生成` 标识、所有链接、日期、证据标签和页面/PDF 排版，并把改动交给我审阅。未经我明确同意，不要 commit 或 push。无法核实的内容暂缓，不以旧三日报充当新周报。
