import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Inventory" in response.json()["message"]

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200

def test_cors_headers():
    """Test CORS headers are present"""
    response = client.get("/")
    assert "access-control-allow-origin" in response.headers

@pytest.mark.unit
def test_api_structure():
    """Test basic API structure"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
