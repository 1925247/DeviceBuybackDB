import { apiRequest } from "./queryClient";

// State-related functions
export const getStates = async () => {
  const response = await apiRequest("GET", "/api/indian/states");
  return response.json();
};

export const getStateByCode = async (stateCode: string) => {
  const response = await apiRequest("GET", `/api/indian/states/${stateCode}`);
  return response.json();
};

// City-related functions
export const getCities = async (stateCode?: string) => {
  const url = stateCode 
    ? `/api/indian/cities?stateCode=${stateCode}` 
    : "/api/indian/cities";
  const response = await apiRequest("GET", url);
  return response.json();
};

export const getCityById = async (cityId: number) => {
  const response = await apiRequest("GET", `/api/indian/cities/${cityId}`);
  return response.json();
};

// Postal code-related functions
export const getPostalCodes = async (stateCode?: string, cityId?: number) => {
  let url = "/api/indian/postal-codes";
  
  if (stateCode || cityId) {
    url += "?";
    if (stateCode) {
      url += `stateCode=${stateCode}`;
    }
    if (stateCode && cityId) {
      url += "&";
    }
    if (cityId) {
      url += `cityId=${cityId}`;
    }
  }
  
  const response = await apiRequest("GET", url);
  return response.json();
};

export const getPostalCodeByCode = async (postalCode: string) => {
  const response = await apiRequest("GET", `/api/indian/postal-codes/${postalCode}`);
  return response.json();
};

// GST Configuration functions
export const getGstConfigurations = async () => {
  const response = await apiRequest("GET", "/api/indian/gst-configurations");
  return response.json();
};

export const getGstConfigurationById = async (id: number) => {
  const response = await apiRequest("GET", `/api/indian/gst-configurations/${id}`);
  return response.json();
};

export const getGstConfigurationByHsnCode = async (hsnCode: string) => {
  const response = await apiRequest("GET", `/api/indian/gst-configurations/hsn/${hsnCode}`);
  return response.json();
};

// KYC Document Type functions
export const getKycDocumentTypes = async () => {
  const response = await apiRequest("GET", "/api/indian/kyc-document-types");
  return response.json();
};

export const getKycDocumentTypeByCode = async (code: string) => {
  const response = await apiRequest("GET", `/api/indian/kyc-document-types/${code}`);
  return response.json();
};

// KYC Document functions
export const getKycDocuments = async (partnerId?: number, userId?: number) => {
  let url = "/api/indian/kyc-documents";
  
  if (partnerId || userId) {
    url += "?";
    if (partnerId) {
      url += `partnerId=${partnerId}`;
    }
    if (partnerId && userId) {
      url += "&";
    }
    if (userId) {
      url += `userId=${userId}`;
    }
  }
  
  const response = await apiRequest("GET", url);
  return response.json();
};

export const getKycDocument = async (id: number) => {
  const response = await apiRequest("GET", `/api/indian/kyc-documents/${id}`);
  return response.json();
};

// Partner Service Area functions
export const getPartnerServiceAreas = async (partnerId: number) => {
  const response = await apiRequest("GET", `/api/indian/partner-service-areas/${partnerId}`);
  return response.json();
};