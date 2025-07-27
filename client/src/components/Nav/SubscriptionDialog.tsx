import React, { useState } from 'react';
import { CreditCard, Calendar, Clock, X } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { useGetSubscriptionStatus, useCreateSubscriptionInvoice } from '~/data-provider';
import { Button } from '~/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui';
import { useToastContext } from '~/Providers';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ open, onOpenChange }) => {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);

  const { data: subscriptionStatus, isLoading: statusLoading } = useGetSubscriptionStatus();
  const createInvoiceMutation = useCreateSubscriptionInvoice();

  const handleSubscribe = async (type: 'daily' | 'weekly') => {
    setIsLoading(true);
    try {
      const response = await createInvoiceMutation.mutateAsync({ type });
      
      // Open Xendit invoice URL in new window
      window.open(response.invoiceUrl, '_blank');
      
      showToast({
        message: 'Payment window opened. Please complete your payment.',
        status: 'success',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      showToast({
        message: 'Failed to create payment invoice. Please try again.',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 font-nunito">
          {/* Current Status */}
          {statusLoading ? (
            <div className="text-center py-4 text-[#1A1A5D]">Loading subscription status...</div>
          ) : (
            <div className="bg-surface-secondary rounded-lg p-4">
              <h3 className="font-medium mb-2 text-[#1A1A5D]">Current Status</h3>
              {subscriptionStatus?.isActive ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-brand-green-600">
          <div className="w-2 h-2 bg-brand-green-600 rounded-full"></div>
                    <span className="font-medium">Active Subscription</span>
                  </div>
                  <div className="text-sm text-[#1A1A5D]">
                    <div>Type: {subscriptionStatus.type?.toUpperCase()}</div>
                    <div>Expires: {formatDate(subscriptionStatus.endDate)}</div>
                    <div>Last Payment: {formatDate(subscriptionStatus.lastPayment)}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#1A1A5D]">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>No active subscription</span>
                </div>
              )}
            </div>
          )}

          {/* Subscription Plans */}
          <div className="space-y-4">
            <h3 className="font-medium text-[#1A1A5D]">Choose a Plan</h3>
            
            {/* Daily Plan */}
            <div className="border border-border-medium rounded-lg p-4 hover:border-border-heavy transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-[#1A1A5D]">Daily Plan</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#1A1A5D]">₱99</div>
                  <div className="text-xs text-[#1A1A5D]">per day</div>
                </div>
              </div>
              <div className="text-sm text-[#1A1A5D] mb-3">
                Perfect for short-term usage or trying out premium features.
              </div>
              <Button
                onClick={() => handleSubscribe('daily')}
                disabled={isLoading || subscriptionStatus?.isActive}
                className="w-full bg-[#313178] hover:bg-[#2a2a6b] text-white font-nunito"
                variant="outline"
              >
                {isLoading ? 'Processing...' : 'Subscribe Daily'}
              </Button>
            </div>

            {/* Weekly Plan */}
            <div className="border border-border-medium rounded-lg p-4 hover:border-border-heavy transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-green-500" />
                  <span className="font-medium text-[#1A1A5D]">Weekly Plan</span>
                  <span className="bg-brand-green-100 text-brand-green-800 text-xs px-2 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#1A1A5D]">₱499</div>
                  <div className="text-xs text-[#1A1A5D]">per week</div>
                </div>
              </div>
              <div className="text-sm text-[#1A1A5D] mb-3">
                Save money with our weekly plan. Ideal for regular users.
                <div className="text-brand-green-600 font-medium mt-1">
                  Save ₱194 compared to daily plan!
                </div>
              </div>
              <Button
                onClick={() => handleSubscribe('weekly')}
                disabled={isLoading || subscriptionStatus?.isActive}
                className="w-full bg-[#313178] hover:bg-[#2a2a6b] text-white font-nunito"
              >
                {isLoading ? 'Processing...' : 'Subscribe Weekly'}
              </Button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="text-xs text-[#1A1A5D] bg-surface-secondary rounded p-3">
            <div className="font-medium mb-1">Payment Information:</div>
            <ul className="space-y-1">
              <li>• Secure payment powered by Xendit</li>
              <li>• Supports credit cards, bank transfers, and e-wallets</li>
              <li>• Automatic renewal (can be cancelled anytime)</li>
              <li>• Instant activation upon payment confirmation</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;