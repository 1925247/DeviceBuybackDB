/**
 * API client for fetching location details from postal PIN code.
 */

export interface LocationData {
  city: string;
  state: string;
  country: string;
}

/**
 * Fetches location details (city, state, country) for a given postal PIN Code.
 *
 * Uses the Postal PIN Code API:
 *   GET https://api.postalpincode.in/pincode/{PINCODE}
 *
 * For valid PIN Codes, the API returns an array where the first element contains
 * details in the "PostOffice" field. We use the first post office's "District" as the city.
 *
 * @param pincode - A 6-digit postal PIN Code (e.g., "110001")
 * @returns A promise that resolves to an object with city, state, and country
 */
// Cache for PIN code lookups to avoid repeated API calls
const pincodeCache: Record<string, LocationData> = {};

export const getLocationFromPincode = async (pincode: string): Promise<LocationData> => {
  try {
    // Validate input
    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
      throw new Error('Invalid PIN code format. Please provide a 6-digit PIN code.');
    }

    // Check cache first
    if (pincodeCache[pincode]) {
      console.log('Using cached PIN code data for:', pincode);
      return pincodeCache[pincode];
    }

    // Set up timeout to avoid hanging on slow responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // The API responds with an array of results
      if (data && Array.isArray(data) && data.length > 0) {
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const result = {
            city: postOffice.District || 'Unknown',
            state: postOffice.State || 'Unknown',
            country: postOffice.Country || 'India',
          };
          
          // Save to cache
          pincodeCache[pincode] = result;
          
          return result;
        } else {
          throw new Error('No location found for the provided PIN code.');
        }
      } else {
        throw new Error('Invalid response from PIN code API.');
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('PIN code lookup timed out. Please try again.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching location from PIN code:', error);
    // Try to fetch from our internal API as fallback
    try {
      const internalResponse = await fetch(`/api/indian/postal-codes/${pincode}`);
      if (internalResponse.ok) {
        const data = await internalResponse.json();
        if (data && data.city && data.state) {
          const result = {
            city: data.city,
            state: data.state,
            country: 'India',
          };
          
          // Save to cache
          pincodeCache[pincode] = result;
          
          return result;
        }
      }
    } catch (internalError) {
      console.error('Internal PIN code API fallback failed:', internalError);
    }
    
    // Return empty data if both APIs fail
    return {
      city: '',
      state: '',
      country: 'India',
    };
  }
};