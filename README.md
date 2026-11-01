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
