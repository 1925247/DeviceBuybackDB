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
export const getLocationFromPincode = async (pincode: string): Promise<LocationData> => {
  try {
    // Validate input
    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
      throw new Error('Invalid PIN code format. Please provide a 6-digit PIN code.');
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API responds with an array of results
    if (data && Array.isArray(data) && data.length > 0) {
      if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        return {
          city: postOffice.District || 'Unknown',
          state: postOffice.State || 'Unknown',
          country: postOffice.Country || 'India',
        };
      } else {
        throw new Error('No location found for the provided PIN code.');
      }
    } else {
      throw new Error('Invalid response from PIN code API.');
    }
  } catch (error) {
    console.error('Error fetching location from PIN code:', error);
    // Return default or placeholder data in case of error
    return {
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
    };
  }
};