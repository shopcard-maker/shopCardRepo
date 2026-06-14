import mongoose from 'mongoose'

const ownerSchema = new mongoose.Schema({
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
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  }
}, { timestamps: true })

export default mongoose.model('Owner', ownerSchema)