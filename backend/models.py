from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# Association table for many-to-many relationship between items and categories
item_categories = Table(
    'item_categories',
    Base.metadata,
    Column('item_id', Integer, ForeignKey('items.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("Item", secondary=item_categories, back_populates="categories")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    item_code = Column(String(50), unique=True, index=True, nullable=True)
    item_type = Column(String(20), default="product")  # 'product' or 'service'
    unit = Column(String(20), nullable=True)  # Pcs, Box, Kg, Sheet, etc.
    
    # Pricing
    sale_price = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=True)
    tax_percentage = Column(Float, default=0.0)
    
    # Stock
    stock_quantity = Column(Integer, default=0)
    opening_stock = Column(Integer, default=0)
    low_stock_alert = Column(Integer, default=10)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sale_items = relationship("SaleItem", back_populates="item")
    categories = relationship("Category", secondary=item_categories, back_populates="items")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=True)
    customer_email = Column(String(100), nullable=True)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    sale_items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    
    sale = relationship("Sale", back_populates="sale_items")
    item = relationship("Item", back_populates="sale_items")
