import csv
import io
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


def generate_json_export(interview: dict) -> str:
    """Format full interview object as pretty JSON."""
    return json.dumps(interview, indent=2, default=str)


def generate_csv_export(interview: dict) -> str:
    """Format questions and rubrics as a CSV sheet."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header metadata
    writer.writerow(["InterviewIQ - AI Generated Interview Set"])
    writer.writerow(["Role", interview.get("role_title", "")])
    writer.writerow(["Experience Level", interview.get("experience_level", "")])
    writer.writerow(["Interview Type", interview.get("interview_type", "")])
    writer.writerow(["Difficulty", interview.get("difficulty", "")])
    writer.writerow(["Skills", interview.get("required_skills", "")])
    writer.writerow(["Generated Date", str(interview.get("created_at", ""))])
    writer.writerow([])

    # Table columns
    writer.writerow([
        "Q#",
        "Topic",
        "Type",
        "Difficulty",
        "Question",
        "Suggested Model Answer",
        "Key Concepts",
        "Max Score",
        "Rubric Criteria & Points",
        "Red Flags",
        "Follow-Up Questions"
    ])

    questions = interview.get("questions", [])
    for q in questions:
        # Format rubric criteria as a readable multi-line string
        rubrics = q.get("evaluation_rubric", [])
        rubric_text = "; ".join([
            f"{r.get('criterion_name')} ({r.get('max_points')} pts): {r.get('description')}"
            for r in rubrics
        ])

        writer.writerow([
            q.get("number", ""),
            q.get("topic", ""),
            q.get("question_type", ""),
            q.get("difficulty", ""),
            q.get("question", ""),
            q.get("suggested_answer", ""),
            ", ".join(q.get("key_concepts", [])),
            q.get("max_score", 10),
            rubric_text,
            " | ".join(q.get("red_flags", [])),
            " | ".join(q.get("follow_up_questions", []))
        ])

    return output.getvalue()


def generate_pdf_export(interview: dict) -> bytes:
    """Generate a high-quality, professional printable PDF report using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_purple = colors.HexColor("#6D28D9")
    brand_light_purple = colors.HexColor("#F5F3FF")
    text_dark = colors.HexColor("#1E293B")
    text_muted = colors.HexColor("#64748B")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=brand_purple,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=text_muted,
        spaceAfter=12
    )

    meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=text_dark
    )

    meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=text_muted
    )

    q_title_style = ParagraphStyle(
        "QTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=brand_purple,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=6
    )

    rubric_head = ParagraphStyle(
        "RubricHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    rubric_cell = ParagraphStyle(
        "RubricCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=text_dark
    )

    elements = []

    # Title & Branding
    elements.append(Paragraph("InterviewIQ — Interview Question & Evaluation Guide", title_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')} | Confidential & Structured Assessment", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=brand_purple, spaceAfter=10))

    # Metadata Grid
    meta_data = [
        [
            Paragraph("Target Role:", meta_label), Paragraph(str(interview.get("role_title", "N/A")), meta_val),
            Paragraph("Experience Level:", meta_label), Paragraph(str(interview.get("experience_level", "N/A")), meta_val),
        ],
        [
            Paragraph("Interview Type:", meta_label), Paragraph(str(interview.get("interview_type", "N/A")), meta_val),
            Paragraph("Difficulty:", meta_label), Paragraph(str(interview.get("difficulty", "N/A")), meta_val),
        ],
        [
            Paragraph("Core Skills:", meta_label), Paragraph(str(interview.get("required_skills", "N/A")), meta_val),
            Paragraph("Duration / Questions:", meta_label), Paragraph(f"{interview.get('duration_minutes', 45)} mins / {len(interview.get('questions', []))} Questions", meta_val),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[100, 170, 110, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), brand_light_purple),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # Questions section
    questions = interview.get("questions", [])
    for q in questions:
        q_elements = []
        num = q.get("number", 1)
        topic = q.get("topic", "")
        diff = q.get("difficulty", "")
        max_s = q.get("max_score", 10)
        q_text = q.get("question", "")

        q_elements.append(Paragraph(f"Question #{num} [{diff.upper()}] — {topic} (Max: {max_s} pts)", q_title_style))
        q_elements.append(Paragraph(f"<b>Prompt:</b> {q_text}", body_style))

        # Suggested Answer
        ans = q.get("suggested_answer", "")
        q_elements.append(Paragraph(f"<b>Model Answer / Evaluation Criteria:</b><br/>{ans}", body_style))

        # Key Concepts & Follow-ups
        concepts = q.get("key_concepts", [])
        if concepts:
            q_elements.append(Paragraph(f"<b>Key Concepts:</b> {', '.join(concepts)}", body_style))

        follow_ups = q.get("follow_up_questions", [])
        if follow_ups:
            q_elements.append(Paragraph(f"<b>Follow-Up Questions:</b> {' | '.join(follow_ups)}", body_style))

        red_flags = q.get("red_flags", [])
        if red_flags:
            q_elements.append(Paragraph(f"<b>Red Flags:</b> {' | '.join(red_flags)}", body_style))

        # Rubric Table
        rubrics = q.get("evaluation_rubric", [])
        if rubrics:
            rubric_rows = [
                [
                    Paragraph("Criterion", rubric_head),
                    Paragraph("Description", rubric_head),
                    Paragraph("Points", rubric_head),
                    Paragraph("Indicators", rubric_head)
                ]
            ]
            for r in rubrics:
                strong = " | ".join(r.get("strong_indicators", []))
                weak = " | ".join(r.get("weak_indicators", []))
                indicators_text = f"<b>Strong:</b> {strong}<br/><b>Weak:</b> {weak}" if (strong or weak) else ""
                rubric_rows.append([
                    Paragraph(str(r.get("criterion_name", "")), rubric_cell),
                    Paragraph(str(r.get("description", "")), rubric_cell),
                    Paragraph(f"{r.get('max_points', 0)} pts", rubric_cell),
                    Paragraph(indicators_text, rubric_cell)
                ])

            r_table = Table(rubric_rows, colWidths=[110, 160, 50, 220])
            r_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), brand_purple),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('PADDING', (0, 0), (-1, -1), 4),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            q_elements.append(Spacer(1, 4))
            q_elements.append(r_table)

        q_elements.append(Spacer(1, 10))
        q_elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=10))

        # Keep individual question and rubric together where possible
        elements.append(KeepTogether(q_elements))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
