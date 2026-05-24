from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ──────────────────── Auth Schemas ────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ──────────────────── Category Schemas ────────────────────

class CategoryCreate(BaseModel):
    name: str
    slug: str


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


# ──────────────────── Product Schemas ────────────────────

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category_id: int
    image_url: Optional[str] = None
    rating: Optional[float] = 0.0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    rating: Optional[float] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    category_id: int
    category: Optional[CategoryResponse] = None
    image_url: Optional[str]
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int
    page: int
    pages: int


# ──────────────────── Cart Schemas ────────────────────

class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartUpdate(BaseModel):
    product_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float


# ──────────────────── Wishlist Schemas ────────────────────

class WishlistAdd(BaseModel):
    product_id: int


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    added_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True


# ──────────────────── Coupon Schemas ────────────────────

class CouponCreate(BaseModel):
    code: str
    discount_type: str  # "percent" or "flat"
    discount_value: float
    min_order_amount: float = 0
    expiry_date: datetime
    is_active: bool = True


class CouponApply(BaseModel):
    code: str


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    expiry_date: datetime
    is_active: bool

    class Config:
        from_attributes = True


class CouponApplyResponse(BaseModel):
    coupon: CouponResponse
    discount_amount: float
    message: str


# ──────────────────── Order Schemas ────────────────────

class OrderCreate(BaseModel):
    coupon_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    coupon_id: Optional[int]
    total_amount: float
    discount_amount: float
    final_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse] = []
    coupon: Optional[CouponResponse] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# ──────────────────── Admin Schemas ────────────────────

class AdminStatsResponse(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    total_products: int


class MessageResponse(BaseModel):
    message: str
