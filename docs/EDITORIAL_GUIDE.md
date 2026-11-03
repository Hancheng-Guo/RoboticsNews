# 机器人学研究进展周报：信源与采编规范

版本：2.3（2026-11-04）
适用对象：研究人员与工程师  
发布形态：网站或应用页面，每周一北京时间 08:00 发布一期，并存档 PDF

## 1. 定位与边界

本周报追踪全球机器人学的学术、工业和生态进展，兼顾中国来源，覆盖全领域。学术研究为主，但不预设学术、工业或地区配额；入选取决于窗口内的信息价值和证据质量。每期正文精选，另设“论文速览”。目标是 10–15 条主要内容；论文展示原文摘要及中文翻译后，阅读时间依实际篇幅而定。若合格消息不足，不为凑数降低标准。

统计窗口为**发布日前一个完整北京时间自然周（周一至周日）**，即上周一 00:00（含）至本周一 00:00（不含）。例如 2026 年 11 月 2 日周一 08:00 发布的刊期覆盖 10 月 26 日至 11 月 1 日。每周一发布一期，窗口连续且不重叠。以事件首次公开时间为准，记录原始时区并换算为北京时间；只有日期、没有可确认时刻的消息，记录时间精度为“日期”，避免伪造具体时分。论文以首次公开或正式录用公告时间为准，重大修订可作为独立进展。08:00 前尚无法核实的消息暂缓。后续核实的旧事可留在候选池，待构建器实现并验证窗口外补录规则后才纳入下一期“补录与更正”；目前不能改写事件日期来绕过窗口校验。

每条内容都必须有中文和英文概述，保留原文标题、关键术语、链接和证据状态。论文按来源记录全部作者姓名（全名或缩写均可），标出第一作者和明确指定的通讯作者；两者单位核实后简短展示，无法确认第一作者单位时标“不明确”，论文未指定通讯作者时如实标注。只有确认可转载时才展示摘要原文及忠实中文翻译；否则展示明确标记的中英转述。不要求获取论文全文，也不撰写基于全文的贡献总结。读者应能清楚区分：**研究结果、作者/企业宣称、第三方验证、真实部署、编辑判断**。网页首页显著标记“AI生成”，PDF 首页也标记生成方式。

## 2. 主题地图

每期搜索和分类使用下列主题；不因热门方向挤掉其他有价值的方向。

| 主题 | 关注点与检索词示例 |
| --- | --- |
| 机器人学习与具身智能 | robot learning、VLA、模仿学习、强化学习、世界模型、泛化、长程任务 |
| 操作与灵巧手 | manipulation、grasping、tactile、双臂、柔性物体、工具使用 |
| 移动、定位与导航 | SLAM、navigation、planning、AMR、越野、群体协同 |
| 控制与系统 | model predictive control、whole-body control、实时性、鲁棒性、安全控制 |
| 感知与传感 | 视觉、触觉、力觉、雷达、多模态、场景理解 |
| 机器人形态与硬件 | 人形、足式、无人机、水下、软体、医疗、农业机器人；执行器、减速器、电池、传感器 |
| 仿真、数据与基础设施 | sim-to-real、数据集、基准、ROS、开源模型、部署框架 |
| 人机协作与安全 | HRI、协作机器人、可解释性、故障、安全测试、事故与召回 |
| 行业应用 | 制造、物流、医疗、服务、家庭、农业、建筑、能源与特种作业 |
| 生态动态 | 标准、政策、投融资、并购、招聘、会议征稿；需说明对研究或落地的具体影响 |

维护中英文同义词、机构名和产品名词表。仅用“人形机器人”或“具身智能”搜索会漏掉大量系统、控制与硬件研究。

## 3. 信源目录：发现入口与核验终点

发现入口负责找线索；最终表述尽量落在论文、会议录用页、代码仓库、企业原始公告、客户文件、监管披露或标准正文上。论文一手链接经检索仍不可得时，可引用能够核实作者、日期与论文信息的转载页面，明确标注“转载来源；未找到论文一手链接”，只叙述该材料能够支持的事实。其他类别仍优先回到一手材料。

| 类别 | 每周持续监测的入口 | 主要用途与核验终点 |
| --- | --- | --- |
| 预印本 | [arXiv cs.RO 最近提交](https://arxiv.org/list/cs.RO/recent)、[cs.RO RSS](https://rss.arxiv.org/rss/cs.RO)、[arXiv API 文档](https://info.arxiv.org/help/api/user-manual.html)；交叉关注 cs.AI、cs.LG、cs.CV、eess.SY | 从摘要发现论文，回到原始版本页核实题名、作者、摘要、版本和发布日期；第一作者单位另按可访问的一手署名材料核实。arXiv 上线不代表同行评审。RSS 的格式与更新机制见[官方说明](https://info.arxiv.org/help/rss.html)。 |
| 会议与期刊 | [RSS 录用论文页](https://roboticsconference.org/2026/program/papers/)、[CoRL OpenReview](https://openreview.net/group?id=robot-learning.org%2FCoRL%2F2026%2FConference)、[PMLR 论文集](https://proceedings.mlr.press/)、[IEEE RAS 会议目录](https://www.ieee-ras.org/conferences-workshops/)、[IEEE RA-L](https://www.ieee-ras.org/publications/ieee-robotics-and-automation-letters/)；同时监测 ICRA、IROS、Humanoids、RoboSoft、Science Robotics、T-RO 等当年官方页面 | 核实“已录用/已发表”状态、DOI、论文版本和会议年份。每年更新会议入口，勿把投稿页面当作录用证明。 |
| 高校与实验室 | 高校新闻中心、机器人研究院、实验室研究博客与项目页；具体订阅入口见下表 | 发现尚未进入论文数据库的成果、系统演示、数据集及合作。高校稿件是相关团队的一手发布，但性能和应用结论仍须回查论文、项目页、代码与实验条件。 |
| 技术与开发者平台 | [ROS 2 官方发布页](https://github.com/ros2/ros2/releases)、[Open Robotics 新闻](https://www.openrobotics.org/blog)、[Open Robotics 社区](https://discourse.openrobotics.org/)、[Hugging Face LeRobot](https://huggingface.co/lerobot)、项目官方 GitHub/GitLab 仓库；其他平台见下表 | 跟踪软件版本、模型、数据集、权重、仿真器和硬件设计。核实发布主体、tag、发布日期、许可及文件是否实际可访问；社区发帖和用户上传不自动等同于官方发布。 |
| 行业与部署 | 企业官网新闻室、技术博客、产品文档；客户/合作方公告；[IFR 新闻稿](https://ifr.org/ifr-press-releases) | 企业消息先记录为其宣称；销量、交付、客户数量优先找客户或监管文件交叉核实。IFR 数据须记录统计年度、地区、机器人类别与指标定义。 |
| 公司披露 | [美国 SEC EDGAR](https://www.sec.gov/search-filings)、[中国巨潮资讯](https://www.cninfo.com.cn/)及相应交易所公告 | 核实上市公司财务、订单、并购和融资信息；区分意向、签约、收入确认与实际交付。非上市公司融资需找投资方或交易双方的原始声明。 |
| 政策与标准 | [中国工信部](https://www.miit.gov.cn/)、各国/地区主管部门原文、[ISO 机器人标准页](https://www.iso.org/sectors/engineering/robotics.html)、[NIST Robotics](https://www.nist.gov/robotics) | 核实原文、发布机构、生效日期、适用地区和版本；征求意见稿、草案、正式标准分别标注。 |
| 线索层 | [IEEE Spectrum 机器人栏目](https://spectrum.ieee.org/topic/robotics/)、其他专业媒体、研究机构社交账号、论文推荐站、开发者社区、展会报道 | 只作发现与追踪。媒体即使采访了研究者，也需区分其独家采访内容与转述的技术、性能事实；后者尽量回到原始材料。 |

### 3.1 高校与研究机构订阅清单

下表列的是**监测入口示例，不是学校排名或优先录用名单**。工作周内扫描有更新的入口；对低频实验室页可按周巡检。应持续扩展到其他国家、地区与团队，避免因只盯著名高校而漏掉重要成果。

| 地区 | 建议订阅的官方入口 | 重点与回查路径 |
| --- | --- | --- |
| 美国 | [MIT News 机器人主题](https://news.mit.edu/topic/robotics)、[CMU Robotics Institute](https://www.ri.cmu.edu/)、[Stanford HAI 机器人主题](https://hai.stanford.edu/topics/robotics)、[UC Berkeley BAIR Blog](https://bair.berkeley.edu/blog/) | 学校新闻与研究博客用于发现；确认作者所属团队，再找论文、项目页、视频原片及代码。BAIR 涵盖广泛 AI，按机器人相关性过滤。 |
| 欧洲 | [ETH Robotic Systems Lab](https://rsl.ethz.ch/)、[Oxford Robotics Institute](https://ori.ox.ac.uk/)、[EPFL Robotics Center](https://www.epfl.ch/research/domains/robotics/) | 关注足式、移动、系统、无人机等进展；研究院首页混有活动和招聘，只收录符合第 4 节的新进展。 |
| 中国 | [清华大学具身智能与机器人研究院](https://eir.tsinghua.edu.cn/)、[清华大学智能产业研究院 AIR](https://air.tsinghua.edu.cn/)、[浙江大学机器人研究院](https://rob.zju.edu.cn/)、[中国科大科研进展](https://news.ustc.edu.cn/kyjz/64.htm) | 同时检查中文原稿、论文和实验室项目页；区分原创研究、媒体转载、成果转化、活动与招聘。其他高校按主题逐步纳入。 |

### 3.2 技术平台订阅清单

| 平台 | 监测内容 | 核验注意点 |
| --- | --- | --- |
| [GitHub 项目 Releases](https://github.com/huggingface/lerobot/releases)及项目文档 | 正式版本、变更日志、许可证、可运行代码 | 优先订阅具体项目或组织，避免把任意新仓库、star 数或提交频率当作技术突破。 |
| [Hugging Face LeRobot](https://huggingface.co/lerobot)、[Hugging Face Blog](https://huggingface.co/blog) | 机器人模型、数据集、权重、技术文章 | 区分平台官方、机构账号与社区投稿；检查模型卡、数据卡、文件、许可和评测协议。 |
| [Open Robotics 新闻](https://www.openrobotics.org/blog)、[Open Robotics Discourse](https://discourse.openrobotics.org/) | ROS、Gazebo、Open-RMF 等生态发布与社区公告 | 官方公告可作版本线索；社区讨论先回查维护者、发行说明和项目文档。 |
| [NVIDIA Robotics 技术博客](https://developer.nvidia.com/blog/category/robotics/)、[NVIDIA Isaac 开发平台](https://developer.nvidia.com/isaac) | 仿真、机器人学习、ROS 加速与工具发布 | 记录硬件依赖和测试环境，区分技术教程、正式发布与性能宣传。 |
| [Google DeepMind 研究与博客](https://deepmind.google/research/) | 机器人模型、技术报告、开放能力与实验结果 | 企业研究团队的一手材料；回查论文、模型卡、开放范围和独立复现情况。 |

高校网站、项目页、论文库、技术博客常会在不同日期报道同一成果。按**首次公开、正式录用、开源发布、独立验证**等不同事件类型去重；没有新增实质信息时，不因平台再次发稿而重复入选。

以上是**入口目录，不是封闭白名单**。按机构、会议和产品建立可维护订阅表，字段至少包括：名称、URL、地区、语言、主题、更新频率、访问方式、维护人、最后检查日期。新信源先确认主体真实性、历史准确性和是否存在明显利益关系；失效链接及时替换。自动获取遵守各站使用条款、robots 规则、API 额度和内容许可；保存元数据及链接，避免未经许可镜像论文、图片或文章全文。

## 4. 入选规则与排序

候选消息先过四道门：①属于机器人学或直接影响机器人研发/部署；②有明确的新事件或新证据；③时间窗口可确认；④有可追溯的来源链接。论文优先一手来源；经检索仍找不到一手链接时允许有明确标记的转载来源。任一不满足则暂缓或淘汰。

对合格候选按下表逐项评估，每项 0–2 分；分数辅助排序，不替代编辑判断。

| 维度 | 0 分 | 1 分 | 2 分 |
| --- | --- | --- | --- |
| 新增量 | 旧闻重述 | 已知路线的增量 | 新方法、新结果或关键里程碑 |
| 技术/应用影响 | 影响不明 | 特定任务有价值 | 可影响多个方向或真实部署 |
| 证据强度 | 只有口号/视频 | 原文有方法或数据 | 可检查实验、代码、第三方或部署证据 |
| 读者可用性 | 难以复用 | 有明确技术启示 | 可复现、可采购/部署或可用于决策 |

优先呈现高分且主题多样的内容。学术内容可超过工业内容，但“论文速览”不应挤占所有正文空间。重大但只有企业单方证据的消息可在所属栏目加重点标记，**必须醒目标注“机构宣称，未独立验证”**，标题不得把宣称改写为已证实事实。投融资、政策、标准、招聘、会议征稿都可常规收录，但要说明具体影响；普通招聘、无技术细节的融资、例行会议通知可放短讯或不收。

以下情况原则上排除：纯营销视频、缺少新信息的产品复述、只换标题的多家转载、无来源的“全球第一”、机器人关联牵强的泛 AI 新闻、无法确认的传闻、论文仅凭摘要就推断性能或落地。不同媒体报道同一事件合并为一条，保留最早原始材料及必要的独立来源。

## 5. 分类型核验清单

### 5.1 论文与研究成果

1. 核对题名、**可确认的公开日期**、至少一位作者及其可见署名顺序；作者姓名按来源原样记录，全名和缩写均可，不能从缩写自行补全。`paper_authors` 首项须与 `first_author_name` 一致。日期优先取论文或出版页面；若缺失，继续查会议、机构、作者或其他可追溯来源，并把日期依据链接存入 `supporting_urls`。日期仍无法确认则**不收录**；完全找不到作者也**不收录**。仅转载可得时不要推断版本、DOI 或同行评审状态。
2. **第一作者单位逐篇查证。** arXiv 摘要页常不列单位；对可访问的预印本，先看同一版本 HTML 全文和 PDF 首页，核对第一作者的上标、脚注及其对应单位，再查论文项目页或出版方作者页。HTML 解析可能合并署名与单位，遇到歧义须回看 PDF 版面。核实后按署名顺序每项写“单位名，国家或地区”，省略详细地址；将直接证明作者与单位对应关系的链接存入 `first_author_affiliation_source_url`。若已尝试的材料均无法访问或仍无法确认，记录原因，`first_author_affiliations` 留空，网页和 PDF 显示“不明确”；不猜测单位，也不因此排除论文。
3. **优先展示论文原文摘要与中文翻译。** arXiv 的[投稿协议](https://info.arxiv.org/help/policies/submission_agreement.html#metadata-license)明确把投稿摘要列为元数据，并对元数据适用 CC0；即使论文全文采用 arXiv 非独占许可，也可从该论文的 arXiv 摘要页逐字记录摘要。将摘要页作为 `abstract_source_url`，核对所用版本，填写 `abstract_original`、`abstract_language`、忠实的 `abstract_zh_translation` 和出处说明。PDF/HTML 中的摘要可能与摘要页不同，不能未经核对就替换。论文全文及图片仍按该版本的论文许可处理；arXiv 的[许可说明](https://info.arxiv.org/help/license/index.html)区分元数据与全文。其他平台的摘要按其明确的许可或授权判断；确实无法确认原文转载依据时才使用有来源依据的中英转述，页面标记“论文内容转述”。
4. 优先寻找论文版本页、出版页、预印本或会议官方链接；检索后仍找不到时，`primary_url` 可填有明确论文身份、作者和日期依据的转载页面，并设 `paper_source_type: reprint`。网页和 PDF 须标“转载来源；未找到论文一手链接”。转载报道不能独自证明正式录用、同行评审或性能数字；不确定时用 `unverified`、`not_applicable` 等准确状态，不用搜索结果页充当来源。
5. 核对单位和摘要时应尝试可公开访问的论文 HTML/PDF；不要求访问受限全文，也不写“基于全文”的贡献总结。正文仅使用实际可访问材料支持的事实；未说明的实验规模、基线、性能和落地情况不推断。跨论文数字若数据集或测试协议不同，不直接比较。
6. 核实代码、模型权重、数据、评测脚本是否已可访问及其许可；“附有 GitHub 链接”不等于“可复现”。查询旧版本、会议版与期刊版避免重复报道；对 DOI 检查出版方更正/撤稿记录，必要时参考 [Crossmark](https://www.crossref.org/services/crossmark/)。
7. 高校新闻稿或实验室博客中出现“突破”“首次”等措辞时，追到可访问的论文或其他证据；若只有新闻稿，标注为机构宣称，不能据此认定已同行评审。

#### 摘要原文与中文翻译的转载判定

**先找可用依据，再决定是否转述。** 对同一论文可能存在 arXiv、OpenReview、会议论文集、出版方和作者项目页多个版本，逐一记录摘要文本来自哪个版本、该版本的许可或平台元数据规则。不能因为某个平台的全文许可受限，就否定另一平台已明确开放的摘要。优先使用能够公开展示原文并允许发布中文翻译的版本；改用另一版本时须重新核对摘要措辞，不能混合不同版本。

| 来源 | 摘要原文与翻译的判定 | 依据 |
| --- | --- | --- |
| arXiv 摘要页 | 投稿摘要属于 CC0 元数据，优先从摘要页逐字记录并翻译；全文的 CC 或 arXiv 非独占许可另行判断。 | [arXiv 投稿协议：元数据含摘要](https://info.arxiv.org/help/policies/submission_agreement.html#metadata-license) |
| OpenReview 公开论文页 | 其条款把论文摘要列为元数据，元数据适用 CC0；只用公开可读的该论文摘要。论文正文和评审意见不是同一许可规则。 | [OpenReview Terms：Metadata 与 Metadata Dedication](https://openreview.net/legal/terms) |
| PMLR 论文集 | 出版协议为论文授予 CC BY 4.0；可转载摘要及翻译，保留作者、论文集原始引用、PMLR 论文链接、许可链接，并说明翻译。 | [PMLR Publication Agreement](https://proceedings.mlr.press/pmlr-license-agreement.html) |
| ACL Anthology | 2016 年及之后的 ACL 材料按 CC BY 4.0；可转载并翻译，按许可署名。早期材料和第三方材料须核对相应条款。 | [ACL Anthology copyright FAQ](https://aclanthology.org/faq/copyright/) |
| bioRxiv / medRxiv | 作者可选择不同许可，包括限制性许可或无进一步复用；查**该篇、该版本**页面摘要下方或版权信息。CC0、CC BY 等满足条件的版本可用，不能按平台统一推定。 | [bioRxiv About](https://www.biorxiv.org/about-biorxiv)、[medRxiv FAQ](https://www.medrxiv.org/about/FAQ) |
| IEEE Xplore、ACM Digital Library、Springer Nature、Elsevier 等出版页 | 以**该篇文章**的开放许可、版权和复用说明为准；CC BY 论文可按许可使用。仅能免费阅读或整个平台推行开放获取，不自动证明这篇摘要可原文转载并公开翻译。IEEE 非开放授权文章的第三方复用通常需要许可。 | [IEEE Author Center](https://journals.ieeeauthorcenter.ieee.org/choose-a-publishing-agreement/avoid-infringement-upon-ieee-copyright/)、[ACM Open](https://libraries.acm.org/subscriptions-access/acmopen)、[Springer Nature](https://support.springernature.com/en/support/solutions/articles/6000214239-use-of-an-open-access-article)、[Elsevier](https://www.elsevier.com/about/policies-and-standards/copyright/permissions) |
| 其他机构库、作者项目页、转载站 | 查该页面或所链原始版本的明确许可/授权；作者放出 PDF、媒体转贴摘要、搜索引擎显示摘要，都不足以单独证明第三方可原文转载。 | 原始页面的许可或权利人授权 |

采用 [CC 许可](https://creativecommons.org/chooser/)时逐项核对：CC0 可用；CC BY 需署名、原链接和许可链接，翻译须注明；CC BY-SA 的译文还要遵守相同方式共享条件；带 NC 的许可须确认本项目的具体用途符合非商业条件；带 ND 的许可通常不允许公开发布翻译。对带 ND 或许可不清的版本，先寻找同一论文在 arXiv/OpenReview 等可用的摘要元数据或其他开放版本；仍没有依据时使用独立撰写的中英转述。不要把“平台可阅读”“论文开放获取”或“摘要出现在搜索结果”当作通用转载授权。`abstract_credit` 记录作者、版本、来源、所据许可及译者；`abstract_source_url` 指向真正复制摘要的页面，必要时在 `supporting_urls` 记录许可说明。

### 5.2 企业产品、演示与部署

1. 查原始发布主体、发布时间、产品型号、技术细节和可验证的规格。
2. 标注阶段：概念/视频演示、实验室测试、客户试点、付费部署、批量交付、规模运营。阶段不明则写“未披露”。
3. 对性能数字记录测试任务、环境、样本量、时间、对照基线、失败率、安全条件；剪辑视频不能证明连续成功率。
4. 对订单、收入、销量、产能、融资及客户名单，寻找合同公告、客户确认、财报或监管披露。无法交叉核实时保留“据公司称”。
5. 检查是否属于旧型号重发、已公开成果再包装，是否存在明显选择性展示。

### 5.3 政策、标准、市场与事件

1. 以主管机构/标准组织原文为准，核对文件编号、版本、适用范围、发布时间与生效时间。
2. 市场数据注明统计主体、年份、地区、机器人定义、出货/安装/在役等口径；不可把预测写成实际值。
3. 安全事故、召回、诉讼等可能损害主体声誉的消息，至少核对官方记录和一项独立材料；未核实前不下因果结论。

## 6. 证据状态与措辞

| 标签 | 使用条件 | 推荐写法 |
| --- | --- | --- |
| `peer_reviewed` 同行评审 | 会议/期刊官方录用或发表可核实 | “发表于/被录用至……” |
| `preprint` 预印本 | 只有 arXiv 等预印本 | “作者在预印本中报告……” |
| `official_claim` 官方宣称 | 企业/机构原始发布，但缺少独立验证 | “据 X 披露……；尚无独立验证。” |
| `independent_evidence` 独立证据 | 有独立测试、客户或监管材料支持对应事实 | “根据 X 的测试/公告……”并写清边界 |
| `unverified` 待核实 | 关键事实缺少可追溯材料或来源冲突 | 保持候选或暂缓，核实前不作为已证实进展发布；当前无公开“待核实”栏目 |
| `corrected` 更正 | 原始材料或本刊已修正 | 显示更正内容、时间与旧版本链接 |

“世界首个”“首次”“最强”等绝对化说法必须有清楚比较范围和可检查依据；否则只可作为带归属的原话，并解释证据不足。AI生成摘要只作草稿，所有数字、专有名词、时间和结论须人工回查原文。

## 7. 每周一发布的工作流程（北京时间）

1. **周一至周日：持续收集与初筛。** 以首次公开时间落在该自然周的材料为主；记录原始时间和抓取时间。及时去重，核对论文日期与作者，再尽量核实单位和摘要许可，勿把核验全部留到周一凌晨。
2. **周日：整理候选。** 按 DOI、arXiv ID、规范化 URL、产品/事件实体归并；同一论文的预印本、项目页和媒体稿组成一个事件。暂不把尚未结束的周日称为完整窗口。
3. **周一 00:00–06:30：核验与编辑。** 补入周日余下时段的信息，对拟入选条目执行第 5 节清单。选择约 10–15 条主要内容，按重要性排序，兼顾主题广度。核对论文日期、作者、来源性质、单位核验状态，以及原文与转述的区分。
4. **周一 06:30–07:40：生成网页和 PDF。** 仅使用已核实且已批准发布的条目。论文必填字段缺失时停止生成；检查两种格式中的内容、链接和“AI生成”标识。
5. **周一 07:40–08:00：发布前检查。** 核对日期窗口、所有链接、数字单位、出处、重复条目、证据标签和标题措辞；08:00 发布并记录版本。
6. **发布后：纠错与追踪。** 维护更正日志；重要事件出现论文、代码、客户验证或监管进展时，在后续刊期链接回原条目。

若部分信源延迟更新，不推断其“窗口内没有进展”。若 08:00 前核验无法完成，按时发布较少的合格条目；未核实消息留在候选池。当前构建器不能把统计窗口外旧事件直接放进下一周报，须先按[维护手册](WEEKLY_OPERATIONS.md#时间去重和补录)处理。

## 8. 网站条目与机器可读字段

每条条目至少保存以下字段，供搜索、去重、回溯、页面筛选和更正使用：

```yaml
id: "稳定的内部事件 ID"
issue_date: "YYYY-MM-DD（北京时间刊期日期）"
event_time_original: "原始发布时间及原始时区"
event_time_bj: "ISO 8601，北京时间"
first_seen_at: "首次发现时间"
last_verified_at: "最后核验时间"
category: "paper | industry | open_source | policy | standard | market | funding | event | other"
topics: ["主题标签"]
geography: ["涉及国家/地区；不据作者国籍猜测"]
entities: ["机构、产品、研究团队"]
title_original: "原文标题"
title_zh: "中文标题"
title_en: "英文标题"
summary_zh: "中文摘要"
summary_en: "English summary"
why_it_matters_zh: "对研究或工程的意义"
limitations_zh: "已知局限和未披露的信息"
evidence_status: "peer_reviewed | preprint | official_claim | independent_evidence | unverified | corrected"
deployment_stage: "not_applicable | concept | demo | lab | pilot | paid | scaled | undisclosed"
primary_url: "优先论文一手链接；确实找不到时可用标记为转载的来源 URL"
supporting_urls: ["独立材料、日期依据或附件 URL"]
paper_id: "DOI / arXiv ID；不适用则留空"
paper_source_type: "primary | reprint；仅论文适用，转载时必须标注"
first_author_name: "论文第一作者按来源所示的姓名，全名或缩写；非论文留空"
paper_authors: ["按来源署名顺序列出的作者姓名，全名或缩写；至少一人，首项为第一作者"]
first_author_affiliations: ["已核实的第一作者单位名，国家或地区；无法确认时为空数组"]
first_author_affiliation_source_url: "单位已核实时，确实列出第一作者单位的依据 URL"
corresponding_authors: [{name: "论文明确标记的通讯作者姓名", affiliations: ["单位名，国家或地区"], source_url: "能证明通讯标记及署名单位对应关系的 URL"}]
abstract_original: "确认可转载时填写所引版本的摘要原文；否则留空并使用中英转述"
abstract_language: "摘要原文语言，例如 en 或 zh"
abstract_source_url: "展示摘要原文时填写其来源 URL"
abstract_zh_translation: "展示非中文摘要原文时填写忠实中文翻译；转述时留空"
abstract_credit: "摘要作者、出处、许可和翻译/排版说明；需公开展示时填写"
publication_status: "preprint | under_review | accepted | published | not_applicable"
code_url: "代码地址；未开放则留空"
data_url: "数据地址；未开放则留空"
claim_evidence_notes: "关键数字、条件、出处及未验证之处"
score: {novelty: 0, impact: 0, evidence: 0, utility: 0}
featured: false # 重点条目在所属栏目显示橙色角标，不单列栏目
importance_rank: 100 # 同栏目同分时的编辑排序；数字越小越靠前
editorial_status: "candidate | verifying | approved | held | rejected | published | corrected"
placement: "unassigned | research | industry | ecosystem | paper_briefs | corrections；旧数据库的 lead 仅为兼容，不能新用"
correction_of: "所更正条目 ID；无则留空"
```

页面应展示来源、证据标签、发布时间、主题、研究/部署阶段与更正记录；所有论文卡片（包括论文速览）均列出按来源所示的作者姓名并标出第一作者及有证据的通讯作者。第一作者与通讯作者单位核实后显示“单位名，国家或地区”；通讯作者未由论文或项目方明确标记时写“论文未注明通讯作者”，不能按末位作者或邮箱猜测。每位通讯作者的单位须按作者上标、脚注或项目页逐一对应；多个通讯作者分别记录，不能合并误配。可转载摘要时展示原文及中文翻译，否则展示有明确标签的中英转述。仅有转载时须标注。非论文条目展示中英摘要。重点条目保留在所属栏目并显示橙色角标；仅有官方宣称的消息，证据标签必须在标题附近可见。“AI生成”标识应在页面顶部、标题之前可见。

**公开链接规则：**网页和 PDF 每个条目只展示一条 `primary_url` 来源链接。一手来源优先；确实找不到时可用明确标记的转载来源。摘要、第一作者/通讯作者单位、许可、代码、数据及其他辅助依据 URL 仍须记录在条目数据中供核验，不在条目中分别列为链接。刊期 PDF 和历史版本 PDF 属于页面导航。涉及额外公开署名或许可链接义务时，先确保使用方式仍满足许可；若单来源链接版式无法合规，改用允许的版本或转述。

## 9. 周报页面结构

1. 页面顶部的“AI生成”标识、刊期日期、上周一至周日的统计窗口与收录数量。编辑说明和内部核查记录仅留在采编数据中，不进入公开网页或 PDF。
2. 学术研究：本周精选、方法或证据较强且对研究人员/工程师有较大价值的论文与研究成果；论文列出来源可见的作者、第一作者与有证据的通讯作者及其单位，依许可展示摘要原文及翻译或明确的转述。
3. 工业与应用：产品、部署、开源发布，清楚标注阶段和宣称状态。
4. 生态动态：政策、标准、市场、投融资、招聘与会议信息中的有效变化。
5. 论文速览：达到入选门槛、值得跟踪但未进入精选栏的论文，例如贡献较窄或证据仍处较早阶段的研究；字段、核验门槛及现有卡片篇幅与学术研究中的论文一致。两栏没有机械分数线，不能用速览规避核验。
6. 补录与更正：原事件日期、本期处理日期及变更说明；当前只能处理符合统计窗口校验的条目，窗口外补录待实现。

各栏目内先显示重点角标条目，再按四项评分总和及 `importance_rank` 排序；同一等级的编辑排序必须依据实际重要性，不能用文件名或发布日期代替判断。

## 10. 维护与复盘

每周检查漏报、重复、失效来源和过度集中于某一机构/方向的情况；每月复核信源目录、关键词、评分分布和更正记录。对高频营销但低证据的来源降低抓取优先级，不将其整体封禁。重大会议期间可增加“会议专题”，但继续标明录用、发表和演示之间的差异。

本规范的信源链接与站点接入方式应定期复查；具体站点年份、API 限额、使用条款和页面路径可能变化。编辑规则变更时更新版本号，并在文档中说明变化原因。

2.3 版明确了学术研究与论文速览的编辑区别，并把暂缓、补录和重点标记的措辞与当前构建器能力对齐。网页和 PDF 条目仍只展示一条来源链接，辅助依据 URL 保留在结构化字段中；提交到公开仓库的条目文件和 `site/current.json` 可被公众读取。

