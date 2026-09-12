from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Item, Category
from schemas import ItemCreate, ItemUpdate, Item as ItemSchema
from auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ItemSchema)
def create_item(item: ItemCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_item = db.query(Item).filter(Item.sku == item.sku).first()
    if db_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )
    
    # Extract category_ids and remove from item data
    category_ids = item.category_ids or []
    item_data = item.dict(exclude={'category_ids'})
    
    db_item = Item(**item_data)
    
    # Add categories
    if category_ids:
        categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
        db_item.categories = categories
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[ItemSchema])
def read_items(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    item_type: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(Item)
    
    if search:
        # SQLite doesn't support ilike, so we use like (case-sensitive in SQLite)
        query = query.filter(Item.name.like(f'%{search}%'))
    
    if category_id:
        query = query.join(Item.categories).filter(Category.id == category_id)
    
    if item_type:
        query = query.filter(Item.item_type == item_type)
    
    items = query.offset(skip).limit(limit).all()
    return items

@router.get("/{item_id}", response_model=ItemSchema)
def read_item(item_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.put("/{item_id}", response_model=ItemSchema)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.dict(exclude_unset=True, exclude={'category_ids'})
    
    # Handle category updates
    if 'category_ids' in item.dict(exclude_unset=True):
        category_ids = item.category_ids
        if category_ids is not None:
            categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
            db_item.categories = categories
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}
