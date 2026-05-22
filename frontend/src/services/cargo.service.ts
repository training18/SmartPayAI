import { apiClient } from './api-client';

export interface CargoQuoteInput {
  senderName: string;
  senderAddress: string;
  senderCity: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  merchantPreference?: string;
}

export interface CargoQuote {
  providerId: string;
  providerCode: string;
  providerName: string;
  isEligible: boolean;
  ineligibleReason?: string;
  price: number | null;
  estimatedDeliveryDays: number | null;
  aiScore: number;
  rank: number;
  isRecommended: boolean;
  explanation?: string;
}

export interface OptimizationResponse {
  desi: number;
  weight: number;
  senderCity: string;
  receiverCity: string;
  estimatedSavings: number;
  quotes: CargoQuote[];
}

export interface CreateShipmentInput extends CargoQuoteInput {
  selectedProviderCode: string;
}

export interface ShipmentTracking {
  id: string;
  status: string;
  location: string;
  description: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  merchantId: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  width: number;
  height: number;
  length: number;
  desi: number;
  weight: number;
  status: string;
  selectedProviderId: string | null;
  finalPrice: number | null;
  estimatedDeliveryDays: number | null;
  createdAt: string;
  selectedProvider?: {
    name: string;
    code: string;
  };
  quotes: Array<{
    price: number;
    estimatedDeliveryDays: number;
    aiScore: number;
    rank: number;
    isRecommended: boolean;
    provider: {
      name: string;
      code: string;
    };
  }>;
  tracking: ShipmentTracking[];
}

export interface CargoAnalytics {
  totalShipments: number;
  totalSpent: number;
  totalSaved: number;
  avgDeliveryTime: number;
  providerShares: Array<{
    providerName: string;
    count: number;
    percentage: number;
  }>;
}

export const cargoService = {
  /** Query and optimize cargo shipping options */
  async getQuotes(payload: CargoQuoteInput): Promise<OptimizationResponse> {
    const { data } = await apiClient.post<OptimizationResponse>('/cargo/shipments/optimize', payload);
    return data;
  },

  /** Finalize shipment with selected provider */
  async createShipment(payload: CreateShipmentInput): Promise<Shipment> {
    const { data } = await apiClient.post<Shipment>('/cargo/shipments/create', payload);
    return data;
  },

  /** Fetch shipment history */
  async getHistory(): Promise<Shipment[]> {
    const { data } = await apiClient.get<Shipment[]>('/cargo/shipments/history');
    return data;
  },

  /** Get cargo analytics and savings */
  async getAnalytics(): Promise<CargoAnalytics> {
    const { data } = await apiClient.get<CargoAnalytics>('/cargo/analytics/shipping-savings');
    return data;
  },
};
