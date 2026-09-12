# Inventory & Billing System

A full-stack inventory and billing web application with three core modules — Add Item, Sale Invoice, and Reports — plus a clean, modern Dashboard as the landing page.

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Recharts (for dashboard charts)

### Backend
- FastAPI (Python)
- Pydantic v2
- SQLAlchemy ORM
- JWT Authentication

### Database
- SQLite (file-based database, no server required)

## Features

- **Dashboard**: Real-time overview with sales charts, inventory status, and low stock alerts
- **Add Item**: Create, read, update, and delete inventory items with SKU tracking
- **Sale Invoice**: Create invoices with multiple items, automatic stock updates, and customer management
- **Reports**: Comprehensive sales reports, inventory status, and category breakdowns
- **Authentication**: JWT-based login system

## Project Structure

```
PhotoStudio/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database configuration
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── auth.py                 # Authentication utilities
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── items.py            # Item CRUD endpoints
│   │   ├── sales.py            # Sales and invoice endpoints
│   │   └── reports.py          # Reports endpoints
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx       # Login component
    │   │   ├── Layout.jsx      # Navigation layout
    │   │   ├── Dashboard.jsx   # Dashboard with charts
    │   │   ├── AddItem.jsx     # Item management
    │   │   ├── SaleInvoice.jsx # Invoice creation
    │   │   └── Reports.jsx     # Reports and analytics
    │   ├── App.jsx             # Main app with routing
    │   ├── api.js              # Axios configuration
    │   └── index.css           # Tailwind imports
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- pip (Python package manager)
- npm (Node package manager)

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create environment file:
```bash
copy .env.example .env
```

6. Edit `.env` file (only need to change SECRET_KEY):
```env
SECRET_KEY=your-secret-key-change-in-production
```

7. Initialize the database (creates SQLite database and default admin user):
```bash
python init_db.py
```

This will create the SQLite database file (`inventory.db`) and a default admin user with:
- Username: `admin`
- Password: `admin123`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

Note: The project uses Tailwind CSS v4 with the new `@tailwindcss/postcss` plugin. The PostCSS configuration is already set up correctly.

### 4. Running the Application

1. Start the backend server:
```bash
cd backend
# Activate virtual environment if not already active
python main.py
```
The backend will run on `http://localhost:8000`

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

## Default Credentials

- **Username**: admin
- **Password**: admin123

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage

### 1. Login
- Use the default credentials or register a new user
- The JWT token is stored in localStorage for authentication

### 2. Dashboard
- View real-time sales summary
- Check inventory status
- Monitor low stock items
- View sales by category and daily sales trends

### 3. Add Item
- Create new inventory items with SKU, price, and stock quantity
- Edit existing items
- Delete items
- Track stock levels

### 4. Sale Invoice
- Create invoices with multiple items
- Automatic stock updates
- Customer information tracking
- Multiple payment methods

### 5. Reports
- View sales summaries by period (today, week, month)
- Inventory status and category breakdowns
- Sales trends and analytics
- Export-ready data views

## Development

### Backend Development
- FastAPI auto-reloads on file changes
- Use the interactive docs at `/docs` for API testing
- Database models are in `models.py`
- API endpoints are in the `routers/` directory

### Frontend Development
- Vite provides hot module replacement
- Components are in `src/components/`
- API calls are centralized in `src/api.js`
- Tailwind CSS for styling

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check credentials in `.env` file
- Verify the database exists

### CORS Errors
- The backend is configured to allow requests from `http://localhost:5173`
- If using a different port, update the CORS configuration in `main.py`

### Import Errors
- Ensure all dependencies are installed
- Check that the virtual environment is activated

## Security Notes

- Change the `SECRET_KEY` in production
- Use strong passwords for database and user accounts
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Regular database backups are recommended

## License

This project is provided as-is for educational and development purposes.
