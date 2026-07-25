import Owner from '../models/owner.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existingOwner = await Owner.findOne({ email })
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const owner = await Owner.create({ name, email, password: hashedPassword })
    const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({
      message: 'Owner registered successfully',
      token,
      owner: { id: owner._id, name: owner.name, email: owner.email }
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

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const owner = await Owner.findOne({ email })
    if (!owner) {
      return res.status(404).json({ message: 'Email not found' })
    }
    const resetToken = crypto.randomBytes(32).toString('hex')
    owner.resetToken = resetToken
    owner.resetTokenExpiry = Date.now() + 3600000
    await owner.save()

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    const transporter = getTransporter()

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: owner.email,
      subject: 'ShopCard - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background:#22c55e;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `
    })

    res.json({ message: 'Reset link sent to your email!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body
    const owner = await Owner.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    })
    if (!owner) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }
    owner.password = await bcrypt.hash(password, 10)
    owner.resetToken = undefined
    owner.resetTokenExpiry = undefined
    await owner.save()
    res.json({ message: 'Password reset successful!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}