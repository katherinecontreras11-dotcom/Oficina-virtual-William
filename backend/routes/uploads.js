import express from 'express'
import multer from 'multer'
import { verifyToken } from '../middleware/auth.js'
import User from '../models/User.js'
import {
  uploadPdfBuffer,
  getSignedPdfUrl,
  uploadAvatarBuffer,
  deleteImageFromCloudinary
} from '../utils/cloudinary.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
})

const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp']

router.post('/pdf', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' })
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Solo se aceptan archivos PDF' })
    }

    const uploaded = await uploadPdfBuffer(req.file.buffer, req.file.originalname)

    return res.json({
      success: true,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        uploadedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[Uploads] Error uploading PDF:', error.message)
    return res.status(500).json({ error: 'Error subiendo archivo a la nube' })
  }
})

router.get('/pdf-link', verifyToken, async (req, res) => {
  try {
    const { publicId, attachment } = req.query

    if (!publicId) {
      return res.status(400).json({ error: 'publicId es requerido' })
    }

    const signedUrl = getSignedPdfUrl(publicId, {
      attachment: String(attachment).toLowerCase() === 'true'
    })

    return res.json({ success: true, url: signedUrl })
  } catch (error) {
    console.error('[Uploads] Error generating signed PDF URL:', error.message)
    return res.status(500).json({ error: 'Error generando enlace de documento' })
  }
})

router.post('/avatar', verifyToken, uploadAvatar.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' })
    }

    if (!ALLOWED_AVATAR_MIMES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Formato no permitido. Usa JPG, PNG o WEBP' })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const uploaded = await uploadAvatarBuffer(req.file.buffer, req.user.id)
    const previousPublicId = user.avatarPublicId

    user.avatar = uploaded.secure_url
    user.avatarPublicId = uploaded.public_id
    await user.save()

    if (previousPublicId && previousPublicId !== uploaded.public_id) {
      await deleteImageFromCloudinary(previousPublicId)
    }

    const safeUser = user.toObject()
    delete safeUser.password

    return res.json({
      success: true,
      user: safeUser,
      avatar: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
      }
    })
  } catch (error) {
    console.error('[Uploads] Error uploading avatar:', error.message)
    return res.status(500).json({ error: 'Error subiendo avatar' })
  }
})

router.delete('/avatar', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.avatarPublicId) {
      await deleteImageFromCloudinary(user.avatarPublicId)
    }

    user.avatarPublicId = ''
    user.avatar = user.name?.charAt(0)?.toUpperCase() || 'U'
    await user.save()

    const safeUser = user.toObject()
    delete safeUser.password

    return res.json({ success: true, user: safeUser })
  } catch (error) {
    console.error('[Uploads] Error deleting avatar:', error.message)
    return res.status(500).json({ error: 'Error eliminando avatar' })
  }
})

export default router
