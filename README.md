# RoboticsNews

机器人学研究进展日报的采编规则见 [EDITORIAL_GUIDE.md](EDITORIAL_GUIDE.md)。

## 数据存储与查找

条目和信源保存在 `data/robotics_news.sqlite`，使用 Node.js 24 的内置 SQLite，无需安装依赖。表结构和备份说明见 [data/README.md](data/README.md)。数据库文件不纳入 Git；脚本和字段定义纳入 Git。

```powershell
node scripts/db.mjs init
node scripts/db.mjs add path/to/entry.json
node scripts/db.mjs replace path/to/updated-entry.json
node scripts/db.mjs search --date 2026-11-01
node scripts/db.mjs search --q 触觉 --topic manipulation --status published
node scripts/db.mjs search --entity "Example Lab" --category paper --limit 20
node scripts/db.mjs get example-2026-11-01-001
node scripts/db.mjs stats
```

单条记录格式见 [data/entry.example.json](data/entry.example.json)。`add` 支持一个 JSON 对象或对象数组，重复 ID 会报错；修改已有记录时使用 `replace`，并保留原创建时间。`search` 的关键词匹配支持中英文子串；日期、类别、状态、主题、机构可以组合筛选。`sources` 列出已登记的信源；用 `add-source source.json` 添加信源，字段参见 `data/schema.sql` 的 `sources` 表。设置环境变量 `ROBOTICS_NEWS_DB` 可指定另一数据库路径。

## 生成日报网页与 PDF

将条目的 `editorial_status` 设为 `published`，并填写 `issue_date`、中英摘要和 `placement`，再运行：

```powershell
$env:ROBOTICS_NEWS_PYTHON = 'C:\path\to\python.exe' # 需安装 reportlab；若 python 已在 PATH 可省略
node scripts/build-site.mjs --date 2026-11-01
```

不传 `--date` 时，默认生成北京时间前一自然日的日报。脚本从本地 SQLite 读取当天**已发布**条目，覆盖 `docs/index.html` 与 `docs/current.json`，并在 `docs/pdf/YYYY-MM-DD.pdf` 新增当日 PDF。网页只显示本期内容；旧 PDF 按日期保留。没有已发布条目时首页显示暂无内容，不生成空 PDF。PDF 使用 Python 3 与 `reportlab`；网页生成使用 Node.js 24 的内置 SQLite。

在 GitHub 仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。提交并推送 `docs/` 后，[Pages 工作流](.github/workflows/pages.yml)会发布网站；预期项目站点地址为 `https://hancheng-guo.github.io/RoboticsNews/`，以工作流返回的实际 URL 为准。本地数据库不会上传，只有 `docs/` 内的已发布内容会公开。每天新增内容后重新生成并推送即可。
