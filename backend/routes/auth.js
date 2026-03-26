import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    
    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log(`[Auth] Login exitoso: ${user.email}`)
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('[Auth] Error login:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
