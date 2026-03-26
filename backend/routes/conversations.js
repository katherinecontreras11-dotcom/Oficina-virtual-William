import express from 'express'
import Conversation from '../models/Conversation.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/conversations
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id
    
    const conversations = await Conversation.find({
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ]
    })
      .populate('clientId', 'name avatar email')
      .populate('lawyerId', 'name avatar email')
      .sort({ lastMessageTime: -1 })
    
    res.json(conversations)
  } catch (error) {
    console.error('[Conversations] Error listando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
