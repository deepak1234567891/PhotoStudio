from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from database import get_db
from models import Sale, Item, SaleItem, Category
from schemas import SalesReport, InventoryReport
from auth import get_current_user
from typing import List, Optional
import csv
import io

router = APIRouter()

@router.get("/sales/summary", response_model=SalesReport)
def get_sales_summary(period: str = "today", db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    now = datetime.utcnow()
    
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    sales = db.query(Sale).filter(Sale.created_at >= start_date).all()
    
    total_sales = sum(sale.total_amount for sale in sales)
    total_invoices = len(sales)
    average_sale_value = total_sales / total_invoices if total_invoices > 0 else 0
    
    return SalesReport(
        period=period,
        total_sales=total_sales,
        total_invoices=total_invoices,
        average_sale_value=average_sale_value
    )

@router.get("/inventory/status", response_model=InventoryReport)
def get_inventory_status(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    items = db.query(Item).all()
    total_items = len(items)
    total_stock = sum(item.stock_quantity for item in items)
    
    # Low stock items (using individual item thresholds)
    low_stock_items = [item for item in items if item.stock_quantity < item.low_stock_alert]
    
    # Category breakdown using the new Category model
    category_breakdown = {}
    for item in items:
        for category in item.categories:
            cat_name = category.name
            if cat_name not in category_breakdown:
                category_breakdown[cat_name] = {"count": 0, "total_stock": 0}
            category_breakdown[cat_name]["count"] += 1
            category_breakdown[cat_name]["total_stock"] += item.stock_quantity
    
    # Add uncategorized items
    uncategorized_count = sum(1 for item in items if not item.categories)
    if uncategorized_count > 0:
        category_breakdown["Uncategorized"] = {
            "count": uncategorized_count,
            "total_stock": sum(item.stock_quantity for item in items if not item.categories)
        }
    
    return InventoryReport(
        total_items=total_items,
        total_stock=total_stock,
        low_stock_items=low_stock_items,
        category_breakdown=category_breakdown
    )

@router.get("/sales/by-category")
def get_sales_by_category(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    query = db.query(
        Category.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.subtotal).label('total_sales')
    ).join(Item.categories)\
     .join(SaleItem, Item.id == SaleItem.item_id)\
     .group_by(Category.name)\
     .all()
    
    result = []
    for category, quantity, sales in query:
        result.append({
            "category": category,
            "total_quantity": quantity,
            "total_sales": sales
        })
    
    return result

@router.get("/sales/daily")
def get_daily_sales(days: int = 30, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    query = db.query(
        func.date(Sale.created_at).label('date'),
        func.sum(Sale.total_amount).label('total_sales'),
        func.count(Sale.id).label('total_invoices')
    ).filter(Sale.created_at >= start_date)\
     .group_by(func.date(Sale.created_at))\
     .order_by(func.date(Sale.created_at))\
     .all()
    
    result = []
    for date, sales, invoices in query:
        result.append({
            "date": str(date),
            "total_sales": sales,
            "total_invoices": invoices
        })
    
    return result

@router.get("/item-wise")
def get_item_wise_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(
        Item.id,
        Item.name,
        Item.sku,
        Item.item_type,
        Item.sale_price,
        Item.stock_quantity,
        func.sum(SaleItem.quantity).label('total_sold'),
        func.sum(SaleItem.subtotal).label('total_revenue')
    ).outerjoin(SaleItem, Item.id == SaleItem.item_id)\
     .group_by(Item.id)
    
    if start_date:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at <= end_dt)
    
    results = query.all()
    
    report_data = []
    for item in results:
        report_data.append({
            "id": item.id,
            "name": item.name,
            "sku": item.sku,
            "item_type": item.item_type,
            "sale_price": item.sale_price,
            "current_stock": item.stock_quantity,
            "quantity_sold": item.total_sold or 0,
            "revenue": item.total_revenue or 0
        })
    
    return report_data

@router.get("/category-wise")
def get_category_wise_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Base query for category sales
    query = db.query(
        Category.id,
        Category.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.subtotal).label('total_revenue')
    ).join(Item.categories)\
     .join(SaleItem, Item.id == SaleItem.item_id)\
     .group_by(Category.id, Category.name)
    
    if start_date:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at <= end_dt)
    
    results = query.all()
    
    report_data = []
    for category in results:
        report_data.append({
            "id": category.id,
            "name": category.name,
            "total_quantity": category.total_quantity or 0,
            "total_revenue": category.total_revenue or 0
        })
    
    return report_data

