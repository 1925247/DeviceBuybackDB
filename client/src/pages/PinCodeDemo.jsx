import React, { useState } from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const PinCodeDemo = () => {
  const [pinCode, setPinCode] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const samplePinCodes = [
    { code: '110001', area: 'Connaught Place, Delhi' },
    { code: '400001', area: 'Fort, Mumbai' },
    { code: '560001', area: 'Bangalore GPO' },
    { code: '600001', area: 'Chennai GPO' },
    { code: '700001', area: 'Kolkata GPO' },
    { code: '500001', area: 'Hyderabad GPO' },
    { code: '302001', area: 'Jaipur City' },
    { code: '380001', area: 'Ahmedabad' }
  ];

  const handlePinCodeChange = async (code) => {
    setPinCode(code);
    setError('');
    setLocationData(null);

    if (code.length === 6 && /^[1-9][0-9]{5}$/.test(code)) {
      setLoading(true);
      try {
        console.log(`Testing PIN code: ${code}`);
        
        // Primary API - Indian Postal Service
        const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setLocationData({
            success: true,
            city: postOffice.District,
            state: postOffice.State,
            area: postOffice.Name,
            division: postOffice.Division,
            country: postOffice.Country,
            pincode: postOffice.Pincode
          });
        } else {
          // Try backup API
          try {
            const backupResponse = await fetch(`http://api.zippopotam.us/IN/${code}`);
            const backupData = await backupResponse.json();
            
            if (backupData && backupData.places && backupData.places.length > 0) {
              const place = backupData.places[0];
              setLocationData({
                success: true,
                city: place['place name'],
                state: place.state,
                area: place['place name'],
                country: backupData.country,
                pincode: code,
                source: 'backup'
              });
            } else {
              setError('Invalid PIN code or location not found');
            }
          } catch (backupError) {
            setError('Unable to fetch location data. Please check your internet connection.');
          }
        }
      } catch (error) {
        console.error('Error fetching PIN code data:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (code.length > 0 && code.length < 6) {
      setError('PIN code must be 6 digits');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Indian PIN Code Auto-fill Demo</h1>
          <p className="text-gray-600 mt-2">Enter a 6-digit Indian PIN code to see automatic city and state detection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PIN Code Input */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Enter PIN Code</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Indian PIN Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => handlePinCodeChange(e.target.value)}
                maxLength="6"
                pattern="[0-9]{6}"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Enter 6-digit PIN code"
              />
              {loading && (
                <div className="mt-2 text-blue-600 text-sm">Fetching location data...</div>
              )}
              {error && (
                <div className="mt-2 text-red-600 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>

            {/* Sample PIN Codes */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Try these sample PIN codes:</h3>
              <div className="grid grid-cols-2 gap-2">
                {samplePinCodes.map((sample) => (
                  <button
                    key={sample.code}
                    onClick={() => handlePinCodeChange(sample.code)}
                    className="text-left p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-mono text-blue-600">{sample.code}</div>
                    <div className="text-xs text-gray-500">{sample.area}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Auto-filled Location Data</h2>
            
            {locationData ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 mb-4">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Location Found Successfully!</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">PIN Code:</span>
                    <span className="font-mono">{locationData.pincode}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Area/Post Office:</span>
                    <span>{locationData.area}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium text-gray-700">City/District:</span>
                    <span className="font-semibold text-blue-900">{locationData.city}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium text-gray-700">State:</span>
                    <span className="font-semibold text-blue-900">{locationData.state}</span>
                  </div>
                  
                  {locationData.division && (
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">Division:</span>
                      <span>{locationData.division}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Country:</span>
                    <span>{locationData.country}</span>
                  </div>
                  
                  {locationData.source && (
                    <div className="text-xs text-gray-500 italic">
                      * Data source: {locationData.source === 'backup' ? 'Backup API' : 'Primary API'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enter a valid 6-digit Indian PIN code to see location data</p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">How the PIN Code Auto-fill Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Primary API Integration</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Uses <code className="bg-gray-100 px-1 rounded">api.postalpincode.in</code> - Official Indian Postal Service API</li>
                <li>• Real-time lookup of all Indian PIN codes</li>
                <li>• Returns District, State, Division, and Post Office details</li>
                <li>• Free to use with no API key required</li>
                <li>• Covers all 19,000+ PIN codes across India</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Backup API & Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Fallback to <code className="bg-gray-100 px-1 rounded">zippopotam.us</code> if primary fails</li>
                <li>• Automatic validation of 6-digit PIN code format</li>
                <li>• Real-time API calls triggered on complete PIN entry</li>
                <li>• Handles network errors gracefully</li>
                <li>• Instant form field population</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Implementation in Checkout Form:</h4>
            <div className="text-sm text-blue-800">
              <p>When customers enter their PIN code during checkout, the system automatically:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Validates the 6-digit format</li>
                <li>Makes API call to fetch location data</li>
                <li>Auto-fills City and State fields</li>
                <li>Allows customer to focus on address details</li>
                <li>Improves user experience and reduces input errors</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinCodeDemo;