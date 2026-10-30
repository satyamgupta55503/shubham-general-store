#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Convert DOCUMENTATION-HINDI.md -> DOCUMENTATION-HINDI.pdf
Branded cover page + headings + tables + code blocks + lists.
Uses reportlab (platypus). No pandoc / LibreOffice needed.
"""
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, Image, PageBreak, Preformatted, ListFlowable, ListItem,
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "DOCUMENTATION-HINDI.md")
OUT = os.path.join(ROOT, "DOCUMENTATION-HINDI.pdf")
LOGO = os.path.join(ROOT, "website", "public", "assets", "imgs", "template", "logo.png")

GREEN = colors.HexColor("#15803D")
GREEN2 = colors.HexColor("#16A34A")
DARK = colors.HexColor("#111827")
GREY = colors.HexColor("#6B7280")
CODE_BG = colors.HexColor("#F3F4F6")
LINE = colors.HexColor("#E5E7EB")

styles = getSampleStyleSheet()
BODY = ParagraphStyle("body", parent=styles["Normal"], fontName="Helvetica",
                      fontSize=10, leading=15, textColor=DARK, spaceAfter=4)
H1 = ParagraphStyle("h1", parent=BODY, fontName="Helvetica-Bold", fontSize=17,
                    textColor=GREEN, spaceBefore=16, spaceAfter=8, leading=21)
H2 = ParagraphStyle("h2", parent=BODY, fontName="Helvetica-Bold", fontSize=14,
                    textColor=GREEN, spaceBefore=12, spaceAfter=6, leading=18)
H3 = ParagraphStyle("h3", parent=BODY, fontName="Helvetica-Bold", fontSize=12,
                    textColor=DARK, spaceBefore=9, spaceAfter=4, leading=16)
H4 = ParagraphStyle("h4", parent=BODY, fontName="Helvetica-Bold", fontSize=11,
                    textColor=DARK, spaceBefore=7, spaceAfter=3, leading=15)
QUOTE = ParagraphStyle("quote", parent=BODY, fontName="Helvetica-Oblique",
                       textColor=GREY, leftIndent=12, spaceAfter=4)
CELL = ParagraphStyle("cell", parent=BODY, fontSize=9, leading=12, spaceAfter=0)
CELLH = ParagraphStyle("cellh", parent=CELL, fontName="Helvetica-Bold",
                       textColor=colors.white)


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inline(t):
    """Markdown inline -> reportlab mini-HTML. Strip links, bold, code."""
    t = esc(t)
    t = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", t)           # [text](url) -> text
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)        # bold
    t = re.sub(r"`(.+?)`", r'<font face="Courier" color="#B45309">\1</font>', t)
    return t


def parse_table_line(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def is_sep(line):
    return bool(re.match(r"^\s*\|?[\s:\-|]+\|?\s*$", line)) and "-" in line


def build_table(rows, width):
    header = rows[0]
    ncol = len(header)
    data = [[Paragraph(inline(c), CELLH) for c in header]]
    for r in rows[1:]:
        row = [Paragraph(inline(r[i]) if i < len(r) else "", CELL) for i in range(ncol)]
        data.append(row)
    col_w = width / ncol
    t = Table(data, colWidths=[col_w] * ncol, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN2),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
    ]))
    return t


def cover(width):
    els = [Spacer(1, 40 * mm)]
    if os.path.exists(LOGO):
        try:
            from PIL import Image as PILImage
            iw, ih = PILImage.open(LOGO).size
            w = 50 * mm
            h = w * ih / iw
            img = Image(LOGO, width=w, height=h)
            img.hAlign = "CENTER"
            els.append(img)
        except Exception:
            pass
    els.append(Spacer(1, 10 * mm))
    els.append(Paragraph("Subham General Store", ParagraphStyle(
        "ct", parent=BODY, fontName="Helvetica-Bold", fontSize=28,
        textColor=GREEN, alignment=TA_CENTER, leading=32)))
    els.append(Paragraph("Dual Grocery Marketplace", ParagraphStyle(
        "cs", parent=BODY, fontSize=13, textColor=GREY, alignment=TA_CENTER)))
    els.append(Spacer(1, 14 * mm))
    els.append(Paragraph("Sampurna Dastavez (Complete Documentation)", ParagraphStyle(
        "cd", parent=BODY, fontName="Helvetica-Bold", fontSize=15,
        textColor=DARK, alignment=TA_CENTER)))
    els.append(Paragraph("Business Flow · User Flow · Modules &amp; Submodules", ParagraphStyle(
        "cd2", parent=BODY, fontSize=10, textColor=GREY, alignment=TA_CENTER)))
    els.append(Spacer(1, 24 * mm))
    meta = [["Version", "1.0"], ["Bhasha", "Hindi (Roman)"],
            ["Antim Update", "October 2026"], ["Powered By", "Subham Gupta"]]
    mt = Table(meta, colWidths=[40 * mm, 60 * mm])
    mt.hAlign = "CENTER"
    mt.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 0), (0, -1), GREEN),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    els.append(mt)
    els.append(Spacer(1, 20 * mm))
    els.append(Paragraph("Confidential — Internal Use Only", ParagraphStyle(
        "cf", parent=BODY, fontName="Helvetica-Oblique", fontSize=9,
        textColor=GREY, alignment=TA_CENTER)))
    els.append(PageBreak())
    return els


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    # Header
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(GREEN)
    canvas.drawString(18 * mm, h - 12 * mm, "Subham General Store")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(53 * mm, h - 12 * mm, "·  Documentation")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, h - 14 * mm, w - 18 * mm, h - 14 * mm)
    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawCentredString(w / 2, 10 * mm, f"Page {doc.page - 1}")
    canvas.restoreState()


def main():
    with open(SRC, "r", encoding="utf-8") as f:
        lines = f.read().split("\n")

    doc = BaseDocTemplate(OUT, pagesize=A4,
                          leftMargin=18 * mm, rightMargin=18 * mm,
                          topMargin=20 * mm, bottomMargin=16 * mm)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
    cover_frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="c")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame]),
        PageTemplate(id="body", frames=[frame], onPage=header_footer),
    ])

    story = []
    story += cover(doc.width)
    # switch to body template after cover
    from reportlab.platypus import NextPageTemplate
    story.insert(0, NextPageTemplate("cover"))
    story.append(NextPageTemplate("body"))

    skipped_first_h1 = False
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        s = line.strip()

        if s.startswith("```"):
            block = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                block.append(lines[i])
                i += 1
            code = Preformatted("\n".join(block) or " ", ParagraphStyle(
                "code", parent=BODY, fontName="Courier", fontSize=8.5, leading=11,
                textColor=colors.HexColor("#1F2937"), backColor=CODE_BG,
                borderPadding=6, leftIndent=2, spaceBefore=4, spaceAfter=8))
            story.append(code)
            i += 1
            continue

        if s.startswith("|") and i + 1 < n and is_sep(lines[i + 1]):
            rows = [parse_table_line(line)]
            i += 2
            while i < n and lines[i].strip().startswith("|"):
                rows.append(parse_table_line(lines[i]))
                i += 1
            story.append(build_table(rows, doc.width))
            story.append(Spacer(1, 6))
            continue

        if s in ("---", "***", "___"):
            i += 1
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            lvl = len(m.group(1))
            txt = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", m.group(2))
            if lvl == 1 and not skipped_first_h1:
                skipped_first_h1 = True
                i += 1
                continue
            style = {1: H1, 2: H2, 3: H3, 4: H4}[lvl]
            story.append(Paragraph(esc(txt), style))
            i += 1
            continue

        if s.startswith(">"):
            story.append(Paragraph(inline(s.lstrip(">").strip()), QUOTE))
            i += 1
            continue

        if re.match(r"^[-*]\s+", s):
            items = []
            while i < n and re.match(r"^[-*]\s+", lines[i].strip()):
                txt = re.sub(r"^[-*]\s+", "", lines[i].strip())
                items.append(ListItem(Paragraph(inline(txt), BODY), leftIndent=14))
                i += 1
            story.append(ListFlowable(items, bulletType="bullet", start="•",
                                      bulletColor=GREEN2, leftIndent=12))
            continue

        if re.match(r"^\d+\.\s+", s):
            items = []
            while i < n and re.match(r"^\d+\.\s+", lines[i].strip()):
                txt = re.sub(r"^\d+\.\s+", "", lines[i].strip())
                items.append(ListItem(Paragraph(inline(txt), BODY), leftIndent=16))
                i += 1
            story.append(ListFlowable(items, bulletType="1", leftIndent=14))
            continue

        if s == "":
            i += 1
            continue

        story.append(Paragraph(inline(s), BODY))
        i += 1

    doc.build(story)
    print("PDF saved to:", OUT)


if __name__ == "__main__":
    main()
