"""Render one weekly issue from the same JSON used by the website."""

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
    BaseDocTemplate, CondPageBreak, Frame, KeepTogether, PageTemplate, Paragraph, Spacer,
    HRFlowable, Table, TableStyle, Flowable,
)

pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
FONT = "STSong-Light"
INK = colors.HexColor("#18263A")
MUTED = colors.HexColor("#617184")
ACCENT = colors.HexColor("#196D82")
PALE = colors.HexColor("#F7FAFB")
LINE = colors.HexColor("#DAE3E8")
ORANGE = colors.HexColor("#E88926")

LABELS = {
    "research": "学术研究", "industry": "工业与应用",
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
                          textColor=color, **{"spaceAfter": 0, **kwargs})


ST = {
    "eyebrow": style("eyebrow", 8, 12, ACCENT, font="Helvetica-Bold"),
    "title": style("title", 22, 30),
    "subtitle": style("subtitle", 10, 15, MUTED, font="Helvetica"),
    "section": style("section", 14, 21, ACCENT, keepWithNext=True, spaceAfter=2 * mm),
    "headline": style("headline", 11.5, 18),
    "en_title": style("en_title", 8.5, 13, MUTED, font="Helvetica"),
    "body": style("body", 9.3, 16),
    "english": style("english", 8.3, 13, MUTED, font="Helvetica"),
    "meta": style("meta", 8, 13, MUTED),
    "ai_notice": style("ai_notice", 10, 17, INK,
                       backColor=colors.HexColor("#FFF2C9"),
                       borderColor=colors.HexColor("#D6A644"),
                       borderWidth=0.7, borderPadding=7),
    "subheading": style("subheading", 9, 15, ACCENT, spaceBefore=2 * mm),
    "tag": style("tag", 7.5, 12, ACCENT),
}


class FeaturedCorner(Flowable):
    """Small top-right marker shared with the website's featured cards."""
    def __init__(self):
        super().__init__()
        self.width = 12 * mm
        self.height = 12 * mm

    def draw(self):
        path = self.canv.beginPath()
        path.moveTo(0, self.height)
        path.lineTo(self.width, self.height)
        path.lineTo(self.width, 0)
        path.close()
        self.canv.setFillColor(ORANGE)
        self.canv.drawPath(path, fill=1, stroke=0)


def card_header(item, width):
    heading = [para(item["title_zh"], "headline"), para(item["title_en"], "en_title")]
    right = FeaturedCorner() if item.get("featured") else ""
    table = Table([[heading, right]], colWidths=[width - 16 * mm, 16 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("LINEABOVE", (0, 0), (-1, 0), 0.8, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 0.8, LINE),
        ("LINEAFTER", (-1, 0), (-1, -1), 0.8, LINE),
        ("TOPPADDING", (0, 0), (0, 0), 7 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ("LEFTPADDING", (0, 0), (0, 0), 5 * mm),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 0),
        ("TOPPADDING", (1, 0), (1, 0), 0),
    ]))
    return table


def section_heading(label, count, width):
    table = Table([["", para(label, "section"), para(str(count), "meta")]],
                  colWidths=[3 * mm, width - 15 * mm, 12 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), ACCENT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1 * mm),
    ]))
    return table


def para(text, kind):
    return Paragraph(escape(str(text or "")), ST[kind])


def source_link(link, label="原始来源"):
    parsed = urlparse(link or "")
    if parsed.scheme not in ("http", "https"):
        return para("原始来源：未提供有效链接", "meta")
    safe = escape(link, quote=True)
    return Paragraph(f'<link href="{safe}" color="#196D82">{escape(label)}：<font name="Helvetica">{escape(link)}</font></link>', ST["meta"])


def page(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(PALE)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(19 * mm, 17 * mm, width - 19 * mm, 17 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(19 * mm, 12 * mm, "RoboticsNews")
    canvas.setFont(FONT, 8)
    canvas.drawString(43 * mm, 12 * mm, "· 机器人学研究进展周报")
    canvas.drawRightString(width - 19 * mm, 12 * mm, str(doc.page))
    canvas.restoreState()


def build(source, target):
    issue = json.loads(Path(source).read_text(encoding="utf-8"))
    Path(target).parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(target), pagesize=A4, leftMargin=19 * mm,
                          rightMargin=19 * mm, topMargin=20 * mm, bottomMargin=23 * mm,
                          title=f"机器人学研究进展周报 {issue['date']}", author="RoboticsNews")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="issue", frames=frame, onPage=page))

    story = [para(f"WEEKLY BRIEF  ·  {issue['date']}", "eyebrow"), Spacer(1, 3 * mm),
             para("机器人学研究进展周报", "title"), Spacer(1, 1 * mm),
             para("Robotics Research & Industry · Weekly Brief", "subtitle"), Spacer(1, 5 * mm),
             para(f"北京时间 {issue['date']} 发布  ·  {len(issue['entries'])} 条进展", "meta"),
             Spacer(1, 2 * mm),
             para("AI生成：内容由 AI 辅助整理与总结，请以所列来源为准。", "ai_notice"),
             Spacer(1, 4 * mm),
             HRFlowable(width="100%", thickness=1, color=LINE),
             Spacer(1, 4 * mm),
             para(f"覆盖北京时间 {issue.get('coverage_start', '')} 00:00 至 {issue.get('coverage_end', '')} 24:00 首次公开的信息。", "meta"),
             Spacer(1, 5 * mm)]

    if issue.get("revision_note"):
        story += [para(issue["revision_note"], "meta")]
        if issue.get("previous_pdf_url"):
            story += [source_link(issue["previous_pdf_url"], "上一版 PDF")]
        story += [Spacer(1, 5 * mm)]

    for section in SECTIONS:
        items = [e for e in issue["entries"] if e.get("placement", "unassigned") == section]
        if not items:
            continue
        story += [CondPageBreak(60 * mm), section_heading(LABELS[section], len(items), doc.width), Spacer(1, 3 * mm)]
        for item in items:
            topics = " · ".join((item.get("topics") or [])[:3])
            block = [CondPageBreak(55 * mm),
                     para(f"{EVIDENCE.get(item['evidence_status'], item['evidence_status'])} · {topics} · {'北京时间' if item.get('event_time_bj') else '原文日期'} {(item.get('event_time_bj') or item.get('event_time_original') or '')[:10]}", "tag"),
                     Spacer(1, 1 * mm), card_header(item, doc.width), Spacer(1, 2 * mm)]
            if item.get("category") == "paper":
                corresponding = item.get("corresponding_authors") or []
                authors = [name + ("（第一作者）" if index == 0 else "") +
                           ("（通讯作者）" if any(author["name"] == name for author in corresponding) else "")
                           for index, name in enumerate(item["paper_authors"])]
                block += [para("作者：" + "、".join(authors), "meta"),
                          para("第一作者单位：" + ("；".join(item["first_author_affiliations"]) or "不明确"), "meta"),
                          para("通讯作者单位：" + ("；".join(author["name"] + "：" + "；".join(author["affiliations"]) for author in corresponding) if corresponding else "论文未注明通讯作者"), "meta")]
                if item.get("abstract_original"):
                    block += [para("论文摘要原文 / Original abstract", "subheading"),
                              para(item["abstract_original"], "body" if (item.get("abstract_language") or "").lower().startswith("zh") else "english")]
                    if item.get("abstract_zh_translation"):
                        block += [para("摘要中文翻译", "subheading"),
                                  para(item["abstract_zh_translation"], "body")]
                    if item.get("abstract_credit"):
                        block += [para(item["abstract_credit"], "meta")]
                else:
                    block += [para("论文内容转述 / Paraphrase", "subheading"),
                              para(item["summary_zh"], "body"),
                              para(item["summary_en"], "english")]
            else:
                block += [para(item["summary_zh"], "body"),
                          Spacer(1, 1 * mm), para(item["summary_en"], "english")]
            if item.get("why_it_matters_zh"):
                block += [Spacer(1, 1 * mm), para("意义：" + item["why_it_matters_zh"], "body")]
            if item.get("limitations_zh"):
                block += [Spacer(1, 1 * mm), para("局限：" + item["limitations_zh"], "body")]
            source_label = "转载来源" if item.get("category") == "paper" and item.get("paper_source_type") == "reprint" else "原始来源"
            block += [Spacer(1, 2 * mm), source_link(item["primary_url"], source_label)]
            if item.get("category") == "paper":
                if item.get("paper_source_type") == "reprint":
                    block += [para("未找到论文一手链接；以上内容来自转载。", "meta")]
            block += [Spacer(1, 2 * mm), HRFlowable(width="100%", thickness=0.7, color=LINE), Spacer(1, 4 * mm)]
            if item.get("category") == "paper":
                story.extend(block)
            else:
                story.append(KeepTogether(block))
        story.append(Spacer(1, 2 * mm))
    doc.build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-pdf.py issue.json digest.pdf")
    build(sys.argv[1], sys.argv[2])
