from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database.session import get_db
from app.models.models import Coupon, User
from app.schemas.schemas import (
    CouponCreate, CouponApply, CouponResponse, CouponApplyResponse, MessageResponse
)
from app.auth.dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/coupon", tags=["Coupons"])


@router.get("/", response_model=list[CouponResponse])
def get_coupons(db: Session = Depends(get_db), _admin=Depends(get_admin_user)):
    """List all coupons (Admin only)."""
    return db.query(Coupon).all()


@router.post("/create", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    payload: CouponCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    """Create a new coupon (Admin only)."""
    existing = db.query(Coupon).filter(Coupon.code == payload.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = Coupon(
        code=payload.code.upper(),
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        min_order_amount=payload.min_order_amount,
        expiry_date=payload.expiry_date,
        is_active=payload.is_active,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.post("/apply", response_model=CouponApplyResponse)
def apply_coupon(
    payload: CouponApply,
    cart_total: float = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Validate and apply a coupon code. Returns discount amount."""
    coupon = db.query(Coupon).filter(Coupon.code == payload.code.upper()).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Coupon is inactive")
    if coupon.expiry_date.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")

    return CouponApplyResponse(
        coupon=CouponResponse.model_validate(coupon),
        discount_amount=0,
        message="Coupon is valid",
    )


@router.delete("/{coupon_id}", response_model=MessageResponse)
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    """Delete a coupon (Admin only)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    return MessageResponse(message="Coupon deleted")
