
import React from "react";

interface InvoiceFooterProps {
  footerText: string[];
}

const InvoiceFooter = ({ footerText }: InvoiceFooterProps) => {
  // Ensure footerText is always an array
  const safeFooterText = Array.isArray(footerText) ? footerText : [];
  
  return (
    <div className="mt-8 text-center border-t border-gray-200 pt-6">
      {safeFooterText.map((line, index) => (
        <p key={index} className={index === 0 ? "text-gray-600 font-medium" : "text-gray-500 text-sm mt-1"}>
          {line}
        </p>
      ))}
      {safeFooterText.length === 0 && (
        <>
          <p className="text-gray-600 font-medium">Thank you for your business!</p>
          <p className="text-gray-500 text-sm mt-1">We appreciate your support.</p>
        </>
      )}
    </div>
  );
};

export default InvoiceFooter;
