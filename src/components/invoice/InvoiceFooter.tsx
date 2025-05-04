
import React from "react";

interface InvoiceFooterProps {
  footerText: string[];
}

const InvoiceFooter = ({ footerText }: InvoiceFooterProps) => {
  return (
    <div className="mt-8 text-center border-t border-gray-200 pt-6">
      {footerText.map((line, index) => (
        <p key={index} className={index === 0 ? "text-gray-600 font-medium" : "text-gray-500 text-sm mt-1"}>
          {line}
        </p>
      ))}
    </div>
  );
};

export default InvoiceFooter;
