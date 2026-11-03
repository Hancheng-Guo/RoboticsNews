# 数据目录

`robotics_news.sqlite` 是周报条目和信源目录的本地 SQLite 数据库。运行 `node scripts/db.mjs init` 创建或迁移旧表；表结构见 [schema.sql](schema.sql)。数据库文件不提交到 Git，实际运行时需单独备份。优先使用 SQLite 的一致性备份功能；手工复制前须关闭写入连接并确认 WAL 已检查点化，不能只复制仍在写入的 `.sqlite` 文件。

每期先维护 `issues/YYYY-MM-DD.entries.json`，再用 `node scripts/db.mjs add` 或 `replace` 导入。`replace` 需要完整条目，不能只提供要修改的字段；一个文件中有新旧 ID 时应拆开操作。用 `get <id>` 核对完整记录；`search` 只显示部分字段。数据库丢失时，先从一致性备份恢复，或从已核验的逐期 JSON 文件重建；未归档的候选与本地信源订阅无法从网页自动恢复。提交 JSON 前检查内部核查记录、私人信息和摘要许可，因为公开仓库中的 `issues/` 文件可被直接访问。

条目字段与采编要求对应 [EDITORIAL_GUIDE.md](../docs/EDITORIAL_GUIDE.md) 第 8 节。日常操作见项目 [README.md](../README.md)。

旧版数据库可能仍含 `full_text_*` 等遗留列；新版录入与公开生成器不使用这些列。不要把遗留字段重新加入周报模板。
