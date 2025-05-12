const { db } = require('../db');
const { eq, and } = require('drizzle-orm');
const path = require('path');
const fs = require('fs');

/**
 * Generates an invoice for a buyback request
 * @param {number} buybackRequestId - ID of the buyback request
 * @returns {Promise<object>} - Invoice data and file path
 */
async function generateBuybackInvoice(buybackRequestId) {
  try {
    // In a real implementation, this would use a library like PDFKit or react-pdf
    // For this example, we'll just prepare the data that would be used for the invoice

    // Get the buyback request with related data
    const [buybackRequest] = await db.query(`
      SELECT br.*, 
             u.first_name, u.last_name, u.email,
             p.name as partner_name, p.address as partner_address,
             dm.name as device_model_name, 
             b.name as brand_name
      FROM buyback_requests br
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN partners p ON br.partner_id = p.id
      LEFT JOIN device_models dm ON br.device_model_id = dm.id
      LEFT JOIN brands b ON dm.brand_id = b.id
      WHERE br.id = $1
    `, [buybackRequestId]);

    if (!buybackRequest) {
      throw new Error(`Buyback request with ID ${buybackRequestId} not found`);
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: `INV-${buybackRequestId}-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      
      // Seller details (customer)
      seller: {
        name: buybackRequest.customer_name || `${buybackRequest.first_name} ${buybackRequest.last_name}`,
        email: buybackRequest.customer_email || buybackRequest.email,
        phone: buybackRequest.customer_phone,
        address: buybackRequest.pickup_address,
        pinCode: buybackRequest.pin_code,
      },
      
      // Purchaser details (partner)
      purchaser: {
        name: buybackRequest.partner_name,
        address: buybackRequest.partner_address,
      },
      
      // Device details
      device: {
        brand: buybackRequest.brand_name,
        model: buybackRequest.device_model_name || buybackRequest.model,
        condition: buybackRequest.condition,
        variant: buybackRequest.variant,
      },
      
      // Financial details
      financial: {
        offeredPrice: buybackRequest.offered_price,
        finalPrice: buybackRequest.final_price,
        deductions: buybackRequest.deductions || {},
      },
      
      // Other details
      saleDate: new Date().toISOString().split('T')[0],
      notes: buybackRequest.notes,
    };

    // In a real implementation, this would generate a PDF
    // For now, we'll just pretend we did and return the data
    
    // Save invoice data in a JSON file (for example purposes)
    const invoicesDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    
    const invoiceFilePath = path.join(invoicesDir, `invoice-${invoiceData.invoiceNumber}.json`);
    fs.writeFileSync(invoiceFilePath, JSON.stringify(invoiceData, null, 2));
    
    return {
      success: true,
      message: 'Invoice generated successfully',
      invoiceData,
      filePath: invoiceFilePath,
    };
    
  } catch (error) {
    console.error('Error generating buyback invoice:', error);
    throw error;
  }
}

/**
 * Sends an invoice to a customer by email
 * @param {number} buybackRequestId - ID of the buyback request
 * @returns {Promise<object>} - Email sending result
 */
async function sendInvoiceByEmail(buybackRequestId) {
  try {
    // In a real implementation, this would use an email library like nodemailer
    // and would include the PDF as an attachment
    
    // First generate the invoice
    const invoice = await generateBuybackInvoice(buybackRequestId);
    
    // Get customer email
    const [buybackRequest] = await db.query(`
      SELECT br.*, u.email
      FROM buyback_requests br
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.id = $1
    `, [buybackRequestId]);
    
    const recipientEmail = buybackRequest.customer_email || buybackRequest.email;
    
    if (!recipientEmail) {
      throw new Error('No customer email found for this buyback request');
    }
    
    // Pretend we sent an email for now
    console.log(`[Email Service] Sending invoice ${invoice.invoiceData.invoiceNumber} to ${recipientEmail}`);
    
    return {
      success: true,
      message: `Invoice sent to ${recipientEmail}`,
      invoiceNumber: invoice.invoiceData.invoiceNumber,
    };
    
  } catch (error) {
    console.error('Error sending invoice by email:', error);
    throw error;
  }
}

/**
 * Gets all invoice templates
 * @returns {Promise<array>} - Array of invoice templates
 */
async function getInvoiceTemplates() {
  // In a real implementation, this would fetch from the database
  // For now, we'll return a set of hardcoded templates
  return [
    {
      id: 1,
      name: 'Standard Invoice',
      description: 'Default invoice template for all buyback requests',
      thumbnail: '/assets/invoice-templates/standard.png',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Premium Invoice',
      description: 'Enhanced template with more details and company branding',
      thumbnail: '/assets/invoice-templates/premium.png',
      isDefault: false,
    },
    {
      id: 3,
      name: 'Minimal Invoice',
      description: 'Clean, minimal design with essential information only',
      thumbnail: '/assets/invoice-templates/minimal.png',
      isDefault: false,
    },
  ];
}

module.exports = {
  generateBuybackInvoice,
  sendInvoiceByEmail,
  getInvoiceTemplates,
};