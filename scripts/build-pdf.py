"""Render one published daily issue from the same JSON used by the website."""

import json
import sys
from html import escape
from pathlib import Path
from urllib.parse import urlparse

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, Spacer,
    HRFlowable,
)

pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
FONT = "STSong-Light"
INK = colors.HexColor("#18263A")
MUTED = colors.HexColor("#617184")
ACCENT = colors.HexColor("#196D82")

LABELS = {
    "lead": "今日重点", "research": "学术研究", "industry": "工业与应用",
    "ecosystem": "生态动态", "paper_briefs": "论文速览",
    "corrections": "补录与更正", "unassigned": "其他进展",
}
EVIDENCE = {
    "peer_reviewed": "同行评审", "preprint": "预印本",
    "official_claim": "机构宣称，未独立验证", "independent_evidence": "有独立证据",
    "corrected": "已更正", "unverified": "待核实",
}
SECTIONS = list(LABELS)


def style(name, size, leading, color=INK, font=FONT, **kwargs):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading,
                          textColor=color, spaceAfter=0, **kwargs)


ST = {
    "eyebrow": style("eyebrow", 8, 12, ACCENT, font="Helvetica-Bold"),
    "title": style("title", 22, 30),
    "subtitle": style("subtitle", 10, 15, MUTED, font="Helvetica"),
    "section": style("section", 14, 21, ACCENT),
    "headline": style("headline", 11.5, 18),
    "en_title": style("en_title", 8.5, 13, MUTED, font="Helvetica"),
    "body": style("body", 9.3, 16),
    "english": style("english", 8.3, 13, MUTED, font="Helvetica"),
    "meta": style("meta", 8, 13, MUTED),
}


def para(text, kind):
    return Paragraph(escape(str(text or "")), ST[kind])


def source_link(link):
    parsed = urlparse(link or "")
    if parsed.scheme not in ("http", "https"):
        return para("原始来源：未提供有效链接", "meta")
    safe = escape(link, quote=True)
    return Paragraph(f'<link href="{safe}" color="#196D82">原始来源：<font name="Helvetica">{escape(link)}</font></link>', ST["meta"])


def page(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#DAE3E8"))
    canvas.line(19 * mm, 17 * mm, width - 19 * mm, 17 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(19 * mm, 12 * mm, "RoboticsNews")
    canvas.setFont(FONT, 8)
    canvas.drawString(43 * mm, 12 * mm, "· 机器人学研究进展日报")
    canvas.drawRightString(width - 19 * mm, 12 * mm, str(doc.page))
    canvas.restoreState()


def build(source, target):
    issue = json.loads(Path(source).read_text(encoding="utf-8"))
    Path(target).parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(target), pagesize=A4, leftMargin=19 * mm,
                          rightMargin=19 * mm, topMargin=20 * mm, bottomMargin=23 * mm,
                          title=f"机器人学研究进展日报 {issue['date']}", author="RoboticsNews")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="issue", frames=frame, onPage=page))

    story = [para(f"DAILY BRIEF  ·  {issue['date']}", "eyebrow"), Spacer(1, 3 * mm),
             para("机器人学研究进展日报", "title"), Spacer(1, 1 * mm),
             para("Robotics Research & Industry Daily", "subtitle"), Spacer(1, 5 * mm),
             para(f"北京时间 {issue['date']} 发布  ·  {len(issue['entries'])} 条进展  ·  中英双语摘要", "meta"),
             Spacer(1, 4 * mm),
             HRFlowable(width="100%", thickness=1, color=colors.HexColor("#DAE3E8")),
             Spacer(1, 4 * mm),
             para("涵盖北京时间前一自然日公开的信息。机构单方发布的内容会明确标注。", "meta"),
             Spacer(1, 5 * mm)]

    for section in SECTIONS:
        items = [e for e in issue["entries"] if e.get("placement", "unassigned") == section]
        if not items:
            continue
        story += [para(LABELS[section], "section"), Spacer(1, 2 * mm)]
        for item in items:
            block = [para(item["title_zh"], "headline"), Spacer(1, 1 * mm),
                     para(item["title_en"], "en_title"), Spacer(1, 1 * mm),
                     para(EVIDENCE.get(item["evidence_status"], item["evidence_status"]), "meta"),
                     Spacer(1, 2 * mm), para(item["summary_zh"], "body"),
                     Spacer(1, 1 * mm), para(item["summary_en"], "english")]
            if item.get("why_it_matters_zh"):
                block += [Spacer(1, 1 * mm), para("意义：" + item["why_it_matters_zh"], "body")]
            if item.get("limitations_zh"):
                block += [Spacer(1, 1 * mm), para("局限：" + item["limitations_zh"], "body")]
            block += [Spacer(1, 2 * mm), source_link(item["primary_url"]), Spacer(1, 5 * mm)]
            story.append(KeepTogether(block))
        story.append(Spacer(1, 2 * mm))
    doc.build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-pdf.py issue.json digest.pdf")
    build(sys.argv[1], sys.argv[2])
