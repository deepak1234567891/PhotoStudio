import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';

function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);
      
      const response = await api.post('/auth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setSuccess('Login successful! Redirecting...');
        setIsAuthenticated(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || 'Authentication failed');
      } else if (err.request) {
        setError('Cannot connect to server. Please check if backend is running on http://localhost:8000');
      } else {
        setError('An error occurred during login: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #4a148c 50%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                mb: 2,
                background: 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)',
              }}
            >
              <StorefrontIcon sx={{ fontSize: 48, color: 'white' }} />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Inventory & Billing System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              placeholder="Enter your username"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              placeholder="Enter your password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #303f9f 0%, #7b1fa2 100%)',
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                  Signing in...
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Alert
              severity="info"
              icon={<StorefrontIcon />}
              sx={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Default Credentials
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Username:</Typography>
                  <Chip label="admin" sx={{ fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: '#bbdefb', color: '#0d47a1' }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Password:</Typography>
                  <Chip label="admin123" sx={{ fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: '#bbdefb', color: '#0d47a1' }} />
                </Grid>
              </Grid>
            </Alert>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
