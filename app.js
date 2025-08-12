const express = require('express');
const path = require('path');
const env = require('dotenv');
const { handleFileUpload } = require('./src/middleware/fileUpload');
const app = express();

env.config();

app.use(express.json());

app.get('/', (req,res) => {
    res.json({message: 'Document Converter Application is running!'});
});

app.post('/upload', handleFileUpload, (req, res) => {
    const file = req.file;
    const filePath = path.join(__dirname, 'uploads', file.filename);
    res.json({
        message: 'File uploaded successfully',
        fileName: file.filename,
        mimeType: file.mimetype,
        filePath: filePath,
        fileSize: file.size
    });
})

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
