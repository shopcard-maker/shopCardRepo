import express from 'express'
import { adminLogin, getAllOwners, updateOwner, deleteOwner } from '../controllers/adminController.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/login', adminLogin)
router.get('/owners', adminAuth, getAllOwners)
router.put('/owners/:id', adminAuth, updateOwner)
router.delete('/owners/:id', adminAuth, deleteOwner)

export default router
