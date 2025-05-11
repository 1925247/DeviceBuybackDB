// /pages/buy/BuyInvoice.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Invoice {
  invoiceNumber: string;
  cart: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentDetails: any; // You can further define this if needed
  paymentDate: string;
}

const BuyInvoice: React.FC = () => {
  const location = useLocation();
  const invoice: Invoice | undefined = location.state?.invoice;

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">No invoice available.</p>
        <Link to="/buy/products" className="mt-4 text-indigo-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Invoice</h1>
        <div className="mb-6">
          <p>
            <span className="font-bold">Invoice Number:</span> {invoice.invoiceNumber}
          </p>
          <p>
            <span className="font-bold">Payment Date:</span> {invoice.paymentDate}
          </p>
          <p>
            <span className="font-bold">Payment Method:</span>{' '}
            {invoice.paymentMethod === 'card'
              ? 'Card Payment'
              : invoice.paymentMethod === 'upi'
              ? 'UPI / Net Banking'
              : invoice.paymentMethod === 'netbanking'
              ? 'Net Banking'
              : 'Cash on Delivery'}
          </p>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Order Details</h2>
          {invoice.cart.map((item) => (
            <div key={item.id} className="flex items-center border-b pb-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-indigo-600 font-semibold">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-6 text-right">
          <p className="text-lg font-medium">
            Subtotal: <span className="font-bold">${invoice.subtotal.toFixed(2)}</span>
          </p>
          <p className="text-lg font-medium">
            Shipping: <span className="font-bold">${invoice.shippingCost.toFixed(2)}</span>
          </p>
          {invoice.discount > 0 && (
            <p className="text-lg font-medium text-green-600">
              Discount: -${invoice.discount.toFixed(2)}
            </p>
          )}
          <p className="text-3xl font-bold mt-4">
            Total: <span className="text-indigo-600">${invoice.total.toFixed(2)}</span>
          </p>
        </div>
        <div className="text-center">
          <Link to="/buy/products" className="text-indigo-600 hover:underline text-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyInvoice;
