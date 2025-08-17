const puppeteer = require('puppeteer');

const htmlToPdf = async (htmlContent) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        await page.setContent(htmlContent, {
            waitUntil: 'domcontentloaded' // Use simpler wait condition
        });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        return pdf;
    } catch (error) {
        console.error('Puppeteer error:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

const docxToPdf = async (docxBuffer) => {
    try {
        const mammoth = require('mammoth');
        const resultHtml = await mammoth.convertToHtml({ buffer: docxBuffer });

        if (resultHtml.messages && resultHtml.messages.length > 0) {
            console.log('Mammoth conversion messages:', resultHtml.messages);
        }
        const htmlContent = resultHtml.value;
        const pdfBuffer = await htmlToPdf(htmlContent);

        return pdfBuffer;
    } catch (error) {
        console.error('DOCX to PDF conversion error:', error);
        throw error;
    }
};

const handleFileConvert = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        console.log('Processing file:', file.originalname, 'Size:', file.size);

        const fileName = file.originalname;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        let pdfBuffer;

        switch(fileExtension) {
            case 'html':
                const htmlContent = file.buffer.toString('utf-8');
                pdfBuffer = await htmlToPdf(htmlContent);
                break;
            case 'md':
                const { marked } = await import('marked');
                const markdownContent = marked(file.buffer.toString('utf-8'));
                pdfBuffer = await htmlToPdf(markdownContent);
                break;
            case 'docx':
                pdfBuffer = await docxToPdf(file.buffer);
                break;
            default:
                return res.status(400).json({ message: 'Unsupported file type' });
        }

        console.log('PDF generated, size:', pdfBuffer.length);

        // Set proper headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/\.(html|md|docx)$/, '.pdf')}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer directly
        res.end(pdfBuffer);

    } catch (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({
            message: "Conversion failed",
            error: error.message
        });
    }
};

module.exports = { handleFileConvert };