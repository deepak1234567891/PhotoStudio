from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Sale, SaleItem, Item
from schemas import SaleCreate, Sale as SaleSchema
from auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=SaleSchema)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Check if invoice number already exists
    db_sale = db.query(Sale).filter(Sale.invoice_number == sale.invoice_number).first()
    if db_sale:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice number already exists"
        )
    
    # Validate items and calculate total
    total_amount = 0
    for sale_item in sale.sale_items:
        item = db.query(Item).filter(Item.id == sale_item.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {sale_item.item_id} not found"
            )
        if item.stock_quantity < sale_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for item {item.name}"
            )
        # Use the sale_price from the item
        total_amount += sale_item.quantity * item.sale_price
    
    # Create sale
    db_sale = Sale(
        invoice_number=sale.invoice_number,
        customer_name=sale.customer_name,
        customer_email=sale.customer_email,
        total_amount=total_amount,
        payment_method=sale.payment_method,
        notes=sale.notes,
        created_by=current_user.id if current_user else None
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    
    # Create sale items and update stock
    for sale_item in sale.sale_items:
        item = db.query(Item).filter(Item.id == sale_item.item_id).first()
        unit_price = item.sale_price
        subtotal = sale_item.quantity * unit_price
        
        db_sale_item = SaleItem(
            sale_id=db_sale.id,
            item_id=sale_item.item_id,
            quantity=sale_item.quantity,
            unit_price=unit_price,
            subtotal=subtotal
        )
        db.add(db_sale_item)
        
        # Update item stock
        item.stock_quantity -= sale_item.quantity
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/", response_model=List[SaleSchema])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    sales = db.query(Sale).order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()
    return sales

@router.get("/{sale_id}", response_model=SaleSchema)
def read_sale(sale_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale

@router.get("/invoice/{invoice_number}", response_model=SaleSchema)
def read_sale_by_invoice(invoice_number: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_sale = db.query(Sale).filter(Sale.invoice_number == invoice_number).first()
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale
