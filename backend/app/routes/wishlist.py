from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.models.models import Wishlist, Product, User
from app.schemas.schemas import WishlistAdd, WishlistItemResponse, MessageResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/", response_model=list[WishlistItemResponse])
def get_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get all wishlist items for the current user."""
    items = (
        db.query(Wishlist)
        .options(joinedload(Wishlist.product).joinedload(Product.category))
        .filter(Wishlist.user_id == user.id)
        .all()
    )
    return [WishlistItemResponse.model_validate(item) for item in items]


@router.post("/add", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    payload: WishlistAdd,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add a product to the user's wishlist."""
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.product_id == payload.product_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    wishlist_item = Wishlist(user_id=user.id, product_id=payload.product_id)
    db.add(wishlist_item)
    db.commit()
    return MessageResponse(message="Added to wishlist")


@router.delete("/remove/{product_id}", response_model=MessageResponse)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remove a product from the user's wishlist."""
    wishlist_item = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.product_id == product_id)
        .first()
    )
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")

    db.delete(wishlist_item)
    db.commit()
    return MessageResponse(message="Removed from wishlist")
