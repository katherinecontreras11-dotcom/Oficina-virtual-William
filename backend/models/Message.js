import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  from: { type: String, enum: ['client', 'lawyer'], required: true },
  text: { type: String, required: true },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  sentAt: { type: Date, default: Date.now }
})

export default mongoose.model('Message', messageSchema)
