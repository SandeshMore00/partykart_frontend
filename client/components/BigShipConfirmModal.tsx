import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Truck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BigShipConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'idle' | 'creating' | 'manifesting' | 'success' | 'error' | 'warning';
  errorMessage?: string;
  orderData?: {
    system_order_id?: string;
    courier_id?: string;
    master_awb?: string;
    label_available?: boolean;
  };
}

export function BigShipConfirmModal({ 
  isOpen, 
  onClose, 
  status, 
  errorMessage, 
  orderData 
}: BigShipConfirmModalProps) {
  
  const renderContent = () => {
    switch (status) {
      case 'creating':
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-medium text-gray-700">Creating BigShip Order...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we process your order</p>
          </div>
        );
      
      case 'manifesting':
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-medium text-gray-700">Generating Manifest...</p>
            <p className="text-sm text-gray-500 mt-2">Creating shipping label and AWB</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-xl font-bold text-green-700">Order Confirmed Successfully!</p>
            </div>
            
            <Alert className="bg-green-50 border-green-200">
              <Truck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2 mt-2">
                  {orderData?.system_order_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">System Order ID:</span>
                      <span className="font-mono text-sm">{orderData.system_order_id}</span>
                    </div>
                  )}
                  {orderData?.courier_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">Courier ID:</span>
                      <span className="font-mono text-sm">{orderData.courier_id}</span>
                    </div>
                  )}
                  {orderData?.master_awb && (
                    <div className="flex justify-between">
                      <span className="font-medium">Master AWB:</span>
                      <span className="font-mono text-sm">{orderData.master_awb}</span>
                    </div>
                  )}
                  {orderData?.label_available !== undefined && (
                    <div className="flex justify-between">
                      <span className="font-medium">Label Available:</span>
                      <span className={orderData.label_available ? 'text-green-600 font-semibold' : 'text-red-600'}>
                        {orderData.label_available ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
            
            <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        );
      
      case 'warning':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
              <p className="text-xl font-bold text-yellow-700">Partial Success</p>
            </div>
            
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <p className="font-medium mb-2">Order created but manifest failed</p>
                {errorMessage && (
                  <p className="text-sm mt-2 text-yellow-700">{errorMessage}</p>
                )}
                <p className="text-sm mt-3 font-medium">Please contact logistics support to complete the manifest.</p>
              </AlertDescription>
            </Alert>
            
            {orderData?.system_order_id && (
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">System Order ID:</span>
                  <span className="font-mono text-sm text-gray-900">{orderData.system_order_id}</span>
                </div>
              </div>
            )}
            
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        );
      
      case 'error':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-xl font-bold text-red-700">Order Confirmation Failed</p>
            </div>
            
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Unable to confirm order</p>
                {errorMessage && (
                  <p className="text-sm mt-2 whitespace-pre-wrap">{errorMessage}</p>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Common Issues:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc space-y-1">
                <li>Invalid pincode for shipping</li>
                <li>Missing product dimensions (weight, length, width, height)</li>
                <li>Incorrect shipping address</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>
            
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === 'success' ? 'Success' : 
             status === 'warning' ? 'Warning' : 
             status === 'error' ? 'Error' : 
             'Processing Order'}
          </DialogTitle>
          <DialogDescription>
            {status === 'creating' || status === 'manifesting' 
              ? 'Please do not close this window'
              : status === 'success'
              ? 'Order has been successfully confirmed with BigShip'
              : status === 'warning'
              ? 'Order created but requires manual intervention'
              : status === 'error'
              ? 'Failed to confirm order with BigShip'
              : ''
            }
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

