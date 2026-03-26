import express from 'express'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'
import { notifyClientCreated } from '../utils/notificationHelper.js'

const router = express.Router()

// GET /api/users - Listar usuarios
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, '-password')
    res.json(users)
  } catch (error) {
    console.error('[Users] Error listando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/users - Crear usuario (solo admin)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Campos requeridos: name, email, password, role' })
    }
    
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'Email ya registrado' })
    }
    
    const user = new User({
      name,
      email,
      password,
      role,
      phone: phone || '',
      avatar: name.charAt(0).toUpperCase()
    })
    
    await user.save()
    
    // Crear conversación si es cliente
    if (role === 'client') {
      const admin = await User.findOne({ role: 'admin' })
      if (admin) {
        await Conversation.create({
          clientId: user._id,
          lawyerId: admin._id
        })
        
        // 🔔 NOTIFICAR AL ADMIN
        await notifyClientCreated(
          admin._id.toString(),
          name,
          email,
          user._id.toString(),
          '/admin/clientes'
        )
      }
    }
    
    console.log(`[Users] Usuario creado: ${email}`)
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('[Users] Error creando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, phone, password } = req.body
    const updateData = {}
    
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (password) updateData.password = password
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: '-password' }
    )
    
    console.log(`[Users] Usuario actualizado: ${user.email}`)
    
    res.json({ success: true, user })
  } catch (error) {
    console.error('[Users] Error actualizando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    await Conversation.deleteMany({ $or: [{ clientId: req.params.id }, { lawyerId: req.params.id }] })
    
    console.log(`[Users] Usuario eliminado: ${user.email}`)
    
    res.json({ success: true })
  } catch (error) {
    console.error('[Users] Error eliminando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
