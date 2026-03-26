import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error('[Auth] Token inválido:', error.message)
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admin puede realizar esta acción' })
  }
  next()
}
