const express = require('express');
require("dotenv").config();
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const PORT = 3000 || process.env.PORT
const MONGO_URI = process.env.MONGODB_URI
const authRouter = require('./routes/auth.route');
const fileRouter = require('./routes/file.route');
const bodyParser = require('body-parser');
// Use the PDF routes

mongoose.set('strictQuery', false);


// connecting mongo with server
mongoose.connect(MONGO_URI,{
    dbName : process.env.DB_NAME,
    useNewUrlParser: true, 
    useUnifiedTopology: true  
}).then(()=>{
    console.log('connected!!');
    app.listen(PORT,()=>console.log(`running on port ${PORT}`));
}).catch((err)=>console.log(err.message))

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


app.use('/api', fileRouter);
app.use('/api/auth', authRouter);