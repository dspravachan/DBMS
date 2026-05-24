"""FoodieExpress Food Ordering Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config.settings import settings
from app.database.session import engine, Base, get_db
from app.models.models import User, Product, Order
from app.routes import auth, products, categories, cart, wishlist, coupons, orders, invoice, admin

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Modern AI-Ready E-Commerce Order Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(coupons.router)
app.include_router(orders.router)
app.include_router(invoice.router)
app.include_router(admin.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "healthy"}


@app.get("/db-status", tags=["Root"])
def db_status(db: Session = Depends(get_db)):
    """Public endpoint — confirms DB is live and shows record counts."""
    user_count = db.query(func.count(User.id)).scalar()
    product_count = db.query(func.count(Product.id)).scalar()
    order_count = db.query(func.count(Order.id)).scalar()
    return {
        "status": "connected",
        "database": "MySQL",
        "records": {
            "users": user_count,
            "products": product_count,
            "orders": order_count,
        },
        "message": f"{user_count} users, {product_count} products, {order_count} orders in database",
    }
