
import React from "react";

interface InvoiceTotalsProps {
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paid?: number;
}

const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({
  subtotal,
  discount = 0,
  tax = 0,
  total,
  paid = 0
}) => {
  const balance = total - paid;
  const hasTax = tax > 0;
  const hasDiscount = discount > 0;
  const isPaid = balance <= 0;

  return (
    <div className="mt-8">
      <div className="flex justify-end">
        <div className="w-1/2 lg:w-1/3">
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-600">Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            {hasDiscount && (
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-600">Discount:</span>
                <span>₹{discount.toFixed(2)}</span>
              </div>
            )}
            
            {hasTax && (
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-600">Tax:</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-gray-300 mt-2 pt-2 font-semibold">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between mt-2">
              <span className="font-medium text-gray-600">Amount Paid:</span>
              <span>₹{paid.toFixed(2)}</span>
            </div>
            
            {!isPaid && (
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 font-semibold">
                <span>Balance Due:</span>
                <span className="text-red-600">₹{balance.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!isPaid && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
          <h3 className="text-md font-semibold mb-2">Payment Information</h3>
          <p className="text-sm text-gray-700 mb-4">
            Please use the following details to make your payment:
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Scan to pay via UPI</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=ashokkothari738@oksbi%26pn=KothariDryFruits%26am=${total}%26cu=INR`}
                alt="UPI Payment QR Code"
                className="mx-auto w-24 h-24"
              />
              <p className="text-xs mt-1">UPI ID: ashokkothari738@oksbi</p>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-sm">Bank Transfer Details:</h4>
              <p className="text-xs">Account Name: Kothari Dry Fruits</p>
              <p className="text-xs">Account Number: XXXX-XXXX-XXXX</p>
              <p className="text-xs">IFSC Code: SBIN0001234</p>
              <p className="text-xs">Bank: State Bank of India</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTotals;
