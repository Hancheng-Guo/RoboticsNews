"""Render the weekly issue as a paged counterpart of the website cards."""

import json
import os
import sys
from html import escape
from pathlib import Path
from urllib.parse import urlparse

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Flowable, Frame, HRFlowable, LongTable,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)


def register_fonts():
    """Embed a real sans-serif Chinese font; fail instead of silently substituting."""
    specified = (os.environ.get("ROBOTICS_NEWS_PDF_FONT_REGULAR"),
                 os.environ.get("ROBOTICS_NEWS_PDF_FONT_BOLD"))
    if any(specified):
        if not all(specified):
            raise RuntimeError("Set both ROBOTICS_NEWS_PDF_FONT_REGULAR and ROBOTICS_NEWS_PDF_FONT_BOLD")
        candidates = [specified]
    else:
        candidates = [
            ("C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/msyhbd.ttc"),
            ("C:/Windows/Fonts/Deng.ttf", "C:/Windows/Fonts/Dengb.ttf"),
            ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
             "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"),
            ("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
             "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc"),
        ]
    for regular, bold in candidates:
        if not (Path(regular).is_file() and Path(bold).is_file()):
            continue
        pdfmetrics.registerFont(TTFont("BriefSans", regular, subfontIndex=0))
        pdfmetrics.registerFont(TTFont("BriefSansBold", bold, subfontIndex=0))
        pdfmetrics.registerFontFamily("BriefSans", normal="BriefSans", bold="BriefSansBold")
        return
    raise RuntimeError("No embeddable Chinese sans-serif font found; set the two ROBOTICS_NEWS_PDF_FONT_* paths")


register_fonts()
FONT = "BriefSans"
BOLD = "BriefSansBold"
INK = colors.HexColor("#18263A")
MUTED = colors.HexColor("#526579")
ACCENT = colors.HexColor("#16738A")
PALE = colors.HexColor("#F7FAFB")
LINE = colors.HexColor("#DCE5EA")
ORANGE = colors.HexColor("#E88926")
PANEL = colors.HexColor("#F7FBFC")
PILL = colors.HexColor("#E8F4F5")

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


def style(name, size, leading, color=INK, font=FONT, **kwargs):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading,
                          textColor=color, allowWidows=0, allowOrphans=0,
                          **{"spaceAfter": 0, **kwargs})


ST = {
    "brand": style("brand", 9, 14, INK, BOLD),
    "eyebrow": style("eyebrow", 8.5, 13, ACCENT, BOLD),
    "title": style("title", 26, 35, INK, BOLD),
    "subtitle": style("subtitle", 10.5, 17, MUTED),
    "section": style("section", 15, 24, INK, BOLD),
    "headline": style("headline", 13, 21, INK, BOLD),
    "en_title": style("en_title", 9, 14, MUTED),
    "body": style("body", 9.2, 15.5),
    "english": style("english", 9.2, 15.5),
    "meta": style("meta", 8.7, 14, colors.HexColor("#354B60")),
    "credit": style("credit", 8, 12.5, MUTED),
    "subheading": style("subheading", 9.1, 15, ACCENT, BOLD),
    "pill": style("pill", 7.7, 12, colors.HexColor("#246B7B")),
    "note": style("note", 8.7, 14, MUTED),
    "source": style("source", 8.8, 15, ACCENT, BOLD),
    "notice": style("notice", 9, 15, colors.HexColor("#47370C")),
    "notice_badge": style("notice_badge", 9, 15, colors.white, BOLD),
}


def para(text, kind):
    return Paragraph(escape(str(text or "")), ST[kind])


def labeled(label, value, kind="meta"):
    return Paragraph(f"<b>{escape(label)}</b>{escape(str(value or ''))}", ST[kind])


def source_link(link, label="来源"):
    if urlparse(link or "").scheme not in ("http", "https"):
        raise ValueError(f"Invalid source link: {link}")
    return Paragraph(f'<link href="{escape(link, quote=True)}" color="#16738A">{escape(label)} ↗</link>',
                     ST["source"])


class FeaturedCorner(Flowable):
    def __init__(self):
        super().__init__()
        self.width = self.height = 11 * mm

    def draw(self):
        path = self.canv.beginPath()
        path.moveTo(0, self.height)
        path.lineTo(self.width, self.height)
        path.lineTo(self.width, 0)
        path.close()
        self.canv.setFillColor(ORANGE)
        self.canv.drawPath(path, fill=1, stroke=0)


