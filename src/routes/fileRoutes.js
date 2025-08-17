const express = require('express');
const { upload } = require('../controllers/uploadController');
const { convertFile } = require('../controllers/conversionController');
const { handleFileUpload } = require('../middleware/fileUpload');
const { authenticateToken }= require('../middleware/auth');

const router = express.Router();

router.post('/upload', authenticateToken, handleFileUpload, upload);
router.post('/convert', authenticateToken, handleFileUpload, convertFile);

module.exports = router;