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

网页地址：[RoboticsNews 项目站点](https://hancheng-guo.github.io/RoboticsNews/)。PDF 链接指向仓库 `main` 分支根目录的 `diarys/`。**每条公开网页卡片和 PDF 条目只展示一条 `primary_url` 来源链接**；论文摘要、单位、通讯作者、许可、代码和数据等依据 URL 仍在条目数据中记录供核查，但不作为卡片中的额外链接。刊期 PDF 与上一版 PDF 的导航链接不计入条目来源链接。当前构建脚本**不自动抓取新闻、不自动总结论文、也没有每周定时生成任务**；必须先完成采编、入库、生成和核验。用户若在任务中明确授权直接发布，才可随任务提交、推送并验证站点；否则先交给用户审阅，获得明确同意后再提交和推送。GitHub Actions 只负责部署已提交的网站文件。

本项目只维护周报。接手时重新检查 `git status`、站点和数据库，以实时状态为准；不要从已删除的旧刊恢复或改名生成周报。

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

发现线索时立即保存：来源 URL、发布主体、原始时间和时区、北京时间换算、首次发现时间、事件类型、候选理由。优先追到论文版本页、会议录用页、项目仓库 release、企业公告、客户文件、监管披露或标准原文。论文一手链接经检索仍找不到时，允许有明确标记的转载链接；必须另核实可确认的日期及至少一位作者。链接失效、日期或作者仍无法确认、正文与标题冲突时保持候选或暂缓状态。

逐个方向检索，避免只靠单一热词。至少覆盖机器人学习、操作与触觉、移动与导航、控制、感知、硬件形态、仿真与开源、安全与人机协作、行业应用、政策标准和投融资。周中持续去重和深读；周一凌晨只补足周日尾段与最终核验。

### 时间、去重和补录

- 以**新事件首次公开时间**落入上周窗口为准。发布日期只有日期时保留日期精度，不补造时分。涉及跨时区边界时核对原始页面时间戳并记录换算依据。
- DOI、arXiv ID、版本号、规范化 URL、产品型号和事件主体联合去重。同一论文的预印本、项目页和新闻稿通常归一条；正式录用、重大修订、开源代码或独立验证确有新增事实时可作为后续进展。
- 不因周一才发现的旧新闻自动纳入本刊。重要漏报先留在候选池，计划在下期“补录与更正”注明原事件日期与补录原因。**当前构建器会拒绝所有统计窗口外的 `event_time_bj`，补录旧事件前必须先实现并验证专门的补录规则**，不能改写原始事件日期来绕过校验。
- 已发布的旧刊不静默改写。更正需说明具体变化；影响 PDF 的更正应先保存旧 PDF，再生成修订版并保留可追溯的版本记录。当前脚本始终输出 `diarys/YYYY-MM-DD.pdf`，没有自动版本管理。
- 目标是 10–15 条主要内容；合格条目不足时减少数量。论文速览也必须满足论文核验与字段要求。

## 4. 选题与证据判定

候选先满足四个条件：直接关联机器人研发/应用；有新的事件或证据；能确认时间窗口；有可追溯来源。论文优先一手来源，找不到时可用标记清楚的转载；无可确认日期或完全无作者的论文不收录。再按新增量、影响、证据强度、读者可用性各 0–2 分排序，并保持主题多样性。评分辅助编辑，不取代核验。具体规则见 [采编规范第 4–6 节](EDITORIAL_GUIDE.md)。

对每条至少核对：标题中的事实、发布时间、主体、所有数字及单位、实验或部署条件、支持材料是否真的可访问、主张是否只来自机构本身。企业单方发布可入选甚至成为重点，但证据标签用 `official_claim`，标题和正文明确归属，页面显示“机构宣称，未独立验证”。预印本用 `preprint`，不能写成已同行评审。会议/期刊状态要在官方页面核对。

论文必须额外完成以下工作：

1. 优先打开论文一手页面，核对题名、作者顺序、版本、DOI/arXiv ID、首次公开或正式录用日期；只记录能确认的字段。作者全名或缩写均可，`paper_authors` 至少一人且首项与 `first_author_name` 一致。日期或作者缺失时继续搜索其他可追溯来源；仍无法确认则不收录。其他来源给出的日期依据存入 `supporting_urls`。
2. **逐篇检查第一作者单位。** arXiv 摘要页通常不列单位；预印本先打开同一版本的 HTML 全文和 PDF 首页，按作者上标、脚注与单位编号核对第一作者的全部单位，再检查论文项目页、出版方作者页。HTML 转换可能把多个作者和单位挤在一行；对应关系不清时回到 PDF 版面核对。核实后每项写“单位名，国家或地区”并记录能直接证明对应关系的依据 URL。只有上述材料无法访问或核对后仍不能确认，才留空并标“不明确”；记录已尝试的材料和失败原因。不把通讯作者、合作机构或作者现职当成论文署名单位。
   同时检查论文或官方项目页是否**明确标记通讯作者**。逐位记录其姓名、按上标或脚注对应的全部署名单位及直接依据 URL，格式为“单位名，国家或地区”；不要凭作者顺序、邮箱或现职推定。无明确标记时保留空数组，公开显示“论文未注明通讯作者”。
3. 优先使用原文摘要及忠实中文翻译：arXiv 摘要页和 OpenReview 的公开论文摘要属于 CC0 元数据；PMLR 及 2016 年起的 ACL Anthology 论文有 CC BY 路径；其他来源按[采编规范的逐平台规则](EDITORIAL_GUIDE.md#摘要原文与中文翻译的转载判定)查该篇、该版本许可。先查可用的一手摘要版本，不能因为某个 PDF 的许可受限就直接改写转述。记录摘要来源 URL、许可、作者与译者信息；只有确实找不到允许原文及公开译文的版本，才在 `summary_zh` 与 `summary_en` 写中英转述，并公开标为“论文内容转述”。
4. 找不到论文一手链接时，可在完成检索后把转载链接填入 `primary_url`，设置 `paper_source_type: reprint`；页面须注明该来源性质。没有一手证据时，不将转载对录用、同行评审或性能的说法写成已核实事实。核对署名和摘要时应尝试可公开访问的 HTML/PDF；**不要求受限全文访问，也不撰写基于全文的贡献总结。**
5. 检查代码、权重、数据、评测协议是否实际开放；“有链接”不等于“可复现”。别跨任务或跨评测协议直接比较数值。

## 5. 录入与状态流转

字段以 [schema.sql](../data/schema.sql) 和 [示例条目](../data/entry.example.json) 为准；`db.mjs` 不会替你完成事实核验。`id` 是稳定事件 ID，不随标题修改；`issue_date` 是周一刊期。`event_time_original` 保留源时区，`event_time_bj` 使用可核实的北京时间。日期只有日精度时可用 `YYYY-MM-DD`。`topics`、`geography`、`entities`、`supporting_urls`、`paper_authors`、`first_author_affiliations` 都是数组。

| 字段组 | 使用规则 |
| --- | --- |
| `title_original`, `title_zh`, `title_en`, `summary_zh`, `summary_en` | 所有条目都要填写；论文在摘要不能转载时公开展示 `summary_*` 的中英转述 |
| `category`, `placement`, `featured`, `importance_rank` | 类型与栏目不同；重点条目仍归所属栏目，`featured` 只控制橙色角标。栏目内重点先行，再按评分和正整数 `importance_rank` 排序。旧 `lead` 仅为数据库兼容，不得用于新刊 |
| `corresponding_authors` | 数组，每项含论文作者表中的 `name`、简短 `affiliations` 数组和 `source_url`；只有明确标记且单位对应关系可核实时才填写 |
| `evidence_status`, `publication_status`, `deployment_stage` | 分别表示证据状态、论文出版状态和实际部署阶段；不要混用 |
| `primary_url`, `paper_source_type`, `supporting_urls`, `paper_id`, `code_url`, `data_url` | 论文优先一手链接，确实没有时可标记 `reprint`；日期依据可放 `supporting_urls`，不伪造 DOI 或 URL |
| `score`, `why_it_matters_zh`, `limitations_zh` | 排序和解释；具体限制应可定位到原始材料或明确写“未披露” |
| `claim_evidence_notes` | 内部核查记录；构建器不把该字段写进 `site/current.json`、网页或 PDF，但若提交条目 JSON 到公开仓库，该文件本身仍可被公众查看 |
| `editorial_status` | `candidate` → `verifying` → `approved` → `published`；证据不足用 `held`，不收录用 `rejected`，更正用 `corrected`。构建器只读取 `published` |

论文在 2026-11-02 及之后的刊期标为 `published` 时，数据库写入程序要求可解析的日期、至少一位作者及来源链接；作者可用来源中的缩写。单位、摘要原文及译文是有条件字段：展示单位时须有依据 URL；展示原文时须有摘要来源，非中文原文须有中文翻译。网页构建器再次检查这些结构字段，并警告仍无第一作者单位的论文，提示回查 HTML/PDF；警告本身不阻止合法的“不明确”记录。程序无法替代对日期、作者、转载性质和摘要许可的人工核验。先保存候选 JSON，完成核验后再改为 `published` 并用 `add`/`replace` 入库。

```powershell
node scripts/db.mjs add data/issues/2026-11-02.entries.json
node scripts/db.mjs get example-2026-11-02-001
node scripts/db.mjs search --date 2026-11-02 --status published --limit 100
```

上述 `example-...` 是命令格式示意，不能作为真实新闻入库。正式条目文件应只包含真实核验结果；不能从旧刊改日期或恢复成新周报。

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

输出应是 `site/index.html`、`site/current.json`、`diarys/2026-11-02.pdf`。网页只保留当期，PDF 每期新文件。PDF 生成需可嵌入的中文无衬线常规和粗体字体；系统未提供时，同时设置 `ROBOTICS_NEWS_PDF_FONT_REGULAR` 与 `ROBOTICS_NEWS_PDF_FONT_BOLD` 为本机字体文件路径，见[呈现规范](PRESENTATION_SPEC.md)。`--date` 非周一会失败；条目事件日期不在统计窗口、论文必填项缺失或元数据窗口不一致也会失败。失败后检查源数据再重试，不要绕过校验或发布半成品。

周报未到出版时间而需要先展示预告时：

```powershell
node scripts/build-site.mjs --preview --date 2026-11-02
```

预告会覆盖首页并删除 `site/current.json`，**不会生成 PDF**。它不是正式刊。不要为了测试在真实 `site/` 下执行预告或正式构建；测试时用 `ROBOTICS_NEWS_DB`、`ROBOTICS_NEWS_SITE_DIR` 和 `ROBOTICS_NEWS_PDF_DIR` 指向 `tmp/` 下隔离目录。

### 6.3 发布前检查

逐项确认：

- 日期是周一，窗口恰好是上周一至周日；没有把未结束的周报成完整刊，也没有因源站时区误放条目。
- `site/current.json` 的 `date`、`coverage_start/end`、条目数与正文一致；每条来源链接可打开；没有 `claim_evidence_notes`、编辑说明或核查记录。
- 每篇论文至少有可确认的日期和一位作者；作者按来源使用全名或缩写。对预印本逐篇检查 HTML/PDF 署名页和作者单位对应关系；第一作者及明确标记的通讯作者单位可核实时以“单位名，国家或地区”展示，并在数据中记录直接依据 URL。无明确通讯标记时公开写“论文未注明通讯作者”。摘要可转载时展示原文与必要译文，否则只展示明确标记的转述；转载来源也须标明。PDF 和网页表述一致，不出现全文贡献总结。
- 网页和 PDF 的每个条目恰有一条可点击的 `primary_url` 来源链接；没有摘要、单位、通讯作者、许可、代码、数据或其他核查依据的附加链接。核查字段仍保存在条目归档和机器可读数据中，不得因页面简化而停止核验。刊期 PDF 和历史版本 PDF 链接是页面导航，不计入条目链接数。
- 企业宣称和预印本有恰当证据标签；数字、单位、会议/期刊状态、部署阶段及局限写法与原文一致。
- 网页顶部有醒目的 **`AI生成`**；PDF 首页有同样标记；网站上不出现编辑说明与内部核查记录。
- PDF 文件存在且非空，工具可读取页数和基本元数据；若能可靠提取文本，核对刊期、标题、`AI生成`、论文单位、摘要及译文。PDF 链接指向本期真实文件，历史**周报** PDF 未被误删或覆盖。
- `git diff` 中只包含预期文件；尤其检查 `site/index.html`、`site/current.json`、`diarys/YYYY-MM-DD.pdf` 和归档条目文件。不要提交本地 SQLite、临时文件、未授权摘要或内部敏感信息。

```powershell
git status --short
git diff --check
node scripts/db.mjs search --date 2026-11-02 --status published --limit 100
```

若系统有 Poppler，可用 `pdfinfo diarys/2026-11-02.pdf` 检查页数，并在文本提取可靠时用 `pdftotext diarys/2026-11-02.pdf -` 抽查关键字段。对照[呈现规范](PRESENTATION_SPEC.md)和[周报模板](ISSUE_TEMPLATE.md)检查 HTML、JSON 与 PDF 的内容一致性。浏览器或图片渲染检查仅作可选补充，不是发布门槛；未执行时如实说明。

### 6.4 审阅、提交、部署和核验

完成核对后，先确定本次任务的授权范围：**用户已明确要求直接把本期周报发布到 GitHub Pages，并授权 commit 和 push**，即可提交并推送网站、该期 PDF 和可公开的条目归档；没有这项明确授权时，先把改动和检查结果交给用户审阅，待其明确同意后再提交和推送。不要把过去某期的发布授权当作以后每期的授权。现有 [Pages 工作流](../.github/workflows/pages.yml)只在 `site/**` 或工作流文件变化的 `main` 推送时启动；只推 PDF 不会触发网页部署。网站来源必须是 GitHub Actions。发布前检查公开仓库中可能暴露的内容。提交后检查对应工作流运行成功、站点实际返回本期内容、网页 PDF 链接可用。不要仅凭 `git push` 成功就声称网站已上线。

```powershell
git add site/index.html site/current.json site/style.css diarys/2026-11-02.pdf data/issues/2026-11-02.entries.json
git diff --cached --stat
git commit -m "Publish robotics weekly brief for 2026-11-02"
git push origin main
```

以上命令仅在本次任务已明确授权 commit/push 后执行；路径和日期是示例，按实际刊期替换。若 `site/current.json` 被预告模式删除，应在提交时显式暂存该删除。推送后到 GitHub Actions 的 **Deploy RoboticsNews site** 运行页查看状态，再打开[站点](https://hancheng-guo.github.io/RoboticsNews/)检查标题、刊期、`AI生成` 和 PDF。Pages/CDN 可能短暂延迟；工作流失败时先查日志，按错误原因修复，不通过删除历史部署或 PDF 作为常规排障手段。

## 7. 常见故障与处理

当前还有三项实现边界：没有自动采集或每周定时任务；没有批量导出 SQLite 刊期的命令，因此应在入库前维护可回填的条目 JSON；构建器尚未支持窗口外旧事件的补录。这些能力如需扩展，应先修改程序和验证流程，再更新本手册，不通过修改数据来伪装已经支持。

| 现象 | 先检查什么 | 处理 |
| --- | --- | --- |
| `Weekly issue date must be a Monday` | `--date` 是否为北京时间周一 | 用正确刊期，不改程序放宽限制 |
| `Entry ... is outside the Beijing coverage window` | `event_time_bj`、原始时区、刊期 | 核对源时间并换算；不在本周的新事件移至正确刊期或补录 |
| `Published paper ... has invalid ... fields` | 日期和至少一位作者是否存在、已展示单位与摘要是否有必要依据、`paper_source_type` 是否有效 | 补齐必需依据；可选信息无法确认时留空并使用“不明确”或转述，不编造 |
| 本地没有数据库或条目数为 0 | 本地 `data/*.sqlite` 是否丢失、条目归档是否存在 | 恢复备份或导入经核实的归档；不要发布空刊 |
| Python 无法启动 / `reportlab` 缺失 | `ROBOTICS_NEWS_PYTHON` 路径与 Python 环境 | 指向可执行 Python，安装 `reportlab` 后在隔离输出目录重试 |
| 元数据窗口不一致 | `data/issues/YYYY-MM-DD.json` 的 `coverage_start/end` | 改成上周一/周日，不修改生成器的周界规则 |
| 站点仍显示旧刊或预告 | 新 `site/index.html` 是否已提交、Pages 工作流是否成功、缓存 | 核实提交 SHA 与部署、稍后强制刷新；避免重复制造部署 |
| PDF 链接 404 | 本期 PDF 是否提交并推送至 `diarys/`，仓库地址是否变化 | 补推 PDF；迁移仓库时设置 `ROBOTICS_NEWS_PDF_URL_BASE` |

## 8. 完成一期后向用户报告什么

简要写明：刊期与北京时间窗口、入选总数及论文数、网页与 PDF 链接、是否有补录/更正、部署是否成功、尚未核实而被暂缓的关键消息。若只完成预告或草稿，要明确写“预告/草稿”，不要声称正式周报已发布。

## 9. 可直接交给新会话的任务描述

新会话的提示词只需写**目标刊期**和**本次是否授权直接发布**；其余要求已在 `AGENTS.md` 及本手册引用的文档中。无需在提示词里重复信源、论文字段、版式或检查清单。

直接发布版：

> 请在 `RoboticsNews` 仓库按 `AGENTS.md` 及其引用文档，制作最新一期已结束统计周的周报。完成核验后，我授权你直接 commit、push 到 `main`，并确认 GitHub Pages 和 PDF 已更新；若关键内容无法核实，请暂缓该条并说明。

先审阅版：

> 请在 `RoboticsNews` 仓库按 `AGENTS.md` 及其引用文档，制作最新一期已结束统计周的周报。完成后把改动交给我审阅，暂时不要 commit 或 push。

需要指定某期时，把“最新一期已结束统计周”替换成“`YYYY-MM-DD` 周一刊期”。提示词里的“直接发布”只授权**本次**周报，不自动授权以后每周。
