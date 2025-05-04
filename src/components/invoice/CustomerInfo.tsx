
import React from "react";

interface CustomerInfoProps {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
}

const CustomerInfo = ({
  customerName,
  customerPhone,
  customerEmail,
  shippingAddress
}: CustomerInfoProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
      <p className="font-medium text-gray-900">{customerName || "Guest Customer"}</p>
      {customerPhone && <p className="text-gray-600">Phone: {customerPhone}</p>}
      {customerEmail && <p className="text-gray-600">Email: {customerEmail}</p>}
      {shippingAddress && <p className="text-gray-600">{shippingAddress}</p>}
    </div>
  );
};

export default CustomerInfo;
