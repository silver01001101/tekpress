// Prodigi Print API Integration
import { PRODIGI_API_URL, PRODIGI_API_KEY } from './config.js';

class ProdigiClient {
  constructor() {
    this.apiUrl = PRODIGI_API_URL;
    this.apiKey = PRODIGI_API_KEY;
  }

  async fetch(endpoint, options = {}) {
    const headers = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers
    });

    return response.json();
  }

  // Get available products
  async getProducts() {
    return this.fetch('/products');
  }

  // Get product details
  async getProduct(sku) {
    return this.fetch(`/products/${sku}`);
  }

  // Create a print order
  async createOrder(orderData) {
    /*
    Example orderData:
    {
      shippingMethod: "Standard",
      recipient: {
        name: "John Doe",
        address: {
          line1: "123 Main St",
          line2: "",
          postalOrZipCode: "12345",
          countryCode: "US",
          townOrCity: "New York",
          stateOrCounty: "NY"
        }
      },
      items: [
        {
          sku: "GLOBAL-HPR-8X10",
          copies: 1,
          sizing: "fillPrintArea",
          assets: [
            {
              printArea: "default",
              url: "https://example.com/image.jpg"
            }
          ]
        }
      ]
    }
    */
    return this.fetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  // Get order status
  async getOrder(orderId) {
    return this.fetch(`/orders/${orderId}`);
  }

  // Get order quote (estimate pricing)
  async getQuote(quoteData) {
    return this.fetch('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    });
  }

  // Cancel an order
  async cancelOrder(orderId) {
    return this.fetch(`/orders/${orderId}/actions/cancel`, {
      method: 'POST'
    });
  }

  // Map internal product types to Prodigi SKUs
  getProductSku(productType, size) {
    const skuMap = {
      'poster': {
        '8x10': 'GLOBAL-HPR-8X10',
        '11x14': 'GLOBAL-HPR-11X14',
        '16x20': 'GLOBAL-HPR-16X20',
        '24x36': 'GLOBAL-HPR-24X36'
      },
      'canvas': {
        '8x10': 'GLOBAL-CAN-8X10',
        '11x14': 'GLOBAL-CAN-11X14',
        '16x20': 'GLOBAL-CAN-16X20',
        '24x36': 'GLOBAL-CAN-24X36'
      },
      'framed': {
        '8x10': 'GLOBAL-FRP-8X10',
        '11x14': 'GLOBAL-FRP-11X14',
        '16x20': 'GLOBAL-FRP-16X20',
        '24x36': 'GLOBAL-FRP-24X36'
      },
      'metal': {
        '8x10': 'GLOBAL-MET-8X10',
        '11x14': 'GLOBAL-MET-11X14',
        '16x20': 'GLOBAL-MET-16X20',
        '24x36': 'GLOBAL-MET-24X36'
      }
    };

    return skuMap[productType]?.[size] || 'GLOBAL-HPR-8X10';
  }
}

export const prodigi = new ProdigiClient();
