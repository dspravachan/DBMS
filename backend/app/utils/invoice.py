"""PDF Invoice Generator using ReportLab."""

import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


def generate_invoice_pdf(order, user) -> io.BytesIO:
    """Generate a professional PDF invoice for an order.

    Args:
        order: Order SQLAlchemy model instance with items loaded.
        user: User SQLAlchemy model instance.

    Returns:
        BytesIO buffer containing the PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=28,
        textColor=colors.HexColor("#6C63FF"),
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#6B7280"),
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#1F2937"),
        spaceBefore=16,
        spaceAfter=8,
        fontName="Helvetica-Bold",
    )
    normal_style = ParagraphStyle(
        "NormalText",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#374151"),
        leading=14,
    )
    right_style = ParagraphStyle(
        "RightText",
        parent=normal_style,
        alignment=TA_RIGHT,
    )

    elements = []

    # ── Header ──
    elements.append(Paragraph("FOODIE EXPRESS", title_style))
    elements.append(Paragraph("Tax Invoice / Receipt", subtitle_style))
    elements.append(HRFlowable(
        width="100%", thickness=2, color=colors.HexColor("#6C63FF"),
        spaceBefore=4, spaceAfter=16
    ))

    # ── Invoice Meta ──
    order_date = order.created_at.strftime("%B %d, %Y") if order.created_at else datetime.now().strftime("%B %d, %Y")
    meta_data = [
        ["Invoice Number:", f"INV-{order.id:06d}", "Date:", order_date],
        ["Order ID:", f"#{order.id}", "Status:", order.status.value.upper() if hasattr(order.status, 'value') else str(order.status).upper()],
    ]
    meta_table = Table(meta_data, colWidths=[100, 180, 80, 150])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#374151")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#111827")),
        ("TEXTCOLOR", (3, 0), (3, -1), colors.HexColor("#111827")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # ── Customer Details ──
    elements.append(Paragraph("Bill To", heading_style))
    elements.append(Paragraph(f"<b>{user.name}</b>", normal_style))
    elements.append(Paragraph(user.email, normal_style))
    elements.append(Spacer(1, 16))

    # ── Product Table ──
    elements.append(Paragraph("Order Items", heading_style))

    table_header = ["#", "Product", "Qty", "Unit Price", "Total"]
    table_data = [table_header]

    for idx, item in enumerate(order.items, 1):
        product_name = item.product.name if item.product else f"Product #{item.product_id}"
        unit_price = float(item.unit_price)
        line_total = unit_price * item.quantity
        table_data.append([
            str(idx),
            product_name,
            str(item.quantity),
            f"Rs.{unit_price:,.2f}",
            f"Rs.{line_total:,.2f}",
        ])

    product_table = Table(table_data, colWidths=[30, 230, 50, 100, 100])
    product_table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6C63FF")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
        # Body rows
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#374151")),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
        ("TOPPADDING", (0, 1), (-1, -1), 8),
        # Alternating row colors
        *[
            ("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F9FAFB"))
            for i in range(2, len(table_data), 2)
        ],
        # Grid
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#6C63FF")),
        ("LINEBELOW", (0, -1), (-1, -1), 1, colors.HexColor("#E5E7EB")),
        # Alignment
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 0), (-1, -1), "CENTER"),
        ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
    ]))
    elements.append(product_table)
    elements.append(Spacer(1, 20))

    # ── Totals ──
    total_amount = float(order.total_amount)
    discount_amount = float(order.discount_amount)
    final_amount = float(order.final_amount)

    totals_data = [
        ["", "", "Subtotal:", f"Rs.{total_amount:,.2f}"],
    ]
    if discount_amount > 0:
        coupon_code = order.coupon.code if order.coupon else "Coupon"
        totals_data.append(["", "", f"Discount ({coupon_code}):", f"- Rs.{discount_amount:,.2f}"])

    totals_data.append(["", "", "Total:", f"Rs.{final_amount:,.2f}"])

    totals_table = Table(totals_data, colWidths=[180, 100, 120, 110])
    totals_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor("#6B7280")),
        ("TEXTCOLOR", (3, 0), (3, -1), colors.HexColor("#111827")),
        ("FONTNAME", (2, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (2, -1), (-1, -1), 12),
        ("TEXTCOLOR", (2, -1), (2, -1), colors.HexColor("#6C63FF")),
        ("TEXTCOLOR", (3, -1), (3, -1), colors.HexColor("#6C63FF")),
        ("LINEABOVE", (2, -1), (-1, -1), 1.5, colors.HexColor("#6C63FF")),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 40))

    # ── Footer ──
    elements.append(HRFlowable(
        width="100%", thickness=1, color=colors.HexColor("#E5E7EB"),
        spaceBefore=0, spaceAfter=12
    ))
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#9CA3AF"),
        alignment=TA_CENTER,
    )
    elements.append(Paragraph("Thank you for ordering with FoodieExpress!", footer_style))
    elements.append(Paragraph("This is a computer-generated invoice and does not require a signature.", footer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer
