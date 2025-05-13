// /pages/shop/PaymentPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CreditCard, Banknote, DollarSign, Smartphone } from "lucide-react";

const BuyPayment = () => {
  const location = useLocation();
  const cart = location.state?.cart || [];
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">No items in your cart.</p>
        <Link
          to="/shop/products"
          className="mt-4 text-indigo-600 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  // Payment method: 'card', 'upi', 'netbanking', or 'cod'
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholder: "",
  });
  const [upiDetails, setUpiDetails] = useState({ upiId: "" });
  const [netbankingDetails, setNetbankingDetails] = useState({ bank: "" });

  const handleCardInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleUpiInputChange = (e) => {
    setUpiDetails({ ...upiDetails, [e.target.name]: e.target.value });
  };

  const handleNetbankingChange = (e) => {
    setNetbankingDetails({ bank: e.target.value });
  };

  // Order calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 0 ? 50 : 0;
  const discount = 0; // For demo, no discount applied.
  const total = subtotal + shippingCost - discount;

  // Create invoice data with payment details based on method
  const createInvoiceData = () => ({
    invoiceNumber: "INV-" + Math.floor(Math.random() * 1000000),
    cart,
    subtotal,
    shippingCost,
    discount,
    total,
    paymentMethod,
    paymentDetails:
      paymentMethod === "card"
        ? cardDetails
        : paymentMethod === "upi"
          ? upiDetails
          : paymentMethod === "netbanking"
            ? netbankingDetails
            : null,
    paymentDate: new Date().toLocaleString(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const invoiceData = createInvoiceData();
    navigate("/shop/invoice", { state: { invoice: invoiceData } });
  };

  const handleCODSubmit = () => {
    const invoiceData = createInvoiceData();
    navigate("/shop/invoice", { state: { invoice: invoiceData } });
  };

  // Helper for tab styling
  const tabClasses = (method) =>
    `flex items-center space-x-2 px-4 py-2 cursor-pointer transition-colors ${
      paymentMethod === method
        ? "border-b-2 border-indigo-600 text-indigo-600"
        : "text-gray-600"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Payment</h1>
        {/* Payment Method Tabs */}
        <div className="flex justify-around border-b mb-6">
          <div
            onClick={() => setPaymentMethod("card")}
            className={tabClasses("card")}
          >
            <CreditCard className="h-5 w-5" />
            <span className="hidden sm:inline">Card Payment</span>
          </div>
          <div
            onClick={() => setPaymentMethod("upi")}
            className={tabClasses("upi")}
          >
            <Smartphone className="h-5 w-5" />
            <span className="hidden sm:inline">UPI / Net Banking</span>
          </div>
          <div
            onClick={() => setPaymentMethod("netbanking")}
            className={tabClasses("netbanking")}
          >
            <Banknote className="h-5 w-5" />
            <span className="hidden sm:inline">Net Banking</span>
          </div>
          <div
            onClick={() => setPaymentMethod("cod")}
            className={tabClasses("cod")}
          >
            <DollarSign className="h-5 w-5" />
            <span className="hidden sm:inline">COD</span>
          </div>
        </div>
        {/* Payment Forms */}
        {paymentMethod === "card" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={cardDetails.expiry}
                  onChange={handleCardInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleCardInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholder"
                value={cardDetails.cardholder}
                onChange={handleCardInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center"
            >
              Submit Payment
            </button>
          </form>
        )}
        {paymentMethod === "upi" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                UPI / Net Banking ID
              </label>
              <input
                type="text"
                name="upiId"
                value={upiDetails.upiId}
                onChange={handleUpiInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="example@upi"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center"
            >
              Submit Payment
            </button>
          </form>
        )}
        {paymentMethod === "netbanking" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Your Bank
              </label>
              <select
                name="bank"
                value={netbankingDetails.bank}
                onChange={handleNetbankingChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Choose a bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="Axis">Axis Bank</option>
                <option value="Kotak">Kotak Mahindra Bank</option>
                {/* Add more banks as needed */}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center"
            >
              Submit Payment
            </button>
          </form>
        )}
        {paymentMethod === "cod" && (
          <div className="text-center space-y-4">
            <p className="text-lg">You have selected Cash on Delivery.</p>
            <button
              onClick={() => {
                const invoiceData = createInvoiceData();
                navigate("/shop/invoice", { state: { invoice: invoiceData } });
              }}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
            >
              Confirm Order
            </button>
          </div>
        )}
      </div>
      {/* Combined Trust & Payment Methods Section */}
      <section className="mt-12 max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Secure & Trusted Payments
        </h2>
        <p className="text-center text-gray-600 mb-4">
          We support a wide range of safe and secure payment options for both
          Indian and international transactions.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
            alt="Visa"
            className="object-contain h-8"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
            alt="Mastercard"
            className="object-contain h-8"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/Unified_Payments_Interface_Logo.svg"
            alt="UPI"
            className="object-contain h-8"
          />
          <img
            src="https://dummyimage.com/50x30/cccccc/000000&text=NetBanking"
            alt="Net Banking"
            className="object-contain h-8"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Paytm_logo.png"
            alt="Paytm"
            className="object-contain h-8"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/f9/PhonePe_Logo.png"
            alt="PhonePe"
            className="object-contain h-8"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg"
            alt="American Express"
            className="object-contain h-8"
          />
        </div>
        <div className="mt-6 flex flex-col items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4e/SSL_logo.png"
            alt="SSL Secured"
            className="mb-2 h-8"
          />
          <span className="text-sm text-gray-600">
            SSL Secured & ISO Certified
          </span>
        </div>
        <div className="mt-2 flex flex-col items-center">
          <img
            src="https://dummyimage.com/40x40/cccccc/000000&text=MBG"
            alt="Money-Back Guarantee"
            className="mb-2 h-8"
          />
          <span className="text-sm text-gray-600">Money-Back Guarantee</span>
        </div>
      </section>
    </div>
  );
};

export default BuyPayment;
