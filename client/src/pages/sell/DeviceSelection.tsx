import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
} from "lucide-react";
import { useModels } from "../../contexts/ModelsContext";

// const { deviceTypes, isLoading, error } = useModels();
// Icon component mapping
const IconComponent = (iconName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    smartphone: <Smartphone className="w-12 h-12 text-blue-500" />,
    laptop: <Laptop className="w-12 h-12 text-green-500" />,
    tablet: <Tablet className="w-12 h-12 text-purple-500" />,
    watch: <Watch className="w-12 h-12 text-orange-500" />,
    headphones: <Headphones className="w-12 h-12 text-indigo-500" />,
  };
  return (
    iconMap[iconName] || <Smartphone className="w-12 h-12 text-blue-500" />
  );
};

const DeviceSelection: React.FC = () => {
  const { deviceTypes, isLoading, error } = useModels();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sell Your Device
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            Get an instant quote for your device. Select a category below to
            begin.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading device categories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
              <p>
                Sorry, we couldn't load the device categories. Please try again
                later.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deviceTypes.map((category) => (
              <Link
                key={category.id}
                to={`/sell/${category.slug}`}
                className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="mb-4">{IconComponent(category.icon)}</div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {category.description || `${category.name} devices`}
                  </p>
                  <div className="mt-4 inline-flex items-center text-indigo-600 text-sm font-medium">
                    Get a quote
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Why Sell With Us?
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Best Prices
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We offer competitive prices that are regularly updated to
                    match market value.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Easy Process
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Simple step-by-step process. Get a quote online, ship your
                    device, and get paid quickly.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Secure & Safe
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your data is wiped securely. We handle all devices with care
                    and follow strict data protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelection;
