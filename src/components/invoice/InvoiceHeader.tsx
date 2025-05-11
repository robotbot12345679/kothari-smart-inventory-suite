
import React from "react";

interface InvoiceHeaderProps {
  shopName: string;
  address: string;
  phone: string;
  gstNumber?: string;
  logoUrl: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  paymentStatus?: string;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  shopName,
  address,
  phone,
  gstNumber,
  logoUrl,
  invoiceNumber,
  invoiceDate,
  dueDate,
  paymentStatus = "Paid"
}) => {
  const isPaid = paymentStatus === "Paid";
  
  return (
    <div className="flex justify-between items-start mb-10">
      <div className="flex flex-col">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={shopName}
            className="h-14 object-contain mb-3"
            onError={(e) => {
              // If logo fails to load, show text instead
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <h2 className="text-xl font-semibold">{shopName}</h2>
        <p className="text-gray-600 text-sm mt-1">{address}</p>
        <p className="text-gray-600 text-sm">{phone}</p>
        {gstNumber && (
          <p className="text-gray-600 text-sm">GSTIN: {gstNumber}</p>
        )}
      </div>

      <div className="text-right">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">INVOICE</h1>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Invoice Number:</span> {invoiceNumber}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Date:</span> {invoiceDate}
        </p>
        {dueDate && (
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Due Date:</span> {dueDate}
          </p>
        )}
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
            isPaid
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {paymentStatus}
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
