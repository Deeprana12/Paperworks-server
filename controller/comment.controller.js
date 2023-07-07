const Pdf = require('../models/file.model');
const getError = require('../utils/dbErrorHandler')

module.exports = {
    addComment : async (req, res) => {
        try {
            const { pdfId } = req.params;
            const { content } = req.body;            
            const author = req.user.name;

            const pdf = await Pdf.findById(pdfId);

            if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
            }

            const comment = {
                author,
                content
            };

            pdf.comments.push(comment);
            await pdf.save();

            res.status(201).json({ message: 'Comment added successfully', comment });
        } catch (error) {
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Something went wrong"
            })
        }
    },

    // Get all comments for a PDF
    getAllComments : async (req, res) => {
        try {
            const { pdfId } = req.params;

            const pdf = await Pdf.findById(pdfId)

            if (!pdf) {
                return res.status(404).json({ error: 'PDF not found' });
            }            

            res.status(200).json({ comments: pdf.comments });
        } catch (error) {
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Something went wrong"
            })
        }
    },

    // Delete a comment from a PDF
    deleteComment : async (req, res) => {
        try {
            const { pdfId, commentId } = req.params;

            const pdf = await Pdf.findById(pdfId);

            if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
            }

            const commentIndex = pdf.comments.findIndex((comment) => comment._id.toString() === commentId);

            if (commentIndex === -1) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            pdf.comments.splice(commentIndex, 1);
            await pdf.save();

            res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (error) {
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Something went wrong"
            })
        }
    }
}
