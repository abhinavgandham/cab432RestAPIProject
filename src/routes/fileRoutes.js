const express = require('express');
const { upload } = require('../controllers/uploadController');
const { handleFileUpload } = require('../middleware/fileUpload');

const router = express.Router();

router.post('/upload', handleFileUpload, upload);

module.exports = router;