// /home/project/api/pincode.ts

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
  const url = `https://api.postalpincode.in/pincode/${pincode}`;
  const response = await fetch(url);
  const data = await response.json();

  // data is an array; we use the first element
  const result = data[0];

  if (result.Status.toLowerCase() !== 'success' || !result.PostOffice || result.PostOffice.length === 0) {
    throw new Error('No location data found for this PIN Code');
  }

  // Use the first post office details
  const postOffice = result.PostOffice[0];
  return {
    city: postOffice.District, // District is used as the city
    state: postOffice.State,
    country: postOffice.Country,
  };
};
