import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PrintableInvoice from './PrintableInvoice';

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  buybackRequest: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ open, onClose, buybackRequest }) => {
  if (!buybackRequest) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Buyback Invoice #{buybackRequest.id}</DialogTitle>
        </DialogHeader>
        <PrintableInvoice buybackRequest={buybackRequest} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;