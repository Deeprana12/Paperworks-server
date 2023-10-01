const {Pdf} = require('../models/file.model');
const {Comment} = require('../models/file.model')
const getError = require('../utils/dbErrorHandler')
const { CommentContent } = require('../models/file.model');
const User = require('../models/user.model')

const findUserIdByUsername = async (username) => {
    const userObjId = await User.find({name:username})    
    return userObjId[0]._id
}

const createComment = async (commentContent) => {
    const commentObjects = [];
    const regex = /@(\w+)/g;
    let currentIndex = 0;
    let match;
  
    while ((match = regex.exec(commentContent))) {
      const username = match[1];
      const userId = await findUserIdByUsername(username);
  
      // Add the text content before the mention
      if (currentIndex !== match.index) {
        const textContent = commentContent.slice(currentIndex, match.index);
        commentObjects.push({ type: 'text', value: textContent });
      }
  
      // Add the mention content
      commentObjects.push({ type: 'mention', value: username, userId });
  
      // Update the currentIndex
      currentIndex = match.index + match[0].length;
    }
  
    // Add any remaining text after the last mention (if any)
    if (currentIndex < commentContent.length) {
      const remainingText = commentContent.slice(currentIndex);
      commentObjects.push({ type: 'text', value: remainingText });
    }      
    return commentObjects;
  };
  ;    

module.exports = {
    addParentComment: async (req, res) => {
        try {
          const { pdfId } = req.params;
          const { content } = req.body;
          const author = req.user.name;
    
          // Save modifiedComment in CommentContent collection
          const contentValue = await createComment(content)    
          // Create the parent comment
          const parentComment = new Comment({
            author, 
            content: contentValue, // Save the reference to the CommentContent document
          });
          const savedParentComment = await parentComment.save();                  

          const pdf = await Pdf.findById(pdfId);
          pdf.comments.push(savedParentComment);          
          await pdf.save();
    
          res.status(201).json(savedParentComment);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server Error' });
        }
      },
    
          
    addReplyComment : async (req, res) => {        
        try {
            const { pdfId, parentId } = req.params;
            const {content} = req.body;
            const author = req.user.name
        
            // Create the reply comment
            const reply = new Comment({
              author,
              content,
              parentComment:pdfId
            });
            const savedReply = await reply.save();
        
            // Find the parent comment by ID and add the reply to its replies array
            const parentComment = await Comment.findById(parentId);
            parentComment.replies.push(savedReply);
            await parentComment.save();
        
            res.status(201).json(savedReply);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
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
