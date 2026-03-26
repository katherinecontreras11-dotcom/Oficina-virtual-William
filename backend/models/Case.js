import mongoose from 'mongoose'

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'closed', 'pending'], default: 'active' },
  priority: { type: String, enum: ['alta', 'media', 'baja'], default: 'media' },
  progress: { type: Number, default: 0 },
  date: { type: String, default: '' },
  description: { type: String, default: '' },
  clientDocuments: { type: Array, default: [] },
  lawyerDocuments: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Case', caseSchema)
