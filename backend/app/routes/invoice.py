from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models.models import Order, OrderItem, User
from app.schemas.schemas import OrderResponse
from app.auth.dependencies import get_current_user
from app.utils.invoice import generate_invoice_pdf

router = APIRouter(prefix="/invoice", tags=["Invoice"])


@router.get("/{order_id}")
def download_invoice(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Download a PDF invoice for an order."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.coupon),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    pdf_buffer = generate_invoice_pdf(order, user)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="invoice-{order.id}.pdf"'
        },
    )