def pill_rows(labels, width):
    lines, current, used = [], [], 0
    for label in labels:
        cell_width = pdfmetrics.stringWidth(label, FONT, 7.7) + 14
        if current and used + cell_width + 5 > width:
            lines.append(current)
            current, used = [], 0
        current.append((label, cell_width))
        used += cell_width + (5 if used else 0)
    if current:
        lines.append(current)
    result = []
    for line in lines:
        cells, widths, colored = [], [], []
        for index, (label, cell_width) in enumerate(line):
            if index:
                cells.append("")
                widths.append(5)
            colored.append(len(cells))
            cells.append(para(label, "pill"))
            widths.append(cell_width)
        table = Table([cells], colWidths=widths, hAlign="LEFT")
        commands = [("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 2),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]
        for index in colored:
            commands += [("BACKGROUND", (index, 0), (index, 0), PILL),
                         ("LEFTPADDING", (index, 0), (index, 0), 6),
                         ("RIGHTPADDING", (index, 0), (index, 0), 6)]
        table.setStyle(TableStyle(commands))
        result.append(table)
    return result


def title_row(item, width):
    title = [para(item["title_zh"], "headline"), Spacer(1, 2),
             para(item["title_en"], "en_title")]
    marker = FeaturedCorner() if item.get("featured") else ""
    table = Table([[title, marker]], colWidths=[width - 11 * mm, 11 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return table


def chunks(text, limit):
    text = str(text or "")
    pieces = []
    while len(text) > limit:
        cut = max(text.rfind(mark, 0, limit) for mark in ("。", ". ", "? ", "! "))
        if cut < limit // 2:
            cut = text.rfind(" ", 0, limit)
        if cut < limit // 2:
            cut = limit
        else:
            cut += 1
        pieces.append(text[:cut])
        text = text[cut:].lstrip()
    if text:
        pieces.append(text)
    return pieces


def panel_row(text, kind, width, top=0.5, bottom=0.5):
    table = Table([["", para(text, kind)]], colWidths=[3, width - 3], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), LINE),
        ("BACKGROUND", (1, 0), (1, 0), PANEL),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
        ("RIGHTPADDING", (1, 0), (1, 0), 9),
        ("TOPPADDING", (0, 0), (-1, -1), top),
        ("BOTTOMPADDING", (0, 0), (-1, -1), bottom),
    ]))
    return table


