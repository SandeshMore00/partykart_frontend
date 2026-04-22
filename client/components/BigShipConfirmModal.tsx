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
    shipment_id?: number;
    system_order_id?: string;
    courier_id?: string;
    master_awb?: string;
    label_available?: boolean;
    dimensions?: {
      shipment_weight?: number;
      shipment_length?: number;
      shipment_width?: number;
      shipment_height?: number;
      shipment_chargeable_weight?: number;
    };
  };
  fullResponse?: any;
}

export function BigShipConfirmModal({ 
  isOpen, 
  onClose, 
  status, 
  errorMessage, 
  orderData,
  fullResponse
}: BigShipConfirmModalProps) {
  
  const renderContent = () => {
    switch (status) {
      case 'creating':
        return (
          <div className="flex flex-col items-center justify-center py-4 sm:py-6">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-500 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium text-gray-700">Creating Shipment...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Please wait while we create the shipment</p>
          </div>
        );
      
      case 'manifesting':
        return (
          <div className="flex flex-col items-center justify-center py-4 sm:py-6">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-500 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium text-gray-700">Creating Order in BigShip...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Please wait while we process your order</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col items-center justify-center py-2 sm:py-4">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-2 sm:mb-4" />
              <p className="text-lg sm:text-xl font-bold text-green-700 text-center">Order Confirmed Successfully!</p>
            </div>
            
            <Alert className="bg-green-50 border-green-200">
              <Truck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                <div className="space-y-2 mt-2">
                  {orderData?.shipment_id && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-medium">Shipment ID:</span>
                      <span className="font-mono text-xs sm:text-sm break-all">{orderData.shipment_id}</span>
                    </div>
                  )}
                  {orderData?.system_order_id && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-medium">System Order ID:</span>
                      <span className="font-mono text-xs sm:text-sm break-all">{orderData.system_order_id}</span>
                    </div>
                  )}
                  {orderData?.dimensions && (
                    <div className="mt-2 pt-2 border-t border-green-300">
                      <p className="font-semibold mb-1 text-xs sm:text-sm">Dimensions:</p>
                      <div className="space-y-1 text-xs sm:text-sm">
                        {orderData.dimensions.shipment_weight && (
                          <div className="flex justify-between">
                            <span>Weight:</span>
                            <span>{orderData.dimensions.shipment_weight} kg</span>
                          </div>
                        )}
                        {orderData.dimensions.shipment_length && orderData.dimensions.shipment_width && orderData.dimensions.shipment_height && (
                          <div className="flex justify-between flex-wrap gap-1">
                            <span>Dimensions:</span>
                            <span className="text-right">{orderData.dimensions.shipment_length} × {orderData.dimensions.shipment_width} × {orderData.dimensions.shipment_height} cm</span>
                          </div>
                        )}
                        {orderData.dimensions.shipment_chargeable_weight && (
                          <div className="flex justify-between">
                            <span>Chargeable Weight:</span>
                            <span>{orderData.dimensions.shipment_chargeable_weight} kg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {fullResponse && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3 max-h-40 sm:max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-700 mb-1">Full API Response:</p>
                <pre className="text-[10px] sm:text-xs text-gray-600 whitespace-pre-wrap font-mono break-words">
                  {JSON.stringify(fullResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      
      case 'warning':
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col items-center justify-center py-2 sm:py-4">
              <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mb-2 sm:mb-4" />
              <p className="text-lg sm:text-xl font-bold text-yellow-700 text-center">Partial Success</p>
            </div>
            
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                <p className="font-medium mb-2">Step 1 succeeded but Step 2 failed</p>
                {errorMessage && (
                  <p className="text-xs sm:text-sm mt-2 text-yellow-700 whitespace-pre-wrap break-words">{errorMessage}</p>
                )}
                <p className="text-xs sm:text-sm mt-2 font-medium">Please contact logistics support to complete the order creation.</p>
              </AlertDescription>
            </Alert>
            
            {orderData?.shipment_id && (
              <div className="p-2 sm:p-3 bg-green-50 rounded border border-green-200">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium text-green-700">Shipment ID:</span>
                  <span className="font-mono text-xs sm:text-sm text-green-900 break-all">{orderData.shipment_id}</span>
                </div>
                {orderData.dimensions && (
                  <div className="mt-2 pt-2 border-t border-green-300">
                    <p className="text-xs font-semibold text-green-700 mb-1">Dimensions:</p>
                    <div className="text-xs text-green-600 space-y-1">
                      {orderData.dimensions.shipment_weight && (
                        <div>Weight: {orderData.dimensions.shipment_weight} kg</div>
                      )}
                      {orderData.dimensions.shipment_length && orderData.dimensions.shipment_width && orderData.dimensions.shipment_height && (
                        <div className="break-words">Size: {orderData.dimensions.shipment_length} × {orderData.dimensions.shipment_width} × {orderData.dimensions.shipment_height} cm</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {fullResponse && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3 max-h-40 sm:max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-700 mb-1">Full API Response:</p>
                <pre className="text-[10px] sm:text-xs text-gray-600 whitespace-pre-wrap font-mono break-words">
                  {JSON.stringify(fullResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      
      case 'error':
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col items-center justify-center py-2 sm:py-4">
              <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mb-2 sm:mb-4" />
              <p className="text-lg sm:text-xl font-bold text-red-700 text-center">Order Confirmation Failed</p>
            </div>
            
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-medium mb-2">Unable to confirm order</p>
                {errorMessage && (
                  <p className="text-xs sm:text-sm mt-2 whitespace-pre-wrap break-words">{errorMessage}</p>
                )}
              </AlertDescription>
            </Alert>

            {fullResponse && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3 max-h-40 sm:max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-700 mb-1">Full API Response:</p>
                <pre className="text-[10px] sm:text-xs text-gray-600 whitespace-pre-wrap font-mono break-words">
                  {JSON.stringify(fullResponse, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-blue-800 font-semibold">
                Common Issues:
              </p>
              <ul className="text-xs sm:text-sm text-blue-700 mt-1 sm:mt-2 ml-4 list-disc space-y-0.5 sm:space-y-1">
                <li>Invalid pincode for shipping</li>
                <li>Missing product dimensions</li>
                <li>Incorrect shipping address</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderButton = () => {
    if (status === 'creating' || status === 'manifesting') {
      return null;
    }
    
    if (status === 'success') {
      return (
        <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base">
          Close
        </Button>
      );
    }
    
    return (
      <Button onClick={onClose} variant="outline" className="w-full text-sm sm:text-base">
        Close
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[85vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-3">
          <DialogTitle className="text-lg sm:text-xl">
            {status === 'success' ? 'Success' : 
             status === 'warning' ? 'Warning' : 
             status === 'error' ? 'Error' : 
             'Processing Order'}
          </DialogTitle>
          <DialogDescription className="text-sm">
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
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
          {renderContent()}
        </div>
        <div className="flex-shrink-0 pt-3 border-t border-gray-200 mt-3">
          {renderButton()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

