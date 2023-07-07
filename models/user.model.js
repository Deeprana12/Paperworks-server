// models/User.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Timestamp } = require('mongodb');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },    
    tokens:[{
        token:{
          type: String,
          required: true
        }
    }]        
}, Timestamp);

userSchema.methods.toJSON = function () {
  const user = this
  const userObj = user.toObject()
  delete userObj.password
  delete userObj.tokens
  return userObj  
}

userSchema.methods.generateAuthToken = async function () {  
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY, { expiresIn: '15d' });
  user.tokens = user.tokens.concat({ token })  
  await user.save()
  return token
} 
 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('User Not Exist')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

const User = mongoose.model('User', userSchema);
module.exports = User;
