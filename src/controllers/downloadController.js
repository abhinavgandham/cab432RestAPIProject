const fs = require('fs');
const path = require('path');

const download = async (req, res) => {
    try {
        const { filename } = req.params;

        const conversionsDir = path.join(__dirname, '../conversions');
        const filePath = path.join(conversionsDir, filename);

        console.log('Download request for filename:', filename);
        console.log('Conversions directory:', conversionsDir);
        console.log('Full file path:', filePath);
        console.log('File exists:', fs.existsSync(filePath));

        // List all files in the conversions directory for debugging
        try {
            const files = fs.readdirSync(conversionsDir);
            console.log('Files in conversions directory:', files);
        } catch (dirError) {
            console.log('Error reading conversions directory:', dirError);
        }

        if (!fs.existsSync(filePath)) {
            console.log('File not found at:', filePath);
            return res.status(404).json({ message: "File not found" });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({
            message: "Error downloading file",
            error: error.message
        });
    }
}

module.exports = { download }