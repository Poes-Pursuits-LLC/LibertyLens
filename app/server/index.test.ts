import { describe, it, expect } from 'vitest';
import { app } from './index';

describe('Server', () => {
  describe('Root endpoint', () => {
    it('returns API information', async () => {
      const res = await app.request('/');
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json).toHaveProperty('message', 'Liberty Lens API Server');
      expect(json).toHaveProperty('version');
      expect(json).toHaveProperty('endpoints');
    });
  });
  
  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await app.request('/unknown-route');
      const json = await res.json();
      
      expect(res.status).toBe(404);
      expect(json).toHaveProperty('error', 'Not Found');
    });
  });
  
  describe('API Routes', () => {
    it('GET /api/items returns item list', async () => {
      const res = await app.request('/api/items');
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json).toHaveProperty('data');
      expect(json).toHaveProperty('total');
      expect(Array.isArray(json.data)).toBe(true);
    });
    
    it('GET /api/items/:id returns single item', async () => {
      const res = await app.request('/api/items/123');
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json).toHaveProperty('data');
      expect(json.data).toHaveProperty('id', 123);
    });
    
    it('POST /api/items validates input', async () => {
      const res = await app.request('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }),
      });
      
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toHaveProperty('error', 'Validation Error');
    });
    
    it('POST /api/items creates item with valid data', async () => {
      const res = await app.request('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: 'Test Item',
          description: 'Test Description'
        }),
      });
      
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toHaveProperty('message', 'Item created successfully');
      expect(json.data).toHaveProperty('name', 'Test Item');
    });
  });
});
