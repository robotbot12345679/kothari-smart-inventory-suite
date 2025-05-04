
import React from "react";

interface InvoiceTotalsProps {
  subtotal: number;
  total: number;
}

const InvoiceTotals = ({ subtotal, total }: InvoiceTotalsProps) => {
  return (
    <div className="border-t border-gray-200 pt-4 mb-8">
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Discount</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-green-600">
            <span>Amount Paid</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotals;
