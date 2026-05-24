from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from decimal import Decimal
from app.database.session import get_db
from app.models.models import Order, OrderItem, Cart, Product, Coupon, User
from app.schemas.schemas import (
    OrderCreate, OrderResponse, OrderStatusUpdate, OrderItemResponse, MessageResponse
)
from app.auth.dependencies import get_current_user, get_admin_user
from app.utils.invoice import generate_invoice_pdf
import io

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/create", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Place an order from the current user's cart."""
    cart_items = (
        db.query(Cart)
        .options(joinedload(Cart.product))
        .filter(Cart.user_id == user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate total
    total_amount = Decimal("0")
    for item in cart_items:
        if item.product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item.product.name}",
            )
        total_amount += Decimal(str(item.product.price)) * item.quantity

    # Apply coupon
    discount_amount = Decimal("0")
    coupon_id = None
    if payload.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == payload.coupon_code.upper()).first()
        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid coupon code")
        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Coupon is inactive")
        if coupon.expiry_date.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Coupon has expired")
        if total_amount < Decimal(str(coupon.min_order_amount)):
            raise HTTPException(
                status_code=400,
                detail=f"Minimum order amount is ₹{coupon.min_order_amount}",
            )

        if coupon.discount_type.value == "percent":
            discount_amount = total_amount * Decimal(str(coupon.discount_value)) / Decimal("100")
        else:
            discount_amount = Decimal(str(coupon.discount_value))

        discount_amount = min(discount_amount, total_amount)
        coupon_id = coupon.id

    final_amount = total_amount - discount_amount

    # Create order
    order = Order(
        user_id=user.id,
        coupon_id=coupon_id,
        total_amount=total_amount,
        discount_amount=discount_amount,
        final_amount=final_amount,
    )
    db.add(order)
    db.flush()

    # Create order items + reduce stock
    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price,
        )
        db.add(order_item)
        item.product.stock -= item.quantity

    # Clear cart
    db.query(Cart).filter(Cart.user_id == user.id).delete()
    db.commit()
    db.refresh(order)

    # Reload with relationships
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.coupon),
        )
        .filter(Order.id == order.id)
        .first()
    )
    return order


@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get all orders for the current user."""
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.coupon),
        )
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get a single order by ID."""
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
    return order


@router.put("/{order_id}/status", response_model=MessageResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    """Update an order's status (Admin only)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use: {valid_statuses}")

    order.status = payload.status
    db.commit()
    return MessageResponse(message=f"Order status updated to {payload.status}")
