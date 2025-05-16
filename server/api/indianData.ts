import express, { Router, Request, Response } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertIndianStateSchema, 
  insertIndianCitySchema,
  insertIndianPostalCodeSchema, 
  insertGstConfigurationSchema, 
  insertKycDocumentTypeSchema, 
  insertKycDocumentSchema,
  insertPartnerServiceAreaSchema
} from "@shared/schema";

const router = Router();

// Indian States
router.get("/states", async (req: Request, res: Response) => {
  try {
    const states = await storage.getIndianStates();
    res.json(states);
  } catch (error) {
    console.error("Error fetching Indian states:", error);
    res.status(500).json({ message: "Error fetching Indian states" });
  }
});

router.get("/states/:code", async (req: Request, res: Response) => {
  try {
    const state = await storage.getIndianStateByCode(req.params.code);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.json(state);
  } catch (error) {
    console.error("Error fetching Indian state:", error);
    res.status(500).json({ message: "Error fetching Indian state" });
  }
});

router.post("/states", async (req: Request, res: Response) => {
  try {
    const stateData = insertIndianStateSchema.parse(req.body);
    const newState = await storage.createIndianState(stateData);
    res.status(201).json(newState);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating Indian state:", error);
    res.status(500).json({ message: "Error creating Indian state" });
  }
});

router.patch("/states/:code", async (req: Request, res: Response) => {
  try {
    const stateData = insertIndianStateSchema.partial().parse(req.body);
    const updatedState = await storage.updateIndianState(req.params.code, stateData);
    if (!updatedState) {
      return res.status(404).json({ message: "State not found" });
    }
    res.json(updatedState);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating Indian state:", error);
    res.status(500).json({ message: "Error updating Indian state" });
  }
});

// Indian Cities
router.get("/cities", async (req: Request, res: Response) => {
  try {
    const stateCode = req.query.stateCode as string;
    const cities = await storage.getIndianCities(stateCode);
    res.json(cities);
  } catch (error) {
    console.error("Error fetching Indian cities:", error);
    res.status(500).json({ message: "Error fetching Indian cities" });
  }
});

router.get("/cities/:id", async (req: Request, res: Response) => {
  try {
    const city = await storage.getIndianCity(parseInt(req.params.id));
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(city);
  } catch (error) {
    console.error("Error fetching Indian city:", error);
    res.status(500).json({ message: "Error fetching Indian city" });
  }
});

router.post("/cities", async (req: Request, res: Response) => {
  try {
    const cityData = insertIndianCitySchema.parse(req.body);
    const newCity = await storage.createIndianCity(cityData);
    res.status(201).json(newCity);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating Indian city:", error);
    res.status(500).json({ message: "Error creating Indian city" });
  }
});

router.patch("/cities/:id", async (req: Request, res: Response) => {
  try {
    const cityData = insertIndianCitySchema.partial().parse(req.body);
    const updatedCity = await storage.updateIndianCity(parseInt(req.params.id), cityData);
    if (!updatedCity) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(updatedCity);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating Indian city:", error);
    res.status(500).json({ message: "Error updating Indian city" });
  }
});

// Indian Postal Codes
router.get("/postal-codes", async (req: Request, res: Response) => {
  try {
    const stateCode = req.query.stateCode as string;
    const cityId = req.query.cityId ? parseInt(req.query.cityId as string) : undefined;
    const postalCodes = await storage.getIndianPostalCodes(stateCode, cityId);
    res.json(postalCodes);
  } catch (error) {
    console.error("Error fetching Indian postal codes:", error);
    res.status(500).json({ message: "Error fetching Indian postal codes" });
  }
});

router.get("/postal-codes/:code", async (req: Request, res: Response) => {
  try {
    const postalCode = await storage.getIndianPostalCodeByCode(req.params.code);
    if (!postalCode) {
      return res.status(404).json({ message: "Postal code not found" });
    }
    res.json(postalCode);
  } catch (error) {
    console.error("Error fetching Indian postal code:", error);
    res.status(500).json({ message: "Error fetching Indian postal code" });
  }
});

router.post("/postal-codes", async (req: Request, res: Response) => {
  try {
    const postalCodeData = insertIndianPostalCodeSchema.parse(req.body);
    const newPostalCode = await storage.createIndianPostalCode(postalCodeData);
    res.status(201).json(newPostalCode);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating Indian postal code:", error);
    res.status(500).json({ message: "Error creating Indian postal code" });
  }
});

router.patch("/postal-codes/:code", async (req: Request, res: Response) => {
  try {
    const postalCodeData = insertIndianPostalCodeSchema.partial().parse(req.body);
    const updatedPostalCode = await storage.updateIndianPostalCode(req.params.code, postalCodeData);
    if (!updatedPostalCode) {
      return res.status(404).json({ message: "Postal code not found" });
    }
    res.json(updatedPostalCode);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating Indian postal code:", error);
    res.status(500).json({ message: "Error updating Indian postal code" });
  }
});

// GST Configuration
router.get("/gst-configurations", async (req: Request, res: Response) => {
  try {
    const configurations = await storage.getGstConfigurations();
    res.json(configurations);
  } catch (error) {
    console.error("Error fetching GST configurations:", error);
    res.status(500).json({ message: "Error fetching GST configurations" });
  }
});

router.get("/gst-configurations/:id", async (req: Request, res: Response) => {
  try {
    const configuration = await storage.getGstConfigurationById(parseInt(req.params.id));
    if (!configuration) {
      return res.status(404).json({ message: "GST configuration not found" });
    }
    res.json(configuration);
  } catch (error) {
    console.error("Error fetching GST configuration:", error);
    res.status(500).json({ message: "Error fetching GST configuration" });
  }
});

router.get("/gst-configurations/hsn/:hsnCode", async (req: Request, res: Response) => {
  try {
    const configuration = await storage.getGstConfigurationByHsnCode(req.params.hsnCode);
    if (!configuration) {
      return res.status(404).json({ message: "GST configuration not found" });
    }
    res.json(configuration);
  } catch (error) {
    console.error("Error fetching GST configuration by HSN code:", error);
    res.status(500).json({ message: "Error fetching GST configuration by HSN code" });
  }
});

router.post("/gst-configurations", async (req: Request, res: Response) => {
  try {
    const configData = insertGstConfigurationSchema.parse(req.body);
    const newConfig = await storage.createGstConfiguration(configData);
    res.status(201).json(newConfig);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating GST configuration:", error);
    res.status(500).json({ message: "Error creating GST configuration" });
  }
});

router.patch("/gst-configurations/:id", async (req: Request, res: Response) => {
  try {
    const configData = insertGstConfigurationSchema.partial().parse(req.body);
    const updatedConfig = await storage.updateGstConfiguration(parseInt(req.params.id), configData);
    if (!updatedConfig) {
      return res.status(404).json({ message: "GST configuration not found" });
    }
    res.json(updatedConfig);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating GST configuration:", error);
    res.status(500).json({ message: "Error updating GST configuration" });
  }
});

// KYC Document Types
router.get("/kyc-document-types", async (req: Request, res: Response) => {
  try {
    const docTypes = await storage.getKycDocumentTypes();
    res.json(docTypes);
  } catch (error) {
    console.error("Error fetching KYC document types:", error);
    res.status(500).json({ message: "Error fetching KYC document types" });
  }
});

router.get("/kyc-document-types/:code", async (req: Request, res: Response) => {
  try {
    const docType = await storage.getKycDocumentTypeByCode(req.params.code);
    if (!docType) {
      return res.status(404).json({ message: "KYC document type not found" });
    }
    res.json(docType);
  } catch (error) {
    console.error("Error fetching KYC document type:", error);
    res.status(500).json({ message: "Error fetching KYC document type" });
  }
});

