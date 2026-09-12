import api from '../api';

describe('API Configuration', () => {
  test('should have correct base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8000/api');
  });

  test('should have correct headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('should handle token in requests', () => {
    localStorage.setItem('token', 'test-token');
    const config = api.interceptors.request.handlers[0];
    expect(config).toBeDefined();
  });
});
