import Owner from '../models/owner.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existingOwner = await Owner.findOne({ email })
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await Owner.create({ name, email, password: hashedPassword })
    res.status(201).json({
      message: 'Registered! Your account is pending admin approval — you will be able to login once approved.'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const owner = await Owner.findOne({ email })
    if (!owner) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const isMatch = await bcrypt.compare(password, owner.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    if (!owner.isActive) {
      return res.status(403).json({ message: 'Your account is pending admin approval' })
    }
    const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      message: 'Login successful',
      token,
      owner: { id: owner._id, name: owner.name, email: owner.email }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Reset Password (email + new password, no email verification)
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    const owner = await Owner.findOne({ email })
    if (!owner) {
      return res.status(404).json({ message: 'Email not found' })
    }
    owner.password = await bcrypt.hash(password, 10)
    await owner.save()
    res.json({ message: 'Password reset successful!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}