router.post("/kyc-document-types", async (req: Request, res: Response) => {
  try {
    const docTypeData = insertKycDocumentTypeSchema.parse(req.body);
    const newDocType = await storage.createKycDocumentType(docTypeData);
    res.status(201).json(newDocType);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating KYC document type:", error);
    res.status(500).json({ message: "Error creating KYC document type" });
  }
});

router.patch("/kyc-document-types/:code", async (req: Request, res: Response) => {
  try {
    const docTypeData = insertKycDocumentTypeSchema.partial().parse(req.body);
    const updatedDocType = await storage.updateKycDocumentType(req.params.code, docTypeData);
    if (!updatedDocType) {
      return res.status(404).json({ message: "KYC document type not found" });
    }
    res.json(updatedDocType);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating KYC document type:", error);
    res.status(500).json({ message: "Error updating KYC document type" });
  }
});

// KYC Documents
router.get("/kyc-documents", async (req: Request, res: Response) => {
  try {
    const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const documents = await storage.getKycDocuments(partnerId, userId);
    res.json(documents);
  } catch (error) {
    console.error("Error fetching KYC documents:", error);
    res.status(500).json({ message: "Error fetching KYC documents" });
  }
});

router.get("/kyc-documents/:id", async (req: Request, res: Response) => {
  try {
    const document = await storage.getKycDocument(parseInt(req.params.id));
    if (!document) {
      return res.status(404).json({ message: "KYC document not found" });
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching KYC document:", error);
    res.status(500).json({ message: "Error fetching KYC document" });
  }
});

router.post("/kyc-documents", async (req: Request, res: Response) => {
  try {
    const documentData = insertKycDocumentSchema.parse(req.body);
    const newDocument = await storage.createKycDocument(documentData);
    res.status(201).json(newDocument);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating KYC document:", error);
    res.status(500).json({ message: "Error creating KYC document" });
  }
});

router.patch("/kyc-documents/:id", async (req: Request, res: Response) => {
  try {
    const documentData = insertKycDocumentSchema.partial().parse(req.body);
    const updatedDocument = await storage.updateKycDocument(parseInt(req.params.id), documentData);
    if (!updatedDocument) {
      return res.status(404).json({ message: "KYC document not found" });
    }
    res.json(updatedDocument);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating KYC document:", error);
    res.status(500).json({ message: "Error updating KYC document" });
  }
});

// Partner Service Areas
router.get("/partner-service-areas/:partnerId", async (req: Request, res: Response) => {
  try {
    const serviceAreas = await storage.getPartnerServiceAreas(parseInt(req.params.partnerId));
    res.json(serviceAreas);
  } catch (error) {
    console.error("Error fetching partner service areas:", error);
    res.status(500).json({ message: "Error fetching partner service areas" });
  }
});

router.post("/partner-service-areas", async (req: Request, res: Response) => {
  try {
    const serviceAreaData = insertPartnerServiceAreaSchema.parse(req.body);
    const newServiceArea = await storage.createPartnerServiceArea(serviceAreaData);
    res.status(201).json(newServiceArea);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating partner service area:", error);
    res.status(500).json({ message: "Error creating partner service area" });
  }
});

router.patch("/partner-service-areas/:id", async (req: Request, res: Response) => {
  try {
    const serviceAreaData = insertPartnerServiceAreaSchema.partial().parse(req.body);
    const updatedServiceArea = await storage.updatePartnerServiceArea(parseInt(req.params.id), serviceAreaData);
    if (!updatedServiceArea) {
      return res.status(404).json({ message: "Service area not found" });
    }
    res.json(updatedServiceArea);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error updating partner service area:", error);
    res.status(500).json({ message: "Error updating partner service area" });
  }
});

router.delete("/partner-service-areas/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deletePartnerServiceArea(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Service area not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner service area:", error);
    res.status(500).json({ message: "Error deleting partner service area" });
  }
});

export default router;