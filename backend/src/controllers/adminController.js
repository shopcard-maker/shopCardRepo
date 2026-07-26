import Owner from '../models/owner.js'
import Shop from '../models/shop.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: 'Invalid admin credentials' })
    }
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })
    res.json({ message: 'Admin login successful', token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new owner
export const createOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    const existingOwner = await Owner.findOne({ email })
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const owner = await Owner.create({ name, email, password: hashedPassword })
    res.status(201).json({ message: 'User created successfully', owner: { id: owner._id, name: owner.name, email: owner.email } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all registered owners
export const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find().select('name email createdAt').sort({ createdAt: -1 })
    res.json({ total: owners.length, owners })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update an owner (name / email / password)
export const updateOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const owner = await Owner.findById(req.params.id)
    if (!owner) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (name) owner.name = name
    if (email) owner.email = email
    if (password) owner.password = await bcrypt.hash(password, 10)
    await owner.save()
    res.json({ message: 'User updated successfully', owner: { id: owner._id, name: owner.name, email: owner.email } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete an owner
export const deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndDelete(req.params.id)
    if (!owner) {
      return res.status(404).json({ message: 'User not found' })
    }
    await Shop.deleteMany({ owner: owner._id })
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