def card(item, width):
    inner = width - 28
    labels = [EVIDENCE.get(item["evidence_status"], item["evidence_status"]),
              *(item.get("topics") or [])[:3],
              ("北京时间" if item.get("event_time_bj") else "原文日期") + " " +
              (item.get("event_time_bj") or item.get("event_time_original") or "")[:10]]
    if item.get("category") == "paper" and item.get("paper_source_type") == "reprint":
        labels.append("转载来源")
    rows = [[pill_rows(labels, inner)], [title_row(item, inner)]]
    panel_indexes = []

    def add(flowable, panel=False):
        if panel:
            panel_indexes.append(len(rows))
        rows.append([flowable])

    if item.get("category") == "paper":
        corresponding = item.get("corresponding_authors") or []
        authors = [name + ("（第一作者）" if index == 0 else "") +
                   ("（通讯作者）" if any(author["name"] == name for author in corresponding) else "")
                   for index, name in enumerate(item["paper_authors"])]
        add(labeled("作者：", "、".join(authors)))
        add(labeled("第一作者单位：", "；".join(item["first_author_affiliations"]) or "不明确"))
        affiliations = "；".join(author["name"] + "：" + "；".join(author["affiliations"])
                                for author in corresponding)
        add(labeled("通讯作者单位：", affiliations or "论文未注明通讯作者"))
        if item.get("abstract_original"):
            add(panel_row("论文摘要原文 / Original abstract", "subheading", inner, top=8, bottom=3), True)
            original_kind = "body" if (item.get("abstract_language") or "").lower().startswith("zh") else "english"
            for part in chunks(item["abstract_original"], 420):
                add(panel_row(part, original_kind, inner), True)
            if item.get("abstract_zh_translation"):
                add(panel_row("摘要中文翻译", "subheading", inner, top=8, bottom=3), True)
                for part in chunks(item["abstract_zh_translation"], 210):
                    add(panel_row(part, "body", inner), True)
            if item.get("abstract_credit"):
                add(para(item["abstract_credit"], "credit"))
        else:
            add(panel_row("论文内容转述 / Paraphrase", "subheading", inner, top=8, bottom=3), True)
            for part in chunks(item["summary_zh"], 210):
                add(panel_row(part, "body", inner), True)
            for part in chunks(item["summary_en"], 420):
                add(panel_row(part, "english", inner), True)
    else:
        add(panel_row(item["summary_zh"], "body", inner, top=8), True)
        add(panel_row(item["summary_en"], "english", inner), True)

    if item.get("why_it_matters_zh"):
        add(labeled("意义：", item["why_it_matters_zh"], "body"))
    if item.get("limitations_zh"):
        add(labeled("局限：", item["limitations_zh"], "body"))
    if item.get("category") == "paper" and item.get("paper_source_type") == "reprint":
        add(para("未找到论文一手链接；以上内容来自转载。", "note"))
    source_label = "转载来源" if item.get("category") == "paper" and item.get("paper_source_type") == "reprint" else "来源"
    add(source_link(item["primary_url"], source_label))

    table = LongTable(rows, colWidths=[width], hAlign="LEFT", splitByRow=1)
    commands = [
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("LINEBELOW", (0, 1), (0, 1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("TOPPADDING", (0, 0), (0, 0), 12),
        ("BOTTOMPADDING", (0, 0), (0, 0), 5),
        ("TOPPADDING", (0, 1), (0, 1), 4),
        ("BOTTOMPADDING", (0, 1), (0, 1), 11),
        ("NOSPLIT", (0, -3), (0, -1)),
        ("TOPPADDING", (0, -1), (0, -1), 9),
        ("BOTTOMPADDING", (0, -1), (0, -1), 12),
    ]
    for index in panel_indexes:
        commands += [("TOPPADDING", (0, index), (0, index), 0),
                     ("BOTTOMPADDING", (0, index), (0, index), 0)]
    table.setStyle(TableStyle(commands))
    return table


def section_heading(label, count, width):
    table = Table([["", para(label, "section"), para(str(count), "note")]],
                  colWidths=[4, width - 34, 30], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), ACCENT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    return table


def ai_notice(width):
    table = Table([[para("AI生成", "notice_badge"),
                    para("内容由 AI 辅助整理与总结；请以每条所列来源为准。", "notice")]],
                  colWidths=[56, width - 56], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF4D8")),
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#8B5200")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return table


def draw_page(canvas, doc, issue_date):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(PALE)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.rect(0, height - 15 * mm, width, 15 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(0, height - 15 * mm, width, height - 15 * mm)
    canvas.setFillColor(INK)
    canvas.setFont(BOLD, 9)
    canvas.drawString(18 * mm, height - 10 * mm, "RoboticsNews")
    canvas.setFillColor(MUTED)
    canvas.setFont(FONT, 8)
    canvas.drawRightString(width - 18 * mm, height - 10 * mm, issue_date + " · 周报")
    canvas.line(18 * mm, 16 * mm, width - 18 * mm, 16 * mm)
    canvas.drawString(18 * mm, 10 * mm, "机器人学研究进展周报")
    canvas.drawRightString(width - 18 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


def build(source, target):
    issue = json.loads(Path(source).read_text(encoding="utf-8"))
    Path(target).parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(target), pagesize=A4, leftMargin=18 * mm,
                          rightMargin=18 * mm, topMargin=22 * mm, bottomMargin=22 * mm,
                          title=f"机器人学研究进展周报 {issue['date']}", author="RoboticsNews")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="issue", frames=frame,
                                     onPage=lambda canvas, page_doc: draw_page(canvas, page_doc, issue["date"])))

    story = [Spacer(1, 5 * mm), para(f"WEEKLY BRIEF  ·  {issue['date']}", "eyebrow"),
             Spacer(1, 4 * mm), para("机器人学研究进展周报", "title"),
             Spacer(1, 1 * mm), para("Robotics Research & Industry · Weekly Brief", "subtitle"),
             Spacer(1, 5 * mm), para(f"北京时间 {issue['date']} 发布  ·  {len(issue['entries'])} 条合格新增", "note"),
             Spacer(1, 5 * mm), ai_notice(doc.width), Spacer(1, 5 * mm),
             HRFlowable(width="100%", thickness=0.8, color=LINE), Spacer(1, 5 * mm),
             para(f"覆盖北京时间 {issue.get('coverage_start', '')} 00:00 至 {issue.get('coverage_end', '')} 24:00 首次公开的信息。", "note"),
             Spacer(1, 3 * mm)]
    if issue.get("revision_note"):
        story += [para(issue["revision_note"], "note")]
        if issue.get("previous_pdf_url"):
            story += [source_link(issue["previous_pdf_url"], "查看上一版 PDF")]
        story += [Spacer(1, 4 * mm)]

    for section, label in LABELS.items():
        items = [entry for entry in issue["entries"] if entry.get("placement", "unassigned") == section]
        if not items:
            continue
        story += [CondPageBreak(65 * mm), Spacer(1, 3 * mm),
                  section_heading(label, len(items), doc.width), Spacer(1, 5 * mm)]
        for item in items:
            story += [CondPageBreak(55 * mm), card(item, doc.width), Spacer(1, 4 * mm)]
    doc.build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-pdf.py issue.json digest.pdf")
    build(sys.argv[1], sys.argv[2])
