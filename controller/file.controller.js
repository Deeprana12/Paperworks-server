const Pdf = require('../models/file.model'); // Assuming you have defined the PDF model
const User = require('../models/user.model')
const nodemailer = require('nodemailer')
const getError = require('../utils/dbErrorHandler')

// const sendMail = async(name,email,token) => {
//   try {
      
//       const transporter = nodemailer.createTransport({
//           host : 'smtp.gmail.com',
//           port : 587,
//           secure : false,
//           requireTLS : true,
//           auth:{
//               user : process.env.EMAIL,
//               pass : process.env.PASSWORD
//           }
//       })

//       const mailOptions = {
//           from : process.env.EMAIL,
//           to: email,
//           subject : "Reset Password",
//           html : '<p> Hello' + name + 'Please copy the link <a href="http://127.0.0.1:3000/api/forget-password?token='+token+'"> & reset the password! </a>'
//       }

//       transporter.sendMail(mailOptions,function(error,info){
//           if(error){
//               console.log(error)
//           }else{
//               console.log("Mail has been sent!",info.response)
//           }
//       })

//   } catch (error) {
//       res.status(400).send({success:false,message:error.message});
//   }
// }

module.exports = {
  uploadPdf: async (req, res) => {
    try {
      const { filename, fileData } = req.body;
      const createdBy = req.user._id;

      const pdf = new Pdf({
        filename,
        fileData,
        createdBy,
      });

      await pdf.save();

      res.status(201).json({ message: 'PDF uploaded successfully', pdf });
    } catch (error) {
      let errMsg = getError(error)
      return res.status(400).json({
          error: true,
          message:  errMsg.length > 0 ? errMsg : "Something went wrong"
      })
    }
  },

  getAllPdfs: async (req, res) => {    
    try {
      const userId = req.user._id; // Assuming the user ID is available in the request      
      const pdfs = await Pdf.find({
        $or: [
          { sharedWith: userId },
          { createdBy: userId }
        ]
      });      
      res.json({ pdfs });
    } catch (error) {
      let errMsg = getError(error)
      return res.status(400).json({
          error: true,
          message:  errMsg.length > 0 ? errMsg : "Something went wrong"
      })
    }
  },

  getSharedPdf: async (req, res) => {
    try {
      const userId = req.user._id; // Assuming the user ID is available in the request      
      const pdfs = await Pdf.find({ sharedWith: userId });      
      res.json({ pdfs });
    } catch (error) {
      let errMsg = getError(error)
      return res.status(400).json({
          error: true,
          message:  errMsg.length > 0 ? errMsg : "Something went wrong"
      })
    }
  },

  getMyPdf: async (req, res) => {    
    try {
      const userId = req.user._id; // Assuming the user ID is available in the request      
      const pdfs = await Pdf.find({ createdBy: userId });      
      res.json({ pdfs });
    } catch (error) {
      let errMsg = getError(error)
      return res.status(400).json({
          error: true,
          message:  errMsg.length > 0 ? errMsg : "Something went wrong"
      })
    }
  },

  getPdfById: async (req, res) => {
    try {
      const pdfId = req.params.id;
      const pdf = await Pdf.findById(pdfId);

      const isContains = pdf.sharedWith.includes(req.user._id)

      if(!isContains){
        return res.status(403).json({message:"User doesn't have permission to access this file!"})
      }

      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      res.json({ pdf });
    } catch (error) {
      let errMsg = getError(error)
        return res.status(400).json({
            error: true,
            message:  errMsg.length > 0 ? errMsg : "Something went wrong"
        })
    }
  },

  deletePdfById: async (req, res) => {
    try {
      const pdfId = req.params.id;

      const pdf = await Pdf.findOneAndDelete({ _id: pdfId, createdBy: req.user._id });

      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      res.json({ message: 'PDF deleted successfully' });
    } catch (error) {
      let errMsg = getError(error)
        return res.status(400).json({
            error: true,
            message:  errMsg.length > 0 ? errMsg : "Something went wrong"
        })
    }
  },

  sharePdfById: async (req, res) => {
    try {

      const pdfId = req.params.id;
      const emailId = req.body.email;
      const file = await Pdf.findById(pdfId);
      
      // Check if the file exists
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const email = await User.findOne({email:emailId})

      if(!email){
        return res.status(404).json({ error: 'No User Found' });
      }
      
      const recipientUser = await User.findOne({ email: emailId });

      if(file.sharedWith.includes(recipientUser._id)){
          res.status(200).json({ message: 'PDF already shared with the user!' });
      }
      file.sharedWith.push(recipientUser._id);
      await file.save();

      // Create the email transporter
      const transporter = nodemailer.createTransport({
        host : 'smtp.gmail.com',
        port : 587,
        secure : false,
        requireTLS : true,
        auth:{
            user : process.env.EMAIL,
            pass : process.env.PASSWORD
        }
    })

      // Compose the email message
      const mailOptions = {
        from: process.env.EMAIL,
        to: emailId,
        subject: 'File Sharing Notification',
        text: `You have been shared a file: ${file.filename} from ${req.user.name}. You can access it using the following link: https://paperworks.netlify.app/dashboard/${file._id}`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
        console.log(error)
        let errMsg = getError(error)
        return res.status(400).json({
            error: true,
            message:  errMsg.length > 0 ? errMsg : "Something went wrong"
        })
    }
  }

};
