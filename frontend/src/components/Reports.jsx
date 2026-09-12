import { useState, useEffect } from 'react';
import api from '../api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null;
}

function Reports() {
  const [period, setPeriod] = useState('today');
  const [reportType, setReportType] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesSummary, setSalesSummary] = useState(null);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [itemWiseReport, setItemWiseReport] = useState([]);
  const [categoryWiseReport, setCategoryWiseReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportType === 0) {
      fetchOverviewReports();
    } else if (reportType === 1) {
      fetchItemWiseReport();
    } else if (reportType === 2) {
      fetchCategoryWiseReport();
    }
  }, [period, reportType, startDate, endDate]);

  const fetchOverviewReports = async () => {
    setLoading(true);
    try {
      const [salesRes, inventoryRes, categoryRes, dailyRes] = await Promise.all([
        api.get(`/reports/sales/summary?period=${period}`),
        api.get('/reports/inventory/status'),
        api.get('/reports/sales/by-category'),
        api.get('/reports/sales/daily?days=30'),
      ]);

      setSalesSummary(salesRes.data);
      setInventoryStatus(inventoryRes.data);
      setSalesByCategory(categoryRes.data);
      setDailySales(dailyRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemWiseReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/reports/item-wise?${params.toString()}`);
      setItemWiseReport(response.data);
    } catch (error) {
      console.error('Error fetching item wise report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryWiseReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/reports/category-wise?${params.toString()}`);
      setCategoryWiseReport(response.data);
    } catch (error) {
      console.error('Error fetching category wise report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async (type) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/reports/${type}/csv?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Reports
          </Typography>
        </Box>
        <MuiTooltip title="Refresh Reports">
          <IconButton onClick={() => {
            if (reportType === 0) fetchOverviewReports();
            else if (reportType === 1) fetchItemWiseReport();
            else fetchCategoryWiseReport();
          }}>
            <RefreshIcon />
          </IconButton>
        </MuiTooltip>
      </Box>

      {/* Report Type Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={reportType} onChange={(e, v) => setReportType(v)}>
          <Tab label="Overview" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Item Wise" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="Category Wise" icon={<CategoryIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Overview Report */}
      <TabPanel value={reportType} index={0}>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Period</InputLabel>
            <Select
              label="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Sales Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon sx={{ mr: 1, fontSize: 32 }} />
                  <Typography variant="h6">Total Sales</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  ₹{salesSummary?.total_sales?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ReceiptIcon sx={{ mr: 1, fontSize: 32 }} />
                  <Typography variant="h6">Total Invoices</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {salesSummary?.total_invoices || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, fontSize: 32 }} />
                  <Typography variant="h6">Average Sale Value</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  ₹{salesSummary?.average_sale_value?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Inventory Status */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Inventory Status
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ backgroundColor: '#f5f5f5' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total Items</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {inventoryStatus?.total_items || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ backgroundColor: '#f5f5f5' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total Stock</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {inventoryStatus?.total_stock || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Category Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(inventoryStatus?.category_breakdown || {}).map(([category, data]) => (
                    <Grid item xs={6} sm={3} key={category}>
                      <Card sx={{ backgroundColor: '#e3f2fd' }}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight="bold">{category}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {data.count} items
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Stock: {data.total_stock}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total_sales" fill="#3f51b5" name="Sales (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Daily Sales Trend (30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailySales}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3f51b5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total_sales" stroke="#3f51b5" fillOpacity={1} fill="url(#colorSales)" name="Sales (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Low Stock Items */}
          {inventoryStatus?.low_stock_items?.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    Low Stock Items
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Categories</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Alert Level</TableCell>
                        <TableCell>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryStatus.low_stock_items.map((item) => (
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
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.categories && item.categories.length > 0 ? (
                                item.categories.map(cat => (
                                  <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">N/A</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={item.stock_quantity} color="error" size="small" />
                          </TableCell>
                          <TableCell>{item.low_stock_alert}</TableCell>
                          <TableCell>₹{item.sale_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}

          {/* Sales by Category Table */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales by Category Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Total Quantity</TableCell>
                      <TableCell>Total Sales</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesByCategory.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{item.category}</TableCell>
                        <TableCell>{item.total_quantity}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ₹{item.total_sales.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Item Wise Report */}
      <TabPanel value={reportType} index={1}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportCSV('item-wise')}
            >
              Export CSV
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Item Wise Report
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Sale Price</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Quantity Sold</TableCell>
                  <TableCell>Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemWiseReport.map((item) => (
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
                    <TableCell>{item.current_stock}</TableCell>
                    <TableCell>{item.quantity_sold}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ₹{item.revenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Category Wise Report */}
      <TabPanel value={reportType} index={2}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportCSV('category-wise')}
            >
              Export CSV
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Category Wise Report
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Total Quantity</TableCell>
                      <TableCell>Total Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryWiseReport.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{category.name}</TableCell>
                        <TableCell>{category.total_quantity}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ₹{category.total_revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryWiseReport}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_revenue"
                  >
                    {categoryWiseReport.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}

export default Reports;
