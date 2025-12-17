from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserType, OrderStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    user_type: UserType

class UserResponse(UserBase):
    id: int
    user_type: UserType
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Partner Schemas
class PartnerBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None

class PartnerCreate(PartnerBase):
    pass

class PartnerResponse(PartnerBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

# Partner Image Schemas
class PartnerImageResponse(BaseModel):
    id: int
    partner_id: int
    image_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PartnerImageCreate(BaseModel):
    image_url: str

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_available: bool = True

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    partner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None

# Promotion Schemas
class PromotionBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percent: Optional[float] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None

class PromotionCreate(PromotionBase):
    pass

class PromotionResponse(PromotionBase):
    id: int
    partner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percent: Optional[float] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductResponse
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    partner_id: int
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    partner_id: int
    status: OrderStatus
    total_amount: float
    qr_code: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse]
    partner: PartnerResponse
    
    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Statistics Schema
class StatisticsResponse(BaseModel):
    total_orders: int
    completed_orders: int
    total_revenue: float
    active_promotions: int
    total_products: int

