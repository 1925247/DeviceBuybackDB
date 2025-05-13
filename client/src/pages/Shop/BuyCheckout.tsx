// /pages/shop/CheckoutPage.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CreditCard } from "lucide-react";

const BuyCheckout = () => {
  const location = useLocation();
  // Copy the passed cart (or default to empty array)
  const initialCart = location.state?.cart || [];
  const [cartItems, setCartItems] = useState(initialCart);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // If no items in cart, show message.
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Your cart is empty.</p>
        <Link
          to="/shop/products"
          className="mt-4 text-indigo-600 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  // Handlers to update cart items
  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(
      cartItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity - 1;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  // Calculate order totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 0 ? 50 : 0;
  let discountAmount = 0;
  if (appliedCoupon === "SAVE10") {
    discountAmount = subtotal * 0.1;
  }
  const total = subtotal + shippingCost - discountAmount;

  // Handler to apply coupon (only "SAVE10" works in demo)
  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAVE10") {
      setAppliedCoupon("SAVE10");
    } else {
      alert("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
        <div className="flex flex-col md:flex-row gap-10">
          {/* Order Summary Section */}
          <div className="md:w-2/3">
            <h2 className="text-3xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center p-4 border rounded-lg"
                >
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-2xl font-bold">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-indigo-600 font-semibold mt-2 text-xl">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">
                  Subtotal:{" "}
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </p>
                <p className="text-lg font-medium">
                  Shipping:{" "}
                  <span className="font-bold">${shippingCost.toFixed(2)}</span>
                </p>
              </div>
              {appliedCoupon && (
                <p className="text-lg font-medium text-green-600">
                  Discount (10%): -${discountAmount.toFixed(2)}
                </p>
              )}
              <p className="text-3xl font-bold mt-4">
                Total:{" "}
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Payment Options and Coupon Section */}
          <div className="md:w-1/3 flex flex-col justify-center">
            <Link
              to="/shop/payment"
              state={{ cart: cartItems }}
              className="w-full py-4 mb-4 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg"
            >
              <CreditCard className="mr-2 h-6 w-6" /> Proceed to Payment
            </Link>
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Apply Coupon</h3>
              <div className="flex">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none"
                  placeholder="Enter coupon code"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700 transition"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="mt-2 text-green-600">
                  Coupon "{appliedCoupon}" applied successfully!
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/shop/products"
            className="text-indigo-600 hover:underline text-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyCheckout;
