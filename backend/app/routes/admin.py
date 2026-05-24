from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import User, Order, Product, Coupon
from app.schemas.schemas import AdminStatsResponse, UserResponse, OrderResponse, CouponResponse
from app.auth.dependencies import get_admin_user
from sqlalchemy.orm import joinedload
from app.models.models import OrderItem

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db), _admin=Depends(get_admin_user)):
    """Get dashboard statistics."""
    total_users = db.query(func.count(User.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Order.final_amount), 0)).scalar()
    total_products = db.query(func.count(Product.id)).scalar()

    return AdminStatsResponse(
        total_users=total_users,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_products=total_products,
    )


@router.get("/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db), _admin=Depends(get_admin_user)):
    """Get all users (Admin only)."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/orders", response_model=list[OrderResponse])
def get_all_orders(db: Session = Depends(get_db), _admin=Depends(get_admin_user)):
    """Get all orders (Admin only)."""
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.coupon),
            joinedload(Order.user),
        )
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders
