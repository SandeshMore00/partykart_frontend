import config from '../config';

interface BigShipOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    system_order_id: string;
    courier_id?: string;
    [key: string]: any;
  };
}

interface BigShipManifestResponse {
  success: boolean;
  message?: string;
  data?: {
    master_awb?: string;
    label_available?: boolean;
    [key: string]: any;
  };
}

/**
 * BigShip API service layer
 * Handles order creation and manifest generation with BigShip
 */
class BigShipService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Create BigShip order from existing order
   * @param orderId - The existing order ID from the database
   */
  async createOrder(orderId: number): Promise<BigShipOrderResponse> {
    try {
      const response = await fetch(config.BIGSHIP_CREATE_ORDER, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.detail || 'Failed to create BigShip order',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('BigShip create order error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Generate manifest for BigShip order
   * @param systemOrderId - The system_order_id returned from BigShip order creation
   */
  async manifestOrder(systemOrderId: string): Promise<BigShipManifestResponse> {
    try {
      const response = await fetch(config.BIGSHIP_MANIFEST, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ system_order_id: systemOrderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.detail || 'Failed to generate manifest',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('BigShip manifest error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

// Export singleton instance
export const bigshipService = new BigShipService();

