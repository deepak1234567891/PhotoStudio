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
  Chip,
  CircularProgress,
  Avatar,
  Stack,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3f51b5', '#2e7d32', '#f57c00', '#d32f2f', '#7b1fa2'];

function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, categoryRes, dailyRes, invoicesRes, itemsRes] = await Promise.all([
        api.get('/reports/dashboard/stats').catch(err => ({ data: null, error: err })),
        api.get('/reports/sales/by-category').catch(err => ({ data: [], error: err })),
        api.get('/reports/sales/daily?days=30').catch(err => ({ data: [], error: err })),
        api.get('/reports/dashboard/recent-invoices').catch(err => ({ data: [], error: err })),
        api.get('/reports/dashboard/top-items').catch(err => ({ data: [], error: err })),
      ]);

      setDashboardStats(statsRes.data);
      setSalesByCategory(categoryRes.data || []);
      setDailySales(dailyRes.data || []);
      setRecentInvoices(invoicesRes.data || []);
      setTopItems(itemsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardStats({
        today_sales: 0,
        month_sales: 0,
        total_items: 0,
        low_stock_count: 0
      });
      setSalesByCategory([]);
      setDailySales([]);
      setRecentInvoices([]);
      setTopItems([]);
    } finally {
      setLoading(false);
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
          <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Dashboard
          </Typography>
        </Box>
        <MuiTooltip title="Refresh Dashboard">
          <IconButton onClick={fetchDashboardData}>
            <RefreshIcon />
          </IconButton>
        </MuiTooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            height: '100%',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out',
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Today's Sales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{dashboardStats?.today_sales?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
            color: 'white',
            height: '100%',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out',
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    This Month's Sales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{dashboardStats?.month_sales?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <TrendingUpIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)',
            color: 'white',
            height: '100%',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out',
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Items
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats?.total_items || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <InventoryIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
            color: 'white',
            height: '100%',
            '&:hover': {
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease-in-out',
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats?.low_stock_count || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <WarningIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Sales Over Last 30 Days
              </Typography>
            </Box>
            {dailySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total_sales" fill="#1976d2" name="Sales (₹)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'text.secondary' }}>
                <Stack alignItems="center" spacing={2}>
                  <AssessmentIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="body1">No sales data available</Typography>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Sales by Category
              </Typography>
            </Box>
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_sales"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'text.secondary' }}>
                <Stack alignItems="center" spacing={2}>
                  <CategoryIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="body1">No category data available</Typography>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Recent Invoices
              </Typography>
            </Box>
            {recentInvoices.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>{invoice.customer_name}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ₹{invoice.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={invoice.status} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8, color: 'text.secondary' }}>
                <Stack alignItems="center" spacing={2}>
                  <ReceiptIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="body1">No invoices yet</Typography>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Top 5 Selling Items
              </Typography>
            </Box>
            {topItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Total Sold</TableCell>
                      <TableCell>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topItems.map((item, index) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, backgroundColor: COLORS[index % COLORS.length], fontSize: 12 }}>
                              {index + 1}
                            </Avatar>
                            {item.name}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{item.sku}</TableCell>
                        <TableCell>
                          <Chip label={item.total_sold} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ₹{item.total_revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8, color: 'text.secondary' }}>
                <Stack alignItems="center" spacing={2}>
                  <InventoryIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                  <Typography variant="body1">No sales data yet</Typography>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
