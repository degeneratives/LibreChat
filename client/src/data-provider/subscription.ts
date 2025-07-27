import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from 'librechat-data-provider';

export interface SubscriptionStatus {
  isActive: boolean;
  type?: 'daily' | 'weekly';
  endDate?: string;
  lastPayment?: string;
}

export interface SubscriptionHistory {
  _id: string;
  type: 'daily' | 'weekly';
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  paidAt?: string;
  cancelledAt?: string;
  xenditInvoiceId?: string;
  xenditPaymentId?: string;
}

export interface CreateInvoiceRequest {
  type: 'daily' | 'weekly';
}

export interface CreateInvoiceResponse {
  invoiceUrl: string;
  invoiceId: string;
  amount: number;
  currency: string;
  expiryDate: string;
}

// Get subscription status
export const useGetSubscriptionStatus = () => {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription', 'status'],
    queryFn: () => dataService.makeApiRequest('/api/subscription/status'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get subscription history
export const useGetSubscriptionHistory = () => {
  return useQuery<SubscriptionHistory[]>({
    queryKey: ['subscription', 'history'],
    queryFn: () => dataService.makeApiRequest('/api/subscription/history'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create subscription invoice
export const useCreateSubscriptionInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreateInvoiceResponse, Error, CreateInvoiceRequest>({
    mutationFn: (data) => dataService.makeApiRequest('/api/subscription/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      // Invalidate subscription queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

// Cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => dataService.makeApiRequest('/api/subscription/cancel', {
      method: 'POST',
    }),
    onSuccess: () => {
      // Invalidate subscription queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};