@router.get("/item-wise/csv")
def export_item_wise_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(
        Item.id,
        Item.name,
        Item.sku,
        Item.item_type,
        Item.sale_price,
        Item.stock_quantity,
        func.sum(SaleItem.quantity).label('total_sold'),
        func.sum(SaleItem.subtotal).label('total_revenue')
    ).outerjoin(SaleItem, Item.id == SaleItem.item_id)\
     .group_by(Item.id)
    
    if start_date:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at <= end_dt)
    
    results = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Item Name', 'SKU', 'Type', 'Sale Price', 'Current Stock', 'Quantity Sold', 'Revenue'])
    
    # Write data
    for item in results:
        writer.writerow([
            item.name,
            item.sku,
            item.item_type,
            item.sale_price,
            item.stock_quantity,
            item.total_sold or 0,
            item.total_revenue or 0
        ])
    
    output.seek(0)
    
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=item_wise_report.csv'}
    )
    
    return response

@router.get("/category-wise/csv")
def export_category_wise_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Base query for category sales
    query = db.query(
        Category.id,
        Category.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.subtotal).label('total_revenue')
    ).join(Item.categories)\
     .join(SaleItem, Item.id == SaleItem.item_id)\
     .group_by(Category.id, Category.name)
    
    if start_date:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        query = query.join(Sale, SaleItem.sale_id == Sale.id).filter(Sale.created_at <= end_dt)
    
    results = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Category', 'Total Quantity', 'Total Revenue'])
    
    # Write data
    for category in results:
        writer.writerow([
            category.name,
            category.total_quantity or 0,
            category.total_revenue or 0
        ])
    
    output.seek(0)
    
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=category_wise_report.csv'}
    )
    
    return response

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    now = datetime.utcnow()
    
    # Today's sales
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_sales = db.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= today_start).scalar() or 0
    
    # This month's sales
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_sales = db.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= month_start).scalar() or 0
    
    # Total items
    total_items = db.query(func.count(Item.id)).scalar() or 0
    
    # Low stock items
    low_stock_count = db.query(func.count(Item.id)).filter(Item.stock_quantity < Item.low_stock_alert).scalar() or 0
    
    return {
        "today_sales": today_sales,
        "month_sales": month_sales,
        "total_items": total_items,
        "low_stock_count": low_stock_count
    }

@router.get("/dashboard/recent-invoices")
def get_recent_invoices(limit: int = 5, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    invoices = db.query(Sale).order_by(Sale.created_at.desc()).limit(limit).all()
    
    result = []
    for invoice in invoices:
        result.append({
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "customer_name": invoice.customer_name or "N/A",
            "date": invoice.created_at.strftime('%Y-%m-%d'),
            "total": invoice.total_amount,
            "status": "Completed"  # You might want to add status field to Sale model
        })
    
    return result

@router.get("/dashboard/top-items")
def get_top_selling_items(limit: int = 5, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    query = db.query(
        Item.id,
        Item.name,
        Item.sku,
        func.sum(SaleItem.quantity).label('total_sold'),
        func.sum(SaleItem.subtotal).label('total_revenue')
    ).join(SaleItem, Item.id == SaleItem.item_id)\
     .group_by(Item.id)\
     .order_by(func.sum(SaleItem.quantity).desc())\
     .limit(limit)
    
    results = query.all()
    
    result = []
    for item in results:
        result.append({
            "id": item.id,
            "name": item.name,
            "sku": item.sku,
            "total_sold": item.total_sold or 0,
            "total_revenue": item.total_revenue or 0
        })
    
    return result
