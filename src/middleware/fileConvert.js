const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// Load jobs with safety check
let jobs;
try {
    jobs = require('../../jobs.json');
    if (!jobs || !jobs.jobs) {
        jobs = { jobs: [] };
    }
} catch (error) {
    console.log('Creating new jobs.json file');
    jobs = { jobs: [] };
}


const htmlToPdf = async (htmlContent) => {
    let browser;
    try {
        // Optimized Puppeteer configuration for better performance
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',
                '--disable-javascript',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--single-process',
                '--no-zygote',
                '--memory-pressure-off',
                '--max_old_space_size=4096',
            ],
            timeout: 60000,
            protocolTimeout: 60000
        });

        const page = await browser.newPage();

        await page.setDefaultTimeout(120000);
        await page.setDefaultNavigationTimeout(120000);

        // Optimize page settings
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        // Disable unnecessary features for better performance
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setContent(htmlContent, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Use a more reliable wait method instead of waitForTimeout
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 60000 });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            },
            timeout: 120000
        });

        return pdf;
    } catch (error) {
        console.error('Puppeteer error:', error);
        throw error;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
    }
};

const docxToPdf = async (docxBuffer) => {
    try {
        console.log('Converting DOCX to PDF using Mammoth with enhanced table support...');

        const options = {
            styleMap: [
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Heading 1'] => h2:fresh",
                "p[style-name='Heading 2'] => h3:fresh",
                "p[style-name='Body Text'] => p:fresh",
                "p[style-name='Table Paragraph'] => p:fresh",
                "r[style-name='Strong'] => strong",
                "r[style-name='Emphasis'] => em",
                "r[style-name='Highlight'] => mark",
                // Enhanced table support
                "table => table:table",
                "tr => tr:table-row",
                "td => td:table-cell",
                "th => th:table-header-cell"
            ],
            transformDocument: (element) => {
                // Custom transformations for tables
                if (element.type === 'table') {
                    // Ensure table has proper structure
                    element.attributes = {
                        class: 'enhanced-table',
                        style: 'border-collapse: collapse; width: 100%; margin: 20px 0;'
                    };
                }
                if (element.type === 'tableRow') {
                    element.attributes = { class: 'table-row' };
                }
                if (element.type === 'tableCell') {
                    element.attributes = {
                        class: 'table-cell',
                        style: 'border: 1px solid #ddd; padding: 8px; vertical-align: top;'
                    };
                }
                return element;
            }
        };

        const resultHtml = await mammoth.convertToHtml({
            buffer: docxBuffer,
            ...options
        });

        if (resultHtml.messages && resultHtml.messages.length > 0) {
            console.log('Mammoth conversion messages:', resultHtml.messages);
        }
        const enhancedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* General styling */
                    .title-style {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 20px;
                    }
                    h1 { font-size: 28px; color: #2c3e50; margin-bottom: 20px; }
                    h2 { font-size: 24px; color: #34495e; margin-bottom: 16px; }
                    h3 { font-size: 20px; color: #7f8c8d; margin-bottom: 14px; }
                    p { line-height: 1.6; margin-bottom: 12px; }
                    strong { font-weight: bold; color: #e74c3c; }
                    em { font-style: italic; color: #3498db; }

                    /* Enhanced table styling */
                    .enhanced-table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 20px 0;
                        font-family: Arial, sans-serif;
                        border: 2px solid #34495e;
                    }

                    .enhanced-table th {
                        background-color: #34495e;
                        color: white;
                        font-weight: bold;
                        padding: 12px 8px;
                        text-align: left;
                        border: 1px solid #2c3e50;
                        font-size: 14px;
                    }

                    .enhanced-table td {
                        padding: 10px 8px;
                        border: 1px solid #bdc3c7;
                        vertical-align: top;
                        font-size: 13px;
                        line-height: 1.4;
                    }

                    .enhanced-table tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }

                    .enhanced-table tr:hover {
                        background-color: #e9ecef;
                    }

                    /* Table cell content styling */
                    .enhanced-table p {
                        margin: 0 0 8px 0;
                        line-height: 1.4;
                    }

                    .enhanced-table p:last-child {
                        margin-bottom: 0;
                    }

                    /* Responsive table */
                    @media (max-width: 768px) {
                        .enhanced-table {
                            font-size: 12px;
                        }
                        .enhanced-table th,
                        .enhanced-table td {
                            padding: 6px 4px;
                        }
                    }
                </style>
            </head>
            <body>
                ${resultHtml.value}
            </body>
            </html>
        `;

        const pdfBuffer = await htmlToPdf(enhancedHtml);

        console.log('Enhanced Mammoth conversion with table support successful');
        return pdfBuffer;
    } catch (error) {
        console.error('Enhanced Mammoth conversion error:', error);
        throw error;
    }
};

const createJob = (jobId,originalFileName, convertedFileName, fileType, userName, fullName, jobResult, timeStamp, fileSize, pdfSize, downloadUrl) => {
    const job = {
        jobId,
        originalFileName,
        convertedFileName,
        fileType,
        userName,
        fullName,
        jobResult,
        timeStamp,
        fileSize,
        pdfSize,
        downloadUrl
    }
    return job;
}

const handleFileConvert = async (req, res) => {
    try {
        const username = req.user ? req.user.username : 'anonymous';
        const file = req.app.locals.uploadedFiles?.get(username);
        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        console.log('Processing file:', file.originalname, 'Size:', file.size);

        const fileName = file.originalname;
        const convertedFileName = fileName.replace(/\.(html|md|docx)$/, '.pdf');
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

        const conversionsDir = path.join(__dirname, '../conversions');
        if (!fs.existsSync(conversionsDir)) {
            fs.mkdirSync(conversionsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const uniquePdfName = `${req.user.username}_${fileExtension}_${timestamp}.pdf`;
        const pdfPath = path.join(conversionsDir, uniquePdfName);
        fs.writeFileSync(pdfPath, pdfBuffer);

        // Create job record BEFORE sending response
        try {
            const username = req.user ? req.user.username : 'anonymous';
            const fullName = req.user ? req.user.fullName : 'anonymous';
            const job = createJob(
                `${username}-${fileExtension}-${Date.now()}`,
                fileName,
                convertedFileName,
                fileExtension,
                username,
                fullName,
                'success',
                new Date().toISOString(),
                file.size,
                pdfBuffer.length,
                `/api/file/download/${uniquePdfName}`
            );
            jobs.jobs.push(job);

            // Write to jobs.json file
            fs.writeFileSync(path.join(__dirname, '../jobs.json'), JSON.stringify(jobs, null, 2));
        } catch (jobError) {
            console.error('Job creation error:', jobError);
            // Don't fail the conversion if job creation fails
        }

        res.json({
            message: "File converted successfully",
            jobId: `${username}-${fileExtension}-${timestamp}`,
            originalFile: fileName,
            convertedFile: convertedFileName,
            downloadUrl: `/api/file/download/${uniquePdfName}`,
            fileSize: pdfBuffer.length
        })

    } catch (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({
            message: "Conversion failed",
            error: error.message
        });
    }
};

module.exports = { handleFileConvert };