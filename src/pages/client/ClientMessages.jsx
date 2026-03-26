import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Edit2, X, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import '../client/Dashboard.css'

const ONE_HOUR_MS = 60 * 60 * 1000

export default function ClientMessages() {
  const { conversations, messages, sendMessage, editMessage, users, user } = useApp()
  const [activeConv, setActiveConv] = useState(1)
  const [newMsg, setNewMsg] = useState('')
  const [editingMsgId, setEditingMsgId] = useState(null)
  const [editText, setEditText] = useState('')
  const editInputRef = useRef(null)

  const userConversations = conversations.filter(c => c.clientId === user?.id)
  const activeConversation = userConversations.find(c => c.id === activeConv)
  const currentMessages = messages[activeConv] || []

  const getOppositeUser = (conv) => conv ? users.find(u => u.id === conv.lawyerId) : null
  const oppositeUser = getOppositeUser(activeConversation)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    sendMessage(activeConv, newMsg, 'client')
    setNewMsg('')
  }

  const getLastMessageText = (convId) => {
    const list = messages[convId]
    if (!list || list.length === 0) return 'Sin mensajes'
    return list[list.length - 1].text || list[list.length - 1].message || list[list.length - 1].content || 'Sin mensaje'
  }

  // Check if a message can be edited (own message, within 1 hour)
  const canEdit = (msg) => {
    if (msg.from !== 'client') return false
    const sentAt = msg.sentAt || msg.id // fallback to id (which is Date.now())
    return (Date.now() - sentAt) < ONE_HOUR_MS
  }

  const handleEditStart = (msg) => {
    setEditingMsgId(msg.id)
    setEditText(msg.text || msg.message || msg.content || '')
  }

  const handleEditCancel = () => {
    setEditingMsgId(null)
    setEditText('')
  }

  const handleEditSave = () => {
    if (!editText.trim()) return
    editMessage(activeConv, editingMsgId, editText.trim())
    setEditingMsgId(null)
    setEditText('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEditSave()
    }
    if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  useEffect(() => {
    if (editingMsgId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingMsgId])

  // Set active conversation to user's first conversation if it doesn't exist
  useEffect(() => {
    if (userConversations.length > 0 && !userConversations.find(c => c.id === activeConv)) {
      setActiveConv(userConversations[0].id)
    }
  }, [userConversations, activeConv])

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mensajes</h1>
          <p className="page-subtitle">Comunicación segura con su equipo legal.</p>
        </div>
      </div>

      <div className="messages-layout card">
        {/* Conversations List */}
        <div className="conv-list">
          {userConversations.map(c => {
            const oppUser = getOppositeUser(c)
            return (
              <div
                key={c.id}
                className={`conv-item ${activeConv === c.id ? 'active' : ''}`}
                onClick={() => setActiveConv(c.id)}
              >
                <div className="conv-avatar">{oppUser?.avatar}</div>
                <div className="conv-info">
                  <div className="conv-name-row">
                    <span className="conv-name">{oppUser?.name}</span>
                    <span className="conv-time">{c.time}</span>
                  </div>
                  <p className="conv-preview">{getLastMessageText(c.id)}</p>
                </div>
                {c.unreadClient > 0 && <span className="conv-unread">{c.unreadClient}</span>}
              </div>
            )
          })}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div className="conv-avatar">{oppositeUser?.avatar}</div>
              <div>
                <span className="conv-name">{oppositeUser?.name}</span>
                <span className="chat-status">En línea</span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {currentMessages.length === 0 ? (
              <p className="text-center" style={{padding: '2rem'}}>No hay historial de mensajes. Envíe un mensaje para iniciar el chat.</p>
            ) : currentMessages.map((m) => (
              <div key={m.id} className={`chat-bubble-wrapper ${m.from === 'client' ? 'align-right' : 'align-left'}`} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem', flexDirection: m.from === 'client' ? 'row-reverse' : 'row' }}>
                <div className={`chat-bubble ${m.from}`} style={{margin: 0, position: 'relative'}}>
                  {editingMsgId === m.id ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px'}}>
                      <input
                        ref={editInputRef}
                        type="text"
                        className="form-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        style={{fontSize: '0.875rem', padding: '0.4rem 0.6rem'}}
                      />
                      <div style={{display: 'flex', gap: '0.25rem', justifyContent: 'flex-end'}}>
                        <button className="btn btn-ghost btn-sm" onClick={handleEditCancel} style={{padding: '0.2rem 0.4rem'}} title="Cancelar">
                          <X size={14} />
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleEditSave} style={{padding: '0.2rem 0.4rem'}} title="Guardar">
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{m.text || m.message || m.content || ''}</p>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end'}}>
                        {m.edited && (
                          <span style={{fontSize: '0.65rem', opacity: 0.7, fontStyle: 'italic'}}>modificado</span>
                        )}
                        <span className="chat-time">{m.time}</span>
                      </div>
                    </>
                  )}
                </div>
                {/* Edit button - only for own messages within 1 hour */}
                {m.from === 'client' && canEdit(m) && editingMsgId !== m.id && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleEditStart(m)}
                    title="Editar mensaje"
                    style={{padding: '0.2rem', opacity: 0.5, transition: 'opacity 0.2s'}}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                  >
                    <Edit2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <button type="button" className="btn btn-ghost btn-sm"><Paperclip size={18} /></button>
            <input
              type="text"
              className="form-input"
              placeholder="Escribir un mensaje..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm"><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  )
}
