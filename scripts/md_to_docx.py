#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Convert DOCUMENTATION-HINDI.md -> DOCUMENTATION-HINDI.docx
Supports: H1-H4 headings, tables (pipe), code blocks (```), bullet/numbered
lists, blockquotes, bold (**), and inline code (`).
Pure python-docx, no pandoc needed.
"""
import os
import re
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "DOCUMENTATION-HINDI.md")
OUT = os.path.join(ROOT, "DOCUMENTATION-HINDI.docx")
LOGO = os.path.join(ROOT, "website", "public", "assets", "imgs", "template", "logo.png")

GREEN = RGBColor(0x15, 0x80, 0x3D)
DARK = RGBColor(0x11, 0x18, 0x27)
GREY = RGBColor(0x6B, 0x72, 0x80)
CODE_BG = "F3F4F6"
HEAD_BG = "16A34A"


def shade_cell(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def set_cell_text(cell, text, bold=False, color=None, white=False):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.space_before = Pt(2)
    add_inline_runs(p, text, base_bold=bold)
    for run in p.runs:
        run.font.size = Pt(9.5)
        if white:
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        elif color:
            run.font.color.rgb = color


def add_inline_runs(paragraph, text, base_bold=False):
    """Handle **bold** and `code` inline."""
    # tokenise on ** and `
    pattern = re.compile(r"(\*\*.+?\*\*|`.+?`)")
    pos = 0
    for m in pattern.finditer(text):
        if m.start() > pos:
            r = paragraph.add_run(text[pos:m.start()])
            r.bold = base_bold
        tok = m.group(0)
        if tok.startswith("**"):
            r = paragraph.add_run(tok[2:-2])
            r.bold = True
        elif tok.startswith("`"):
            r = paragraph.add_run(tok[1:-1])
            r.font.name = "Consolas"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(0xB4, 0x53, 0x09)
        pos = m.end()
    if pos < len(text):
        r = paragraph.add_run(text[pos:])
        r.bold = base_bold


def add_heading(doc, text, level):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14 if level <= 2 else 10)
    p.paragraph_format.space_after = Pt(6)
    # strip markdown links [text](#anchor) -> text
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
    run = p.add_run(text)
    run.bold = True
    sizes = {1: 20, 2: 16, 3: 13.5, 4: 12}
    run.font.size = Pt(sizes.get(level, 12))
    run.font.color.rgb = GREEN if level <= 2 else DARK
    if level == 1:
        pPr = p._p.get_or_add_pPr()
        pbdr = OxmlElement("w:pBdr")
        bottom = OxmlElement("w:bottom")
        bottom.set(qn("w:val"), "single")
        bottom.set(qn("w:sz"), "12")
        bottom.set(qn("w:space"), "4")
        bottom.set(qn("w:color"), "16A34A")
        pbdr.append(bottom)
        pPr.append(pbdr)


def add_table(doc, rows):
    header = [c.strip() for c in rows[0]]
    body = rows[1:]
    table = doc.add_table(rows=1, cols=len(header))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    hdr = table.rows[0].cells
    for i, h in enumerate(header):
        set_cell_text(hdr[i], h, bold=True, white=True)
        shade_cell(hdr[i], HEAD_BG)
    for r in body:
        cells = table.add_row().cells
        for i in range(len(header)):
            val = r[i].strip() if i < len(r) else ""
            set_cell_text(cells[i], val)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)


def add_code_block(doc, lines):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.left_indent = Inches(0.1)
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), CODE_BG)
    pPr.append(shd)
    run = p.add_run("\n".join(lines))
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)


def parse_table_line(line):
    parts = line.strip().strip("|").split("|")
    return [p.strip() for p in parts]


def is_sep(line):
    return bool(re.match(r"^\s*\|?[\s:\-|]+\|?\s*$", line)) and "-" in line


def add_cover_page(doc):
    """Branded cover page: logo, title, subtitle, meta box, page break."""
    # top spacing
    for _ in range(3):
        doc.add_paragraph()

    if os.path.exists(LOGO):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        try:
            p.add_run().add_picture(LOGO, width=Inches(2.0))
        except Exception:
            pass

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    r = p.add_run("Subham General Store")
    r.bold = True
    r.font.size = Pt(30)
    r.font.color.rgb = GREEN

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Dual Grocery Marketplace")
    r.font.size = Pt(14)
    r.font.color.rgb = GREY

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(26)
    r = p.add_run("Sampurna Dastavez (Complete Documentation)")
    r.bold = True
    r.font.size = Pt(16)
    r.font.color.rgb = DARK

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Business Flow · User Flow · Modules & Submodules")
    r.font.size = Pt(11)
    r.font.color.rgb = GREY

    for _ in range(6):
        doc.add_paragraph()

    # meta table
    meta = [
        ("Version", "1.0"),
        ("Bhasha", "Hindi (Roman)"),
        ("Antim Update", "October 2026"),
        ("Powered By", "Subham Gupta"),
    ]
    t = doc.add_table(rows=0, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for k, v in meta:
        cells = t.add_row().cells
        set_cell_text(cells[0], k, bold=True, color=GREEN)
        set_cell_text(cells[1], v)
    # confidential footer line
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(30)
    r = p.add_run("Confidential — Internal Use Only")
    r.italic = True
    r.font.size = Pt(9)
    r.font.color.rgb = GREY

    doc.add_page_break()


def add_header_footer(doc):
    section = doc.sections[0]
    # Header
    header = section.header
    hp = header.paragraphs[0]
    hp.text = ""
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = hp.add_run("Subham General Store")
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = GREEN
    r2 = hp.add_run("   ·   Documentation")
    r2.font.size = Pt(9)
    r2.font.color.rgb = GREY
    # Footer with page number
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fp.text = ""
    r = fp.add_run("Page ")
    r.font.size = Pt(8)
    r.font.color.rgb = GREY
    # PAGE field
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    run_el = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    run_el.append(rpr)
    fld.append(run_el)
    fp._p.append(fld)


def main():
    with open(SRC, "r", encoding="utf-8") as f:
        lines = f.read().split("\n")

    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(10.5)

    add_header_footer(doc)
    add_cover_page(doc)

    # Skip the first H1 in the MD (cover already has the title)
    skipped_first_h1 = False

    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()

        # Code block
        if stripped.startswith("```"):
            block = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                block.append(lines[i])
                i += 1
            add_code_block(doc, block)
            i += 1
            continue

        # Table
        if stripped.startswith("|") and i + 1 < n and is_sep(lines[i + 1]):
            rows = [parse_table_line(line)]
            i += 2  # skip header + separator
            while i < n and lines[i].strip().startswith("|"):
                rows.append(parse_table_line(lines[i]))
                i += 1
            add_table(doc, rows)
            continue

        # Horizontal rule
        if stripped in ("---", "***", "___"):
            i += 1
            continue

        # Headings
        m = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if m:
            lvl = len(m.group(1))
            if lvl == 1 and not skipped_first_h1:
                skipped_first_h1 = True
                i += 1
                continue
            add_heading(doc, m.group(2), lvl)
            i += 1
            continue

        # Blockquote
        if stripped.startswith(">"):
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.3)
            txt = stripped.lstrip(">").strip()
            add_inline_runs(p, txt)
            for run in p.runs:
                run.italic = True
                run.font.color.rgb = GREY
            i += 1
            continue

        # Bullet list
        if re.match(r"^[-*]\s+", stripped):
            txt = re.sub(r"^[-*]\s+", "", stripped)
            p = doc.add_paragraph(style="List Bullet")
            add_inline_runs(p, txt)
            i += 1
            continue

        # Numbered list
        if re.match(r"^\d+\.\s+", stripped):
            txt = re.sub(r"^\d+\.\s+", "", stripped)
            p = doc.add_paragraph(style="List Number")
            add_inline_runs(p, txt)
            i += 1
            continue

        # Blank
        if stripped == "":
            i += 1
            continue

        # Normal paragraph
        p = doc.add_paragraph()
        add_inline_runs(p, stripped)
        i += 1

    doc.save(OUT)
    print("DOCX saved to:", OUT)


if __name__ == "__main__":
    main()
