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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Stack,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Note as NoteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

function SaleInvoice() {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    payment_method: '',
    notes: '',
  });
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItems();
    generateInvoiceNumber();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items/');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const invoiceNum = `INV-${timestamp.toString().slice(-8)}`;
    setFormData({ ...formData, invoice_number: invoiceNum });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddToCart = () => {
    if (!selectedItem) {
      setError('Please select an item');
      return;
    }

    const item = items.find((i) => i.id === parseInt(selectedItem));
    if (!item) return;

    if (quantity > item.stock_quantity) {
      setError(`Insufficient stock. Only ${item.stock_quantity} available.`);
      return;
    }

    const existingItem = cart.find((c) => c.item_id === item.id);
    if (existingItem) {
      if (existingItem.quantity + quantity > item.stock_quantity) {
        setError(`Insufficient stock. Only ${item.stock_quantity} available.`);
        return;
      }
      setCart(
        cart.map((c) =>
          c.item_id === item.id
            ? {
                ...c,
                quantity: c.quantity + quantity,
                subtotal: (c.quantity + quantity) * c.unit_price,
              }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          item_id: item.id,
          name: item.name,
          quantity: quantity,
          unit_price: item.sale_price,
          subtotal: quantity * item.sale_price,
        },
      ]);
    }

    setSelectedItem('');
    setQuantity(1);
    setError('');
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((c) => c.item_id !== itemId));
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const item = items.find((i) => i.id === itemId);
    if (newQuantity > item.stock_quantity) {
      setError(`Insufficient stock. Only ${item.stock_quantity} available.`);
      return;
    }
    setCart(
      cart.map((c) =>
        c.item_id === itemId
          ? { ...c, quantity: newQuantity, subtotal: newQuantity * c.unit_price }
          : c
      )
    );
    setError('');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cart.length === 0) {
      setError('Please add at least one item to the invoice');
      return;
    }

    try {
      const saleData = {
        ...formData,
        total_amount: calculateTotal(),
        sale_items: cart.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
      };

      await api.post('/sales/', saleData);
      setSuccess('Invoice created successfully!');

      // Reset form
      setFormData({
        invoice_number: '',
        customer_name: '',
        customer_email: '',
        payment_method: '',
        notes: '',
      });
      setCart([]);
      generateInvoiceNumber();
      fetchItems();
    } catch (error) {
      setError(error.response?.data?.detail || 'Error creating invoice');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ReceiptIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Sale Invoice
        </Typography>
      </Box>

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
        {/* Left Column - Invoice Details & Add Items */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Invoice Details Card */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Invoice Details
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  {/* Invoice Number */}
                  <TextField
                    fullWidth
                    label="Invoice Number *"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (
                        <Tooltip title="Auto-generate Invoice Number">
                          <IconButton onClick={generateInvoiceNumber} size="small" sx={{ mr: 0.5 }}>
                            <AutoAwesomeIcon />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />

                  {/* Customer Name */}
                  <TextField
                    fullWidth
                    label="Customer Name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  {/* Customer Email */}
                  <TextField
                    fullWidth
                    label="Customer Email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  {/* Payment Method */}
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      label="Payment Method"
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleChange}
                      startAdornment={<PaymentIcon />}
                    >
                      <MenuItem value="">Select payment method</MenuItem>
                      <MenuItem value="cash">💵 Cash</MenuItem>
                      <MenuItem value="card">💳 Card</MenuItem>
                      <MenuItem value="bank_transfer">🏦 Bank Transfer</MenuItem>
                      <MenuItem value="check">✅ Check</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Notes */}
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: <NoteIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Stack>
              </form>
            </Paper>

            {/* Add Items to Cart Card */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Add Items to Cart
                </Typography>
              </Box>

              <Stack spacing={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Select Item</InputLabel>
                  <Select
                    label="Select Item"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    {items.map((item) => (
                      <MenuItem 
                        key={item.id} 
                        value={item.id}
                        disabled={item.stock_quantity === 0}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{item.sale_price.toFixed(2)} (Stock: {item.stock_quantity})
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddToCart}
                  startIcon={<AddIcon />}
                  size="large"
                >
                  Add to Cart
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column - Cart & Summary */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Cart Card */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Shopping Cart
                  </Typography>
                </Box>
                <Chip label={`${cart.length} items`} color="primary" variant="outlined" />
              </Box>

              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="body1">Your cart is empty</Typography>
                  <Typography variant="body2">Add items to create an invoice</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.item_id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              ₹{item.unit_price.toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography sx={{ mx: 1, minWidth: 30, textAlign: 'center' }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUpdateQuantity(item.item_id, item.quantity + 1)}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold" color="primary.main">
                                ₹{item.subtotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Remove">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveFromCart(item.item_id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ my: 2 }} />

                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      ₹{calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>

            {/* Action Buttons */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<ReceiptIcon />}
                  size="large"
                  disabled={cart.length === 0}
                >
                  Create Invoice
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCart([]);
                    setFormData({
                      invoice_number: '',
                      customer_name: '',
                      customer_email: '',
                      payment_method: '',
                      notes: '',
                    });
                    generateInvoiceNumber();
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Clear
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SaleInvoice;
