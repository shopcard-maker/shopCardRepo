import express from 'express'
import {
  createShop,
  getMyShop,
  updateShop,
  addProduct,
  deleteProduct,
  getShopBySlug,
  recordVisit
} from '../controllers/shopController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Protected routes (owner login chahiye)
router.post('/create', authMiddleware, createShop)
router.get('/my', authMiddleware, getMyShop)
router.put('/update', authMiddleware, updateShop)
router.post('/product/add', authMiddleware, addProduct)
router.delete('/product/:productId', authMiddleware, deleteProduct)

// Public route (customer page)
router.post('/:slug/visit', recordVisit)
router.get('/:slug', getShopBySlug)

export default router