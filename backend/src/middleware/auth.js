import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token — unauthorized' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.ownerId = decoded.id
    next()

  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export default authMiddleware