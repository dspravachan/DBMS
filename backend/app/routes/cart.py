from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models.models import Cart, Product, User
from app.schemas.schemas import CartAdd, CartUpdate, CartItemResponse, CartResponse, MessageResponse
from app.auth.dependencies import get_current_user
from decimal import Decimal

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("/", response_model=CartResponse)
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get the current user's cart with all items and total."""
    items = (
        db.query(Cart)
        .options(joinedload(Cart.product).joinedload(Product.category))
        .filter(Cart.user_id == user.id)
        .all()
    )
    total = sum(float(item.product.price) * item.quantity for item in items)
    return CartResponse(
        items=[CartItemResponse.model_validate(item) for item in items],
        total=round(total, 2),
    )


@router.post("/add", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: CartAdd,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add a product to the cart or update quantity if it already exists."""
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    existing = (
        db.query(Cart)
        .filter(Cart.user_id == user.id, Cart.product_id == payload.product_id)
        .first()
    )
    if existing:
        existing.quantity += payload.quantity
        if existing.quantity > product.stock:
            raise HTTPException(status_code=400, detail="Insufficient stock")
    else:
        cart_item = Cart(user_id=user.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(cart_item)

    db.commit()
    return MessageResponse(message="Item added to cart")


@router.put("/update", response_model=MessageResponse)
def update_cart(
    payload: CartUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update the quantity of a cart item."""
    cart_item = (
        db.query(Cart)
        .filter(Cart.user_id == user.id, Cart.product_id == payload.product_id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity <= 0:
        db.delete(cart_item)
    else:
        product = db.query(Product).filter(Product.id == payload.product_id).first()
        if product.stock < payload.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        cart_item.quantity = payload.quantity

    db.commit()
    return MessageResponse(message="Cart updated")


@router.delete("/remove/{product_id}", response_model=MessageResponse)
def remove_from_cart(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remove a product from the cart."""
    cart_item = (
        db.query(Cart)
        .filter(Cart.user_id == user.id, Cart.product_id == product_id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return MessageResponse(message="Item removed from cart")
