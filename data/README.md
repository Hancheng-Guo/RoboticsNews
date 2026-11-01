# 数据目录

`robotics_news.sqlite` 是周报条目和信源目录的本地 SQLite 数据库。运行 `node scripts/db.mjs init` 创建或迁移旧表；表结构见 [schema.sql](schema.sql)。数据库文件不提交到 Git，实际运行时需单独备份 `data/robotics_news.sqlite`。停止写入后再复制数据库文件；或使用 SQLite 的备份功能制作一致性备份。

条目字段与采编要求对应 [EDITORIAL_GUIDE.md](../docs/EDITORIAL_GUIDE.md) 第 8 节。日常操作见项目 [README.md](../README.md)。
