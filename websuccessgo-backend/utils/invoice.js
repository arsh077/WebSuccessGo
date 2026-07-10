const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const logger = require('./logger');

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order object with customer and template populated
 * @returns {String} - Path to generated invoice file
 */
module.exports = function createInvoice(order) {
  try {
    const filename = `${order.orderNumber}.pdf`;
    const invoicesDir = path.join(__dirname, '..', 'invoices');
    const target = path.join(invoicesDir, filename);

    // Create invoices directory if it doesn't exist
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Pipe to file
    doc.pipe(fs.createWriteStream(target));

    // Header
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('INVOICE', { align: 'center' })
      .moveDown(0.5);

    // Company info
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('WebSuccessGo', { align: 'center' })
      .text('Professional Web Solutions', { align: 'center' })
      .moveDown(1.5);

    // Horizontal line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    // Invoice details - Left side
    const startY = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Invoice Details:', 50, startY)
      .font('Helvetica')
      .moveDown(0.3)
      .text(`Invoice Number: ${order.orderNumber}`, 50)
      .text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .moveDown(1);

    // Customer details - Right side
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Bill To:', 320, startY)
      .font('Helvetica')
      .moveDown(0.3)
      .text(`${order.customer?.name || 'N/A'}`, 320)
      .text(`${order.customer?.email || 'N/A'}`, 320)
      .text(`${order.customer?.phone || 'N/A'}`, 320)
      .moveDown(2);

    // Horizontal line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    // Table header
    const tableTop = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Description', 50, tableTop)
      .text('Package', 280, tableTop)
      .text('Amount', 450, tableTop, { align: 'right' });

    // Horizontal line under header
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke()
      .moveDown(0.5);

    // Table content
    const itemY = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`${order.template?.title || 'Custom Template'}`, 50, itemY, { width: 220 })
      .text(order.package, 280, itemY)
      .text(`₹${order.amount.toFixed(2)}`, 450, itemY, { align: 'right' });

    doc.moveDown(2);

    // Horizontal line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(0.5);

    // Totals
    const totalsY = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Total Amount:', 350, totalsY)
      .text(`₹${order.amount.toFixed(2)}`, 450, totalsY, { align: 'right' })
      .moveDown(0.3)
      .text('Amount Paid:', 350, doc.y)
      .text(`₹${order.advancePaid.toFixed(2)}`, 450, doc.y, { align: 'right' })
      .moveDown(0.3);

    // Horizontal line
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(350, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(0.3);

    // Balance
    const balance = order.amount - order.advancePaid;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Balance Due:', 350, doc.y)
      .text(`₹${balance.toFixed(2)}`, 450, doc.y, { align: 'right' })
      .moveDown(2);

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('Thank you for choosing WebSuccessGo!', 50, doc.y, { align: 'center' })
      .moveDown(0.5)
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'For any queries, please contact us at support@websuccessgo.com',
        50,
        doc.y,
        { align: 'center' }
      );

    // Finalize PDF
    doc.end();

    logger.info(`Invoice generated: ${filename}`);

    return `/invoices/${filename}`;
  } catch (error) {
    logger.error('Invoice generation error:', error);
    throw new Error('Failed to generate invoice');
  }
};
