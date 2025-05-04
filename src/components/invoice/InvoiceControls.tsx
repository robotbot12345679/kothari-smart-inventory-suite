
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, Share, Mail } from "lucide-react";

interface InvoiceControlsProps {
  onPrint: () => void;
  onDownload: () => void;
  onShare: () => void;
  onEmail: () => void;
  onClose?: () => void;
}

const InvoiceControls = ({
  onPrint,
  onDownload,
  onShare,
  onEmail,
  onClose
}: InvoiceControlsProps) => {
  return (
    <div className="print:hidden flex justify-end space-x-2 mb-6">
      <Button variant="outline" onClick={onPrint}>
        <Printer className="h-4 w-4 mr-2" /> Print Invoice
      </Button>
      <Button variant="outline" onClick={onDownload}>
        <Download className="h-4 w-4 mr-2" /> Download PDF
      </Button>
      <Button onClick={onShare}>
        <Share className="h-4 w-4 mr-2" /> Share via WhatsApp
      </Button>
      <Button variant="outline" onClick={onEmail}>
        <Mail className="h-4 w-4 mr-2" /> Share via Email
      </Button>
      {onClose && (
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      )}
    </div>
  );
};

export default InvoiceControls;
