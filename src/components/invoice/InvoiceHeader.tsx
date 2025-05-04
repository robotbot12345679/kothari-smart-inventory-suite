
import React from "react";
import { BillingTemplate } from "@/types/pos";

interface InvoiceHeaderProps {
  shopName: string;
  address: string;
  phone: string;
  gstNumber: string;
  logoUrl: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

const InvoiceHeader = ({
  shopName,
  address,
  phone,
  gstNumber,
  logoUrl,
  invoiceNumber,
  invoiceDate,
  dueDate
}: InvoiceHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex flex-col">
        <img 
          src={logoUrl} 
          alt={shopName} 
          className="w-24 h-24 object-contain mb-2"
        />
        <h2 className="text-xl font-bold">{shopName}</h2>
        <p className="text-gray-600 mt-2">{address}</p>
        <p className="text-gray-600">{phone}</p>
        {gstNumber && <p className="text-gray-600">GSTIN: {gstNumber}</p>}
      </div>
      
      <div className="text-right">
        <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
        <p className="text-gray-600 mt-2"># {invoiceNumber}</p>
        <div className="mt-6 text-gray-600">
          <p>Issue Date: {invoiceDate}</p>
          <p>Due Date: {dueDate}</p>
          <div className="mt-2">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">PAID</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
