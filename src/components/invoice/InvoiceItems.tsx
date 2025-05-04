
import React from "react";
import { CartItem } from "@/types/pos";

interface InvoiceItemsProps {
  items: CartItem[];
}

const InvoiceItems = ({ items }: InvoiceItemsProps) => {
  return (
    <div className="mb-8 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-3 px-4 text-left text-gray-600 font-medium">Item</th>
            <th className="py-3 px-4 text-center text-gray-600 font-medium">Quantity</th>
            <th className="py-3 px-4 text-right text-gray-600 font-medium">Price</th>
            <th className="py-3 px-4 text-right text-gray-600 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-4 px-4">
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.weight}{item.unit}
                </p>
              </td>
              <td className="py-4 px-4 text-center">
                {item.quantity} {item.quantity > 1 ? "items" : "item"}
              </td>
              <td className="py-4 px-4 text-right">
                ₹{item.price.toFixed(2)}
              </td>
              <td className="py-4 px-4 text-right font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceItems;
