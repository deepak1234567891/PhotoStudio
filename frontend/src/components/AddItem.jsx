import { useState, useEffect } from 'react';
import api from '../api';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AutoAwesome as AutoAwesomeIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

function AddItem() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    item_code: '',
    item_type: 'product',
    unit: '',
    sale_price: '',
    purchase_price: '',
    tax_percentage: '0',
    stock_quantity: '0',
    opening_stock: '0',
    low_stock_alert: '10',
    category_ids: [],
  });
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const units = ['Pcs', 'Box', 'Kg', 'Sheet', 'Meter', 'Liter', 'Hour', 'Day', 'Set', 'Pair'];

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category_id', filterCategory);
      if (filterType) params.append('item_type', filterType);
      
      const response = await api.get(`/items/?${params.toString()}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateItemCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const code = `ITEM-${timestamp}`;
    setFormData({ ...formData, item_code: code });
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-8);
    const sku = `SKU-${timestamp}`;
    setFormData({ ...formData, sku: sku });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryToggle = (categoryId) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newSelected);
    setFormData({ ...formData, category_ids: newSelected });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await api.post('/categories/', { name: newCategoryName });
      setSuccess('Category created successfully!');
      setNewCategoryName('');
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.detail || 'Error creating category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = {
        ...formData,
        sale_price: parseFloat(formData.sale_price),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        tax_percentage: parseFloat(formData.tax_percentage),
        stock_quantity: parseInt(formData.stock_quantity),
        opening_stock: parseInt(formData.opening_stock),
        low_stock_alert: parseInt(formData.low_stock_alert),
        category_ids: selectedCategories,
      };

      if (editingItem) {
        await api.put(`/items/${editingItem.id}`, data);
        setSuccess('Item updated successfully!');
      } else {
        await api.post('/items/', data);
        setSuccess('Item added successfully!');
      }

      resetForm();
      fetchItems();
    } catch (error) {
      setError(error.response?.data?.detail || 'Error saving item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      item_code: '',
      item_type: 'product',
      unit: '',
      sale_price: '',
      purchase_price: '',
      tax_percentage: '0',
      stock_quantity: '0',
      opening_stock: '0',
      low_stock_alert: '10',
      category_ids: [],
    });
    setSelectedCategories([]);
    setEditingItem(null);
    setActiveTab(0);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      sku: item.sku,
      item_code: item.item_code || '',
      item_type: item.item_type,
      unit: item.unit || '',
      sale_price: item.sale_price.toString(),
      purchase_price: item.purchase_price ? item.purchase_price.toString() : '',
      tax_percentage: item.tax_percentage.toString(),
      stock_quantity: item.stock_quantity.toString(),
      opening_stock: item.opening_stock.toString(),
      low_stock_alert: item.low_stock_alert.toString(),
      category_ids: item.categories?.map(c => c.id) || [],
    });
    setSelectedCategories(item.categories?.map(c => c.id) || []);
    setActiveTab(0);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${itemId}`);
        setSuccess('Item deleted successfully!');
        fetchItems();
      } catch (error) {
        setError('Error deleting item');
      }
    }
  };

  const handleSearch = () => {
    fetchItems();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterType('');
    fetchItems();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        {editingItem ? 'Edit Item' : 'Add Item'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Item Details
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {/* Item Type */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Item Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant={formData.item_type === 'product' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, item_type: 'product' })}
                      startIcon={<InventoryIcon />}
                      sx={{ flex: 1 }}
                    >
                      Product
                    </Button>
                    <Button
                      variant={formData.item_type === 'service' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, item_type: 'service' })}
                      startIcon={<AutoAwesomeIcon />}
                      sx={{ flex: 1 }}
                    >
                      Service
                    </Button>
                  </Box>
                </Box>

                <Divider />

                {/* Item Name */}
                <TextField
                  fullWidth
                  label="Item Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />

                {/* Description */}
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={2}
                />

                {/* SKU and Item Code */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SKU"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Auto-generate SKU">
                            <IconButton onClick={generateSKU} size="small">
                              <AutoAwesomeIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Item Code"
                      name="item_code"
                      value={formData.item_code}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Auto-generate Item Code">
                            <IconButton onClick={generateItemCode} size="small">
                              <AutoAwesomeIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Unit */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Unit</InputLabel>
                  <Select
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Categories */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Categories
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setShowCategoryModal(true)}
                      variant="text"
                    >
                      Add Category
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {categories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        onClick={() => handleCategoryToggle(category.id)}
                        color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
                        variant={selectedCategories.includes(category.id) ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* Tabs for Pricing and Stock */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Pricing" icon={<MoneyIcon />} iconPosition="start" />
                    <Tab label="Stock" icon={<ShippingIcon />} iconPosition="start" />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Sale Price *"
                      name="sale_price"
                      type="number"
                      value={formData.sale_price}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Purchase Price"
                      name="purchase_price"
                      type="number"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Tax Percentage (%)"
                      name="tax_percentage"
                      type="number"
                      value={formData.tax_percentage}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                      }}
                    />
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      name="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Opening Stock"
                      name="opening_stock"
                      type="number"
                      value={formData.opening_stock}
                      onChange={handleChange}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Low Stock Alert"
                      name="low_stock_alert"
                      type="number"
                      value={formData.low_stock_alert}
                      onChange={handleChange}
                      variant="outlined"
                      helperText="Alert when stock falls below this level"
                    />
                  </Stack>
                </TabPanel>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ flex: 1 }}
                  >
                    {editingItem ? 'Update' : 'Add Item'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    startIcon={<CancelIcon />}
                  >
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        </Grid>

        {/* Items List Section */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Items List ({items.length})
                </Typography>
              </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleSearch} size="small">
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="product">Product</MenuItem>
                      <MenuItem value="service">Service</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Items Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Categories</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{item.sku}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.item_type}
                          size="small"
                          color={item.item_type === 'product' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>₹{item.sale_price.toFixed(2)}</TableCell>
                      <TableCell>{item.stock_quantity}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {item.categories?.map((cat) => (
                            <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {items.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body1">No items found</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategoryModal(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AddItem;
