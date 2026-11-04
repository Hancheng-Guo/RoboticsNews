# RoboticsNews

RoboticsNews 面向机器人学研究人员与工程师，每周汇总上一完整自然周的论文、技术和产业进展，提供网页周报与 PDF 存档。**本项目完全由 AI 实现，周报内容由 AI 生成**；阅读具体信息时请以条目附带的来源为准。

## 在线阅读

- [最新周报](https://hancheng-guo.github.io/RoboticsNews/)
- [历史 PDF](https://hancheng-guo.github.io/RoboticsNews/archive.html)

## 使用方法

直接访问网站阅读最新一期，点击“历史 PDF”查找往期文件。周报按北京时间的周一至周日统计，于下一周周一发布。

### 用 AI 更新一期周报

在本项目目录中开启新的 AI 会话，发送下面这段话即可，无需每周手动填写日期：

> 请按 `AGENTS.md` 及其引用文档，制作最新一期已结束统计周的机器人学周报。完成采集、核验、入库和网页/PDF 生成后，我授权你 commit、push 到 `main`，并检查 GitHub Pages 与 PDF 链接是否已更新。无法核实的内容请暂缓收录并说明。

如果想先检查成果，把提示词中的“我授权你 commit、push 到 `main`，并检查 GitHub Pages 与 PDF 链接是否已更新”改为“请把改动交给我审阅，暂时不要 commit 或 push”。AI 会依照 [周报维护手册](docs/WEEKLY_OPERATIONS.md)、[采编规范](docs/EDITORIAL_GUIDE.md)、[呈现规范](docs/PRESENTATION_SPEC.md) 和 [周报模板](docs/ISSUE_TEMPLATE.md) 工作。

### 手动生成

运行环境需要 Node.js 24、Python 3 和 `reportlab`。本地 SQLite 数据库不随 Git 同步；新环境须先恢复或导入目标刊期条目，不能仅凭仓库文件生成完整周报。确认目标刊期的已发布条目入库后运行：

```powershell
node scripts/db.mjs init
node scripts/db.mjs stats
node scripts/db.mjs search --date YYYY-MM-DD --status published --limit 100
$env:ROBOTICS_NEWS_PYTHON = 'C:\path\to\python.exe' # Python 已在 PATH 时可省略
node scripts/build-site.mjs --date YYYY-MM-DD
```

将 `YYYY-MM-DD` 替换为刊期所在的周一日期。构建命令会生成 `site/index.html`、`site/archive.html`、`site/current.json` 和 `diarys/YYYY-MM-DD.pdf`；提交并推送网站文件后，[GitHub Actions](.github/workflows/pages.yml)负责部署网页，不会自动采集或撰写周报。数据库命令、字段及发布检查的完整说明见[维护手册](docs/WEEKLY_OPERATIONS.md)和[数据说明](data/README.md)。
