const express = require('express');
const { upload } = require('../controllers/uploadController');
const { convertFile } = require('../controllers/conversionController');
const { handleFileUpload } = require('../middleware/fileUpload');

const router = express.Router();

router.post('/upload', handleFileUpload, upload);
router.post('/convert', handleFileUpload, convertFile);

module.exports = router;