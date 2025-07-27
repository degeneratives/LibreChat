import { Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  type: 'daily' | 'weekly';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  xenditInvoiceId: string;
  xenditPaymentId?: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean; // virtual field
}

export interface SubscriptionCreateData {
  userId: Types.ObjectId | string;
  type: 'daily' | 'weekly';
  xenditInvoiceId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
}

export interface SubscriptionUpdateData {
  status?: 'active' | 'expired' | 'cancelled' | 'pending';
  xenditPaymentId?: string;
  paidAt?: Date;
  cancelledAt?: Date;
  metadata?: Record<string, any>;
}