from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Partner, Product, Promotion, Order, OrderItem, OrderStatus, UserType, PartnerImage, PartnerImage
from schemas import (
    PartnerResponse, ProductResponse, PromotionResponse,
    OrderCreate, OrderResponse, OrderUpdate
)
from auth import get_current_user
from routers.websocket import manager
import uuid

router = APIRouter(prefix="/api/customer", tags=["customer"])

@router.get("/partners", response_model=List[PartnerResponse])
def get_partners(db: Session = Depends(get_db)):
    return db.query(Partner).all()

@router.get("/partners/{partner_id}", response_model=PartnerResponse)
def get_partner(partner_id: int, db: Session = Depends(get_db)):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner

@router.get("/products", response_model=List[ProductResponse])
def get_products(partner_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.is_available == True)
    if partner_id:
        query = query.filter(Product.partner_id == partner_id)
    return query.all()

@router.get("/promotions", response_model=List[PromotionResponse])
def get_promotions(partner_id: int = None, db: Session = Depends(get_db)):
    from datetime import datetime
    query = db.query(Promotion).filter(Promotion.is_active == True)
    if partner_id:
        query = query.filter(Promotion.partner_id == partner_id)
    # Filter expired promotions
    promotions = query.all()
    return [p for p in promotions if not p.expires_at or p.expires_at > datetime.utcnow()]

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != UserType.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can create orders")
    
    # Verify partner exists
    partner = db.query(Partner).filter(Partner.id == order_data.partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Calculate total and verify products
    total_amount = 0
    order_items = []
    for item_data in order_data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        if product.partner_id != order_data.partner_id:
            raise HTTPException(status_code=400, detail="Product does not belong to this partner")
        if not product.is_available:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")
        
        total_amount += item_data.price * item_data.quantity
        order_items.append(OrderItem(
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            price=item_data.price
        ))
    
    # Create order
    qr_code = str(uuid.uuid4())
    db_order = Order(
        customer_id=current_user.id,
        partner_id=order_data.partner_id,
        status=OrderStatus.IN_QUEUE,
        total_amount=total_amount,
        qr_code=qr_code
    )
    db.add(db_order)
    db.flush()
    
    # Add order items
    for item in order_items:
        item.order_id = db_order.id
        db.add(item)
    
    db.commit()
    db.refresh(db_order)
    
    # Notify partner via WebSocket
    order_data_dict = {
        "id": db_order.id,
        "status": db_order.status.value,
        "customer_id": db_order.customer_id,
        "partner_id": db_order.partner_id,
        "total_amount": db_order.total_amount,
        "updated_at": db_order.updated_at.isoformat() if db_order.updated_at else None
    }
    await manager.broadcast_order_update(order_data_dict, current_user.id, partner.user_id)
    
    return db_order

@router.get("/orders", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != UserType.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can view orders")
    
    orders = db.query(Order).filter(Order.customer_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order

