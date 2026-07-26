import express from 'express'
import { adminLogin, getAllOwners, createOwner, updateOwner, setOwnerStatus, deleteOwner } from '../controllers/adminController.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/login', adminLogin)
router.get('/owners', adminAuth, getAllOwners)
router.post('/owners', adminAuth, createOwner)
router.put('/owners/:id', adminAuth, updateOwner)
router.patch('/owners/:id/status', adminAuth, setOwnerStatus)
router.delete('/owners/:id', adminAuth, deleteOwner)

export default router
