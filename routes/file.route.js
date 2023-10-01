const express = require('express');
const router = express.Router();
const pdfController = require('../controller/file.controller');
const commentController = require('../controller/comment.controller');
const auth = require('../middleware/auth');

// Route: Upload a PDF file
router.post('/pdf/upload', auth, pdfController.uploadPdf);

// Route: Get all PDFs
router.get('/pdf/all', pdfController.getAllPdfs);

// Route: Get a specific PDF by ID
router.get('/pdf/:id', pdfController.getPdfById);

// Route: Fetch shared PDFs
router.get('/sharedpdf', auth, pdfController.getSharedPdf);

// Route : Fetch Own PDFs
router.get('/mypdf', auth, pdfController.getMyPdf);

// Route: Delete a specific PDF by ID
router.delete('/pdf/:id', auth, pdfController.deletePdfById);

// Route: Share a file 
router.post('/pdf/share/:id', auth, pdfController.sharePdfById)

// Route: Adding comment to file
router.post('/pdf/comments/:pdfId', auth, commentController.addParentComment);

// Route: Adding reply comment to perticular file
router.post('/pdf/:pdfId/comments/:parentId/replies', auth, commentController.addReplyComment)

// Route: getting all comments for perticular pdf file
router.get('/pdf/comments/:pdfId', commentController.getAllComments);

// Route: deleting the comment
router.delete('/pdf/:pdfId/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;


module.exports = router;
