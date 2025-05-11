// /pages/buy/BuyHome.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const BuyHome: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Banner */}
      <section
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-vector/abstract-colorful-sales-banner_23-2148335697.jpg?t=st=1742560953~exp=1742564553~hmac=e6e027c0d417b2e6fb6212ee896222e24ba4fcd84343894945cbf2d5cc63bdb7&w=13800')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6">
            Welcome to Our Buy Zone
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 drop-shadow-md mb-8 max-w-2xl mx-auto">
            Discover exclusive deals on the latest devices with unmatched quality and support.
          </p>
          <Link
            to="/buy/products"
            className="inline-block bg-white text-indigo-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold shadow-xl hover:bg-gray-200 transition-all"
          >
            Explore Products
          </Link>
        </div>
        <div className="absolute bottom-4 right-4 text-white text-xs opacity-70">
          Cash Old Device
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Why Choose Us?
          </h3>
          <p className="text-base sm:text-lg text-gray-600">
            We deliver a hassle-free buying experience with competitive pricing, certified quality, and exceptional support.
            Trusted by thousands, our platform ensures reliability and superior customer service every time.
          </p>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-blue-50 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center">
            Special Offers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Offer Card 1 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:-translate-y-2">
              <img
                src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/store-card-13-iphone-nav-202502?wid=400&hei=260&fmt=png-alpha&.v=1738706422726"
                alt="50% Off on Smartphones"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h4 className="text-2xl font-bold text-indigo-600 mb-3">
                  50% Off on Smartphones
                </h4>
                <p className="text-gray-600 mb-6">
                  Grab the latest smartphones at half the price!
                </p>
                <Link
                  to="/buy/products"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            {/* Offer Card 2 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:-translate-y-2">
              <img
                src="https://rukminim2.flixcart.com/image/832/832/xif0q/computer/m/b/n/-original-imagfdf4xnbyyxpa.jpeg"
                alt="Bundle Deals on Laptops"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h4 className="text-2xl font-bold text-indigo-600 mb-3">
                  Bundle Deals on Laptops
                </h4>
                <p className="text-gray-600 mb-6">
                  Save more with exclusive laptop bundles.
                </p>
                <Link
                  to="/buy/products"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                >
                  Explore Bundles
                </Link>
              </div>
            </div>
            {/* Offer Card 3 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:-translate-y-2">
              <img
                src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/store-card-13-ipad-nav-202405?wid=400&hei=260&fmt=png-alpha&.v=1714168620875"
                alt="Special Pricing on Tablets"
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h4 className="text-2xl font-bold text-indigo-600 mb-3">
                  Special Pricing on Tablets
                </h4>
                <p className="text-gray-600 mb-6">
                  Upgrade to the latest tablets at unbeatable prices.
                </p>
                <Link
                  to="/buy/products"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                >
                  View Offers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center">
            Featured Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Product Card 1 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1">
              <img
                src="https://via.placeholder.com/300x200"
                alt="Product One"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Product One</h4>
              <p className="text-gray-600 mb-2">High-quality, latest tech device.</p>
              <p className="text-lg font-semibold text-indigo-600 mb-4">$999</p>
              <Link
                to="/buy/checkout"
                className="block text-center py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
              >
                Buy Now
              </Link>
            </div>
            {/* Product Card 2 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1">
              <img
                src="https://via.placeholder.com/300x200"
                alt="Product Two"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Product Two</h4>
              <p className="text-gray-600 mb-2">Reliable and affordable device.</p>
              <p className="text-lg font-semibold text-indigo-600 mb-4">$799</p>
              <Link
                to="/buy/checkout"
                className="block text-center py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
              >
                Buy Now
              </Link>
            </div>
            {/* Product Card 3 */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1">
              <img
                src="https://via.placeholder.com/300x200"
                alt="Product Three"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Product Three</h4>
              <p className="text-gray-600 mb-2">Top-rated device with premium features.</p>
              <p className="text-lg font-semibold text-indigo-600 mb-4">$1299</p>
              <Link
                to="/buy/checkout"
                className="block text-center py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gray-100 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <p className="text-gray-600 italic mb-6">
                "Amazing service and unbeatable prices. My new device arrived quickly and works flawlessly!"
              </p>
              <div className="font-bold text-gray-800 text-xl">— Sarah J.</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <p className="text-gray-600 italic mb-6">
                "The buying process was smooth and transparent. I highly recommend this platform to anyone looking for quality devices."
              </p>
              <div className="font-bold text-gray-800 text-xl">— Michael C.</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <p className="text-gray-600 italic mb-6">
                "I love how easy it is to find the perfect device. Great deals, excellent customer support, and fast delivery!"
              </p>
              <div className="font-bold text-gray-800 text-xl">— Priya S.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyHome;
