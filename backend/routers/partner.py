from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models import User, Partner, Product, Promotion, Order, OrderItem, OrderStatus, UserType, PartnerImage
from routers.websocket import manager
from schemas import (
    PartnerResponse, PartnerUpdate,
    ProductCreate, ProductResponse, ProductUpdate,
    PromotionCreate, PromotionResponse, PromotionUpdate,
    OrderResponse, OrderUpdate,
    StatisticsResponse, PartnerImageResponse, PartnerImageCreate
)
from auth import get_current_user

router = APIRouter(prefix="/api/partner", tags=["partner"])

def get_partner_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Partner:
    if current_user.user_type != UserType.PARTNER:
        raise HTTPException(status_code=403, detail="Only partners can access this")
    
    partner = db.query(Partner).filter(Partner.user_id == current_user.id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner profile not found")
    return partner

# Partner Profile
@router.get("/profile", response_model=PartnerResponse)
def get_profile(partner: Partner = Depends(get_partner_profile)):
    return partner

@router.put("/profile", response_model=PartnerResponse)
def update_profile(
    partner_data: PartnerUpdate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    for key, value in partner_data.dict(exclude_unset=True).items():
        setattr(partner, key, value)
    db.commit()
    db.refresh(partner)
    return partner

# Orders
@router.get("/orders", response_model=List[OrderResponse])
def get_orders(partner: Partner = Depends(get_partner_profile), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.partner_id == partner.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.partner_id == partner.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.partner_id == partner.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order_data.status:
        order.status = order_data.status
    db.commit()
    db.refresh(order)
    
    # Notify via WebSocket
    order_data_dict = {
        "id": order.id,
        "status": order.status.value,
        "customer_id": order.customer_id,
        "partner_id": order.partner_id,
        "total_amount": order.total_amount,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }
    await manager.broadcast_order_update(order_data_dict, order.customer_id, partner.user_id)
    
    return order

@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.partner_id == partner.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != OrderStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only delete completed orders")
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}

# Products
@router.get("/products", response_model=List[ProductResponse])
def get_products(partner: Partner = Depends(get_partner_profile), db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.partner_id == partner.id).all()

@router.post("/products", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    # Calculate final price if original_price and discount_percent are provided
    final_price = product_data.price
    if product_data.original_price and product_data.discount_percent:
        final_price = product_data.original_price * (1 - product_data.discount_percent / 100)
    elif product_data.original_price:
        final_price = product_data.original_price
    elif not final_price:
        raise HTTPException(status_code=400, detail="Either price or original_price must be provided")
    
    db_product = Product(
        partner_id=partner.id,
        name=product_data.name,
        description=product_data.description,
        price=final_price,
        original_price=product_data.original_price,
        discount_percent=product_data.discount_percent,
        image_url=product_data.image_url,
        is_available=product_data.is_available
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.partner_id == partner.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate final price if original_price and discount_percent are provided
    update_data = product_data.dict(exclude_unset=True)
    if 'original_price' in update_data and 'discount_percent' in update_data:
        if update_data['original_price'] is not None and update_data['discount_percent'] is not None:
            update_data['price'] = update_data['original_price'] * (1 - update_data['discount_percent'] / 100)
    elif 'original_price' in update_data and update_data['original_price'] is not None:
        if 'discount_percent' not in update_data or update_data.get('discount_percent') is None:
            update_data['price'] = update_data['original_price']
    
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.partner_id == partner.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

# Promotions
@router.get("/promotions", response_model=List[PromotionResponse])
def get_promotions(partner: Partner = Depends(get_partner_profile), db: Session = Depends(get_db)):
    return db.query(Promotion).filter(Promotion.partner_id == partner.id).all()

@router.post("/promotions", response_model=PromotionResponse)
def create_promotion(
    promotion_data: PromotionCreate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    db_promotion = Promotion(
        partner_id=partner.id,
        title=promotion_data.title,
        description=promotion_data.description,
        image_url=promotion_data.image_url,
        discount_percent=promotion_data.discount_percent,
        is_active=promotion_data.is_active,
        expires_at=promotion_data.expires_at
    )
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    return db_promotion

@router.put("/promotions/{promotion_id}", response_model=PromotionResponse)
def update_promotion(
    promotion_id: int,
    promotion_data: PromotionUpdate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    promotion = db.query(Promotion).filter(Promotion.id == promotion_id, Promotion.partner_id == partner.id).first()
    if not promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    for key, value in promotion_data.dict(exclude_unset=True).items():
        setattr(promotion, key, value)
    db.commit()
    db.refresh(promotion)
    return promotion

@router.delete("/promotions/{promotion_id}")
def delete_promotion(
    promotion_id: int,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    promotion = db.query(Promotion).filter(Promotion.id == promotion_id, Promotion.partner_id == partner.id).first()
    if not promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    db.delete(promotion)
    db.commit()
    return {"message": "Promotion deleted successfully"}

# Statistics
@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics(partner: Partner = Depends(get_partner_profile), db: Session = Depends(get_db)):
    total_orders = db.query(Order).filter(Order.partner_id == partner.id).count()
    completed_orders = db.query(Order).filter(
        Order.partner_id == partner.id,
        Order.status == OrderStatus.COMPLETED
    ).count()
    total_revenue = db.query(Order).filter(
        Order.partner_id == partner.id,
        Order.status == OrderStatus.COMPLETED
    ).with_entities(func.sum(Order.total_amount)).scalar() or 0.0
    active_promotions = db.query(Promotion).filter(
        Promotion.partner_id == partner.id,
        Promotion.is_active == True
    ).count()
    total_products = db.query(Product).filter(Product.partner_id == partner.id).count()
    
    return StatisticsResponse(
        total_orders=total_orders,
        completed_orders=completed_orders,
        total_revenue=total_revenue,
        active_promotions=active_promotions,
        total_products=total_products
    )

# Partner Images
@router.get("/images", response_model=List[PartnerImageResponse])
def get_partner_images(partner: Partner = Depends(get_partner_profile), db: Session = Depends(get_db)):
    return db.query(PartnerImage).filter(PartnerImage.partner_id == partner.id).order_by(PartnerImage.created_at.desc()).all()

@router.post("/images", response_model=PartnerImageResponse)
async def upload_partner_image(
    image_data: PartnerImageCreate,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    db_image = PartnerImage(
        partner_id=partner.id,
        image_url=image_data.image_url
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/images/{image_id}")
def delete_partner_image(
    image_id: int,
    partner: Partner = Depends(get_partner_profile),
    db: Session = Depends(get_db)
):
    image = db.query(PartnerImage).filter(PartnerImage.id == image_id, PartnerImage.partner_id == partner.id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}

