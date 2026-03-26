import { useState, useEffect } from 'react'
import { Send, Paperclip, Trash2, CheckSquare } from 'lucide-react'
import { useApp } from '../../context/useApp'
import '../client/Dashboard.css'

export default function AdminMessages() {
  const { conversations, messages, sendMessage, deleteMessages, users, user } = useApp()
  const [activeConv, setActiveConv] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const [isDeletingMode, setIsDeletingMode] = useState(false)
  const [selectedMsgs, setSelectedMsgs] = useState([])

  const activeConversation = conversations.find(c => c.id === activeConv)
  const currentMessages = messages[activeConv] || []

  const getOppositeUser = (conv) => conv ? users.find(u => u.id === conv.clientId) : null

  const oppositeUser = getOppositeUser(activeConversation)

  useEffect(() => {
    if (conversations.length === 0) return
    if (!activeConv || !conversations.some(c => c.id === activeConv)) {
      setActiveConv(conversations[0].id)
    }
  }, [conversations, activeConv])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    sendMessage(activeConv, newMsg, 'lawyer')
    setNewMsg('')
  }

  // Helper to get last message text for preview
  const getLastMessageText = (convId) => {
    const list = messages[convId]
    if (!list || list.length === 0) return 'Sin mensajes'
    return list[list.length - 1].text || list[list.length - 1].message || list[list.length - 1].content || 'Sin mensaje'
  }

  const toggleSelect = (id) => {
    setSelectedMsgs(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = async () => {
    if (selectedMsgs.length > 0) {
      const result = await deleteMessages(activeConv, selectedMsgs)
      setSelectedMsgs([])
      setIsDeletingMode(false)
      if (!result?.success) {
        alert(`No se pudieron eliminar ${result.failedCount} mensaje(s). Intenta de nuevo.`)
      }
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandeja de Entrada</h1>
          <p className="page-subtitle">Comunicaciones directas con sus clientes.</p>
        </div>
      </div>

      <div className="messages-layout card">
        {/* Conversations List */}
        <div className="conv-list">
          {conversations.map(c => {
            const oppUser = getOppositeUser(c)
            return (
              <div
                key={c.id}
                className={`conv-item ${activeConv === c.id ? 'active' : ''}`}
                onClick={() => setActiveConv(c.id)}
              >
                <div className="conv-avatar" style={oppUser?.avatar?.length > 10 ? { backgroundImage: `url(${oppUser.avatar})`, backgroundSize: 'cover', color: 'transparent' } : {}}>
                  {oppUser?.avatar?.length <= 10 && oppUser?.avatar}
                </div>
                <div className="conv-info">
                  <div className="conv-name-row">
                    <span className="conv-name">{oppUser?.name}</span>
                    <span className="conv-time">{c.time}</span>
                  </div>
                  <p className="conv-preview">{getLastMessageText(c.id)}</p>
                </div>
                {c.unreadLawyer > 0 && <span className="conv-unread">{c.unreadLawyer}</span>}
              </div>
            )
          })}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div className="conv-avatar" style={oppositeUser?.avatar?.length > 10 ? { backgroundImage: `url(${oppositeUser.avatar})`, backgroundSize: 'cover', color: 'transparent' } : {}}>
                  {oppositeUser?.avatar?.length <= 10 && oppositeUser?.avatar}
              </div>
              <div>
                <span className="conv-name">{oppositeUser?.name}</span>
                <span className="chat-status">Cliente asociado</span>
              </div>
            </div>

            <div className="chat-header-actions">
              {isDeletingMode ? (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setIsDeletingMode(false); setSelectedMsgs([]); }}>Cancelar</button>
                  <button className="btn btn-error btn-sm" onClick={handleDeleteSelected} disabled={selectedMsgs.length === 0}>
                    <Trash2 size={16} /> Eliminar {selectedMsgs.length > 0 ? `(${selectedMsgs.length})` : ''}
                  </button>
                </>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setIsDeletingMode(true)}>
                  <CheckSquare size={16} /> Seleccionar Mensajes
                </button>
              )}
            </div>
          </div>

          <div className="chat-messages">
            {currentMessages.length === 0 ? (
              <p className="text-center" style={{padding: '2rem'}}>No hay historial de mensajes.</p>
            ) : currentMessages.map((m) => (
              <div key={m.id} className={`chat-bubble-wrapper ${m.from === 'lawyer' ? 'align-right' : 'align-left'}`} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexDirection: m.from === 'lawyer' ? 'row-reverse' : 'row' }}>
                {isDeletingMode && (
                  <input 
                    type="checkbox" 
                    checked={selectedMsgs.includes(m.id)} 
                    onChange={() => toggleSelect(m.id)} 
                    style={{cursor: 'pointer', flexShrink: 0}}
                  />
                )}
                {/* Notice the CSS classes swap: from perspective of lawyer, their own messages are aligned right ('client' class logic in CSS) and client messages left ('lawyer' class logic). */}
                <div className={`chat-bubble ${m.from === 'lawyer' ? 'client' : 'lawyer'}`} style={{margin: 0}}>
                  <p>{m.text || m.message || m.content || ''}</p>
                  <span className="chat-time">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {!isDeletingMode && <form className="chat-input" onSubmit={handleSendMessage}>
            <button type="button" className="btn btn-ghost btn-sm"><Paperclip size={18} /></button>
            <input
              type="text"
              className="form-input"
              placeholder="Responder al cliente..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm"><Send size={18} /></button>
          </form>}
        </div>
      </div>
    </div>
  )
}

