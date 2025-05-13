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
  
  return `GSWP${year}${month}${buybackId}${random}`;
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
      
      {/* Header with GadgetSwap Branding */}
      <div className="bg-blue-50 mb-8 p-6 rounded-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full p-2 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-blue-700 font-bold text-xl tracking-wider">GADGETSWAP</span>
              <p className="text-blue-700 text-sm">+1-800-GADGETS (1-800-423-4387)</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-800">Purchase Receipt</h1>
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
          <h2 className="text-base font-semibold text-blue-700 mb-4">Customer Details</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-gray-600 w-1/4">Customer ID:</td>
                <td className="py-1 font-medium">#{buybackRequest.user_id}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Full Name:</td>
                <td className="py-1">John Smith</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Email:</td>
                <td className="py-1">customer{buybackRequest.user_id}@example.com</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Contact No:</td>
                <td className="py-1">(555) {Math.floor(100 + Math.random() * 900)}-{Math.floor(1000 + Math.random() * 9000)}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">Address:</td>
                <td className="py-1">123 Customer Street, Anytown, CA 94000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-base font-semibold text-blue-700 mb-4">Trade-in Partner Details</h2>
          <table className="w-full text-sm">
            <tbody>
              {buybackRequest.partner_id ? (
                <>
                  <tr>
                    <td className="py-1 text-gray-600 w-1/4">Partner ID:</td>
                    <td className="py-1 font-medium">#{buybackRequest.partner_id}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Company:</td>
                    <td className="py-1">TechRestore Solutions</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Email:</td>
                    <td className="py-1">partner{buybackRequest.partner_id}@techrestore.com</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Contact No:</td>
                    <td className="py-1">(888) 555-{Math.floor(1000 + Math.random() * 9000)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Address:</td>
                    <td className="py-1">456 Partner Avenue, Tech District, NY 10001</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="py-1 text-gray-600 w-1/4">Company:</td>
                    <td className="py-1 font-medium">GadgetSwap Online Services</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Email:</td>
                    <td className="py-1">support@gadgetswap.com</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Contact No:</td>
                    <td className="py-1">1-800-GADGETS (1-800-423-4387)</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Address:</td>
                    <td className="py-1">789 Tech Plaza, San Francisco, CA 94103</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Description of product being traded in */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-blue-700 mb-4 border-t border-gray-200 pt-4">Device Details</h2>
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-blue-50 text-left text-sm">
              <th className="px-4 py-2 text-blue-800">Description</th>
              <th className="px-4 py-2 text-blue-800">IMEI/Serial Number</th>
              <th className="px-4 py-2 text-blue-800">Condition</th>
              <th className="px-4 py-2 text-right text-blue-800">Trade-in Value ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-b border-gray-200">
              <td className="px-4 py-3">
                <p className="font-medium">{buybackRequest.manufacturer} {buybackRequest.model}</p>
                <p className="text-sm text-gray-600">{buybackRequest.device_type}</p>
              </td>
              <td className="px-4 py-3">{buybackRequest.imei || buybackRequest.serial_number || 'N/A'}</td>
              <td className="px-4 py-3">{buybackRequest.condition}</td>
              <td className="px-4 py-3 text-right font-medium">${formattedPrice}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Device Value Details */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-blue-700 mb-4 border-t border-gray-200 pt-4">
          Trade-in Value Details
        </h2>
        <div className="flex justify-end">
          <table className="w-1/2">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-right pr-10">Initial Estimate:</td>
                <td className="py-2 text-right font-medium">${buybackRequest.estimated_value || formattedPrice}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-right pr-10">Offered Price:</td>
                <td className="py-2 text-right font-medium">${buybackRequest.offered_price || buybackRequest.estimated_value || formattedPrice}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-right pr-10">Final Trade-in Value:</td>
                <td className="py-2 text-right font-bold text-lg">${formattedPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Device Condition Details */}
      {buybackRequest.questionnaire_answers && Object.keys(buybackRequest.questionnaire_answers).length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-blue-700 mb-4 border-t border-gray-200 pt-4">Device Condition Assessment</h2>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md">
            {Object.entries(buybackRequest.questionnaire_answers).map(([question, answer], index) => (
              <div key={index} className="pb-2">
                <p className="font-medium text-blue-800">{question}</p>
                <p className="text-gray-700">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Terms & Conditions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-blue-700 mb-4 border-t border-gray-200 pt-4">Terms and Conditions</h2>
        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
          <li>The Customer hereby declares that they are legally entitled to sell this device to GadgetSwap Technologies, Inc. ("Purchaser") under this purchase receipt, and all ownership rights are transferred to the Purchaser.</li>
          <li>The Customer has provided complete and accurate information about the device's history and condition at the time of trade-in.</li>
          <li>The Customer has read and accepted GadgetSwap's terms and conditions available at https://gadgetswap.com/terms, which govern this transaction.</li>
          <li>The Customer acknowledges responsibility for any claims, damages, or losses arising from fraudulent or misrepresented device sales, and understands that GadgetSwap reserves the right to pursue appropriate legal action in such cases.</li>
          <li>The Customer confirms all personal data has been removed from the device and that all activation/security locks have been disabled.</li>
        </ul>
      </div>
      
      {/* Signatures */}
      <div className="flex justify-between mb-8">
        <div className="w-1/3">
          <div className="border-b border-gray-300 pt-8 mb-2"></div>
          <p className="text-sm text-gray-600">Customer's Signature</p>
        </div>
        <div className="w-1/3">
          <div className="border-b border-gray-300 pt-8 mb-2"></div>
          <p className="text-sm text-gray-600">Authorized Signature & Stamp</p>
        </div>
      </div>
      
      {/* Company Information */}
      <div className="bg-blue-50 p-4 rounded-md grid grid-cols-2 gap-4 text-xs mt-8">
        <div>
          <p className="font-semibold mb-1 text-blue-800">GadgetSwap Technologies, Inc.</p>
          <p>789 Tech Plaza, Suite 500</p>
          <p>San Francisco, CA 94103</p>
          <p>United States</p>
        </div>
        <div className="text-right">
          <p className="mb-1">Phone: 1-800-GADGETS (1-800-423-4387)</p>
          <p>Email: support@gadgetswap.com</p>
          <p>Website: www.gadgetswap.com</p>
          <p>© {new Date().getFullYear()} GadgetSwap. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;