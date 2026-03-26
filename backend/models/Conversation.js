import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unreadClient: { type: Number, default: 0 },
  unreadLawyer: { type: Number, default: 0 },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Conversation', conversationSchema)
