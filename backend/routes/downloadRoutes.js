const express = require('express');
const { downloadChunk, downloadFile } = require('../controllers/fileController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/download-chunk/:chunkId', downloadChunk);
router.get('/download-file/:fileId', downloadFile);

module.exports = router;
