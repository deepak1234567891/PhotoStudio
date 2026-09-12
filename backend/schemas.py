from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Item Schemas
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    item_code: Optional[str] = None
    item_type: str = "product"
    unit: Optional[str] = None
    sale_price: float
    purchase_price: Optional[float] = None
    tax_percentage: float = 0.0
    stock_quantity: int = 0
    opening_stock: int = 0
    low_stock_alert: int = 10
    category_ids: Optional[List[int]] = []

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    item_code: Optional[str] = None
    item_type: Optional[str] = None
    unit: Optional[str] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None
    tax_percentage: Optional[float] = None
    stock_quantity: Optional[int] = None
    opening_stock: Optional[int] = None
    low_stock_alert: Optional[int] = None
    category_ids: Optional[List[int]] = None

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    categories: List[Category] = []
    
    class Config:
        from_attributes = True

# Sale Item Schemas
class SaleItemBase(BaseModel):
    item_id: int
    quantity: int
    unit_price: Optional[float] = None
    subtotal: Optional[float] = None

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    sale_id: int
    
    class Config:
        from_attributes = True

# Sale Schemas
class SaleBase(BaseModel):
    invoice_number: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: float
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    sale_items: List[SaleItemCreate]

class Sale(SaleBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
    sale_items: List[SaleItem] = []
    
    class Config:
        from_attributes = True

# Report Schemas
class SalesReport(BaseModel):
    period: str
    total_sales: float
    total_invoices: int
    average_sale_value: float

class InventoryReport(BaseModel):
    total_items: int
    total_stock: int
    low_stock_items: List[Item]
    category_breakdown: dict
