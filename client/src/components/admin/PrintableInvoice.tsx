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
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const generateReferenceNumber = (buybackId: number) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2); 
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `SRVFY${year}${month}${buybackId}${random}`;
};

const generateBarcode = () => {
  // This would ideally generate a real barcode, but for display we'll create a placeholder
  return '||| || ||| | || | ||| || | ||| |||| || |||';
};

const PrintableInvoice: React.FC<BuybackInvoiceProps> = ({ buybackRequest, onClose }) => {
  const referenceNumber = generateReferenceNumber(buybackRequest.id);
  const currentDate = formatDate(new Date().toISOString());
  
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
      
      {/* Header with Servify Branding */}
      <div className="bg-purple-50 mb-8 p-6 rounded-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-purple-700 text-white rounded-full p-2 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-purple-700 font-bold text-xl tracking-wider">SERVIFY</span>
          </div>
          <h1 className="text-2xl font-bold text-purple-800">Purchase Receipt</h1>
        </div>
        
        <div className="flex justify-between mt-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Date</p>
            <p className="font-medium">{currentDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Reference Number</p>
            <p className="font-medium">{referenceNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs mt-1">{generateBarcode()}</p>
          </div>
        </div>
      </div>
      
      {/* Seller and Trade-in Partner Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-base font-semibold text-purple-700 mb-4">Seller Details</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-gray-600 w-1/4">Name:</td>
                <td className="py-1">Customer #{buybackRequest.user_id}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Contact No:</td>
                <td className="py-1">****{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Place:</td>
                <td className="py-1">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-base font-semibold text-purple-700 mb-4">Trade-in partner</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-gray-600 w-1/4">Store Name:</td>
                <td className="py-1">
                  {buybackRequest.partner_id ? `Partner #${buybackRequest.partner_id}` : 'Online Trade-in'}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Address:</td>
                <td className="py-1">Servify Trade-in Center, Tech District</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Contact No:</td>
                <td className="py-1">1-800-SERVIFY</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Description of product being traded in */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-4 border-t border-gray-200 pt-4">Description of the original product being traded in</h2>
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="text-purple-700 text-left text-sm">
              <th className="py-2">Description of product traded-in</th>
              <th className="py-2">IMEI/Serial Number</th>
              <th className="py-2 text-right">Trade-in price of the original product (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-b border-gray-200">
              <td className="py-3">{buybackRequest.manufacturer} {buybackRequest.model} {buybackRequest.condition}</td>
              <td className="py-3">{buybackRequest.imei || buybackRequest.serial_number || '—'}</td>
              <td className="py-3 text-right font-medium">{formattedPrice}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Benefits section */}
      <div className="mb-8">
        <h2 className="text-base font-normal text-gray-700 mb-4 border-t border-gray-200 pt-4">
          Benefit provided to the Seller by the OEM on purchase of the new product from the trade-in partner in exchange of the trade-in of the original product
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-purple-700 text-left text-sm">
              <th className="py-2">Offer Name</th>
              <th className="py-2">Offer Value (INR)</th>
              <th className="py-2">New IMEI/ Serial Number</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-b border-gray-200">
              <td className="py-3">Device Trade-in Value</td>
              <td className="py-3">{formattedPrice}</td>
              <td className="py-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Device Condition Details */}
      {buybackRequest.questionnaire_answers && Object.keys(buybackRequest.questionnaire_answers).length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4 border-t border-gray-200 pt-4">Device Condition Assessment</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(buybackRequest.questionnaire_answers).map(([question, answer], index) => (
              <p key={index}><span className="font-medium text-gray-700">{question}:</span> {answer}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Terms & Conditions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-4 border-t border-gray-200 pt-4">Terms and Conditions</h2>
        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
          <li>The Seller hereby declares that he/she is eligible and entitled to sell the Product to Servify Technology Private Limited ("Purchaser") under this purchase receipt and title of the Product is hereby transferred to the Purchaser.</li>
          <li>The Seller has disclosed all relevant information about the history and/or usage of the Product at the time of trading in the Product.</li>
          <li>The Seller has read, acknowledged and accepted the customer terms and conditions which can be accessed at https://servify.in/trade-in-tnc and are applicable to the sale of the Product by the Seller to the Purchaser.</li>
          <li>The Seller will remain liable for any claims, damages, losses, or expenses in case of fraudulent sale of the Product to the Purchaser and accordingly the Purchaser reserves the right to take appropriate legal action against the Seller in case of the aforementioned event.</li>
        </ul>
      </div>
      
      {/* Company Information */}
      <div className="bg-green-50 p-3 grid grid-cols-2 gap-4 text-xs mt-12">
        <div>
          <p className="font-semibold mb-1">Servify Technology Pvt. Ltd</p>
          <p>Unit 2nd Floor, Building No.10,</p>
          <p>iThink Corporate Park, Pokhran Road,</p>
          <p>Mumbai - 400093, Maharashtra, India</p>
        </div>
        <div className="text-right">
          <p className="mb-1">hello@servify.tech</p>
          <p>support@servify.in</p>
          <p>CIN: U74120MH2015PTC262511</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;