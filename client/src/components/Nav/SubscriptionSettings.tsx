import React, { useState } from 'react';
import { CreditCard, Calendar, Clock, X, History, AlertCircle } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { 
  useGetSubscriptionStatus, 
  useGetSubscriptionHistory, 
  useCancelSubscription 
} from '~/data-provider';
import { Button } from '~/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui';
import { useToastContext } from '~/Providers';

interface SubscriptionSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({ open, onOpenChange }) => {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: subscriptionStatus, isLoading: statusLoading, refetch: refetchStatus } = useGetSubscriptionStatus();
  const { data: subscriptionHistory, isLoading: historyLoading } = useGetSubscriptionHistory();
  const cancelSubscriptionMutation = useCancelSubscription();

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await cancelSubscriptionMutation.mutateAsync();
      
      showToast({
        message: 'Subscription cancelled successfully.',
        status: 'success',
      });
      
      setShowCancelConfirm(false);
      refetchStatus();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      showToast({
        message: 'Failed to cancel subscription. Please try again.',
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-brand-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'expired':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 font-nunito">
          {/* Current Status */}
          {statusLoading ? (
            <div className="text-center py-4 text-[#1A1A5D]">Loading subscription status...</div>
          ) : (
            <div className="bg-surface-secondary rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-[#1A1A5D]">
                <CreditCard className="h-4 w-4" />
                Current Subscription
              </h3>
              {subscriptionStatus?.isActive ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-brand-green-600">
                <div className="w-2 h-2 bg-brand-green-600 rounded-full"></div>
                    <span className="font-medium">Active Subscription</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#1A1A5D]">Plan Type:</span>
                      <div className="font-medium capitalize text-[#1A1A5D]">{subscriptionStatus.type}</div>
                    </div>
                    <div>
                      <span className="text-[#1A1A5D]">Expires:</span>
                      <div className="font-medium text-[#1A1A5D]">{formatDate(subscriptionStatus.endDate)}</div>
                    </div>
                    <div>
                      <span className="text-[#1A1A5D]">Last Payment:</span>
                      <div className="font-medium text-[#1A1A5D]">{formatDate(subscriptionStatus.lastPayment)}</div>
                    </div>
                    <div>
                      <span className="text-[#1A1A5D]">Status:</span>
                      <div className="font-medium text-brand-green-600">Active</div>
                    </div>
                  </div>
                  
                  {/* Cancel Subscription */}
                  <div className="pt-3 border-t border-border-light">
                    {!showCancelConfirm ? (
                      <Button
                        onClick={() => setShowCancelConfirm(true)}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 font-nunito"
                      >
                        Cancel Subscription
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Are you sure you want to cancel your subscription?</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCancelSubscription}
                            disabled={isLoading}
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 font-nunito"
                          >
                            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                          </Button>
                          <Button
                            onClick={() => setShowCancelConfirm(false)}
                            variant="outline"
                            className="font-nunito"
                          >
                            Keep Subscription
                          </Button>
                        </div>
                      </div>
                    )}
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

          {/* Payment History */}
          <div className="bg-surface-secondary rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2 text-[#1A1A5D]">
              <History className="h-4 w-4" />
              Payment History
            </h3>
            
            {historyLoading ? (
              <div className="text-center py-4 text-[#1A1A5D]">Loading payment history...</div>
            ) : subscriptionHistory && subscriptionHistory.length > 0 ? (
              <div className="space-y-3">
                {subscriptionHistory.map((payment, index) => (
                  <div key={index} className="border border-border-light rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1A1A5D]">₱{payment.amount}</span>
                        <span className="text-sm text-[#1A1A5D] capitalize">
                          ({payment.type} plan)
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-[#1A1A5D]">
                      <div>
                        <span>Date:</span>
                        <div>{formatDateTime(payment.startDate)}</div>
                      </div>
                      <div>
                        <span>Invoice ID:</span>
                        <div className="font-mono">{payment.xenditInvoiceId || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[#1A1A5D]">
                No payment history found
              </div>
            )}
          </div>

          {/* Billing Information */}
          <div className="text-xs text-[#1A1A5D] bg-surface-tertiary rounded p-3">
            <div className="font-medium mb-2">Billing Information:</div>
            <ul className="space-y-1">
              <li>• Payments are processed securely through Xendit</li>
              <li>• Subscriptions auto-renew unless cancelled</li>
              <li>• Cancellation takes effect at the end of current billing period</li>
              <li>• For billing issues, please contact support</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionSettings;