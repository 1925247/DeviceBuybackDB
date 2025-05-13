import React from 'react';

interface BuybackInvoiceProps {
  buybackRequest: {
    id: number;
    user_id: number;
    device_type: string;
    manufacturer: string;
    model: string;
    condition: string;
    status: string;
    created_at: string;
    updated_at: string;
    partner_id: number | null;
    questionnaire_answers?: Record<string, string>;
    imei?: string;
    serial_number?: string;
    estimated_value?: string;
    offered_price?: string;
    final_price?: string;
  };
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const generateInvoiceNumber = (buybackId: number) => {
  const prefix = 'BBI'; // BuyBack Invoice
  const date = new Date();
  const year = date.getFullYear().toString().slice(2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}-${buybackId}-${random}`;
};

const PrintableInvoice: React.FC<BuybackInvoiceProps> = ({ buybackRequest, onClose }) => {
  const invoiceNumber = generateInvoiceNumber(buybackRequest.id);
  const currentDate = new Date().toISOString();
  
  // Use the final price if available, otherwise use offered or estimated
  const price = buybackRequest.final_price || buybackRequest.offered_price || buybackRequest.estimated_value || '0.00';
  
  // Format price to always show 2 decimal places
  const formattedPrice = parseFloat(price.toString()).toFixed(2);
  
  // Print the invoice when component mounts
  React.useEffect(() => {
    const printContent = () => {
      window.print();
    };
    
    // Small delay to ensure the content is rendered
    const timer = setTimeout(() => {
      printContent();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-md print:shadow-none">
      {/* Print-only styling */}
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 10mm 10mm 10mm 10mm; }
          body { background-color: #ffffff; }
          .no-print { display: none !important; }
        `}
      </style>
      
      {/* Close button - only visible on screen */}
      <div className="flex justify-end mb-4 no-print">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-600">Buyback Request #{buybackRequest.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-800">{invoiceNumber}</p>
          <p className="text-gray-600">Date: {formatDate(currentDate)}</p>
        </div>
      </div>
      
      {/* From/To Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">From:</h2>
          <p className="text-gray-600">GadgetSwap</p>
          <p className="text-gray-600">123 Tech Street</p>
          <p className="text-gray-600">San Francisco, CA 94103</p>
          <p className="text-gray-600">support@gadgetswap.com</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer:</h2>
          <p className="text-gray-600">User ID: {buybackRequest.user_id}</p>
          {buybackRequest.partner_id && (
            <p className="text-gray-600 mt-4">
              <span className="font-semibold">Processed by Partner ID:</span> {buybackRequest.partner_id}
            </p>
          )}
        </div>
      </div>
      
      {/* Device Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Device Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Type:</span> {buybackRequest.device_type}</p>
            <p><span className="font-semibold">Manufacturer:</span> {buybackRequest.manufacturer}</p>
            <p><span className="font-semibold">Model:</span> {buybackRequest.model}</p>
            <p><span className="font-semibold">Condition:</span> {buybackRequest.condition}</p>
          </div>
          <div>
            {buybackRequest.imei && (
              <p><span className="font-semibold">IMEI:</span> {buybackRequest.imei}</p>
            )}
            {buybackRequest.serial_number && (
              <p><span className="font-semibold">Serial Number:</span> {buybackRequest.serial_number}</p>
            )}
            <p><span className="font-semibold">Request Date:</span> {formatDate(buybackRequest.created_at)}</p>
            <p><span className="font-semibold">Completion Date:</span> {formatDate(buybackRequest.updated_at)}</p>
          </div>
        </div>
      </div>
      
      {/* Device Condition Details */}
      {buybackRequest.questionnaire_answers && Object.keys(buybackRequest.questionnaire_answers).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Device Condition Assessment</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(buybackRequest.questionnaire_answers).map(([question, answer], index) => (
              <p key={index}><span className="font-semibold">{question}:</span> {answer}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Payment Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Payment Details</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-4">Description</th>
              <th className="text-right py-2 px-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 px-4">
                Buyback Payment for {buybackRequest.manufacturer} {buybackRequest.model}
              </td>
              <td className="text-right py-4 px-4">${formattedPrice}</td>
            </tr>
            <tr className="font-semibold text-lg">
              <td className="py-4 px-4 text-right">Total Payment</td>
              <td className="text-right py-4 px-4">${formattedPrice}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Terms & Notes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Terms & Conditions</h2>
        <ul className="list-disc pl-5 text-gray-600 text-sm">
          <li className="mb-2">This invoice confirms the completion of a device buyback transaction.</li>
          <li className="mb-2">The customer acknowledges that ownership of the device has been transferred to GadgetSwap.</li>
          <li className="mb-2">All personal data has been removed from the device by the customer before the transfer.</li>
          <li className="mb-2">Payment will be processed within 3-5 business days.</li>
          <li className="mb-2">For any questions or concerns, please contact support@gadgetswap.com.</li>
        </ul>
      </div>
      
      {/* Thank You Note */}
      <div className="text-center mt-12 mb-8 text-gray-600">
        <p>Thank you for choosing GadgetSwap for your device recycling needs.</p>
        <p>We appreciate your contribution to sustainable technology consumption.</p>
      </div>
    </div>
  );
};

export default PrintableInvoice;