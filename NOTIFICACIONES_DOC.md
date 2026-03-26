# 🔔 Sistema de Notificaciones - Documentación

## Descripción General

Se ha implementado un sistema completo de notificaciones con:
- ✅ Backend: Modelo Notification en MongoDB + rutas API
- ✅ Frontend: Componentes visuales + polling cada 5 segundos
- ✅ Real-time: Notificaciones actualizadas automáticamente
- ✅ Persistencia: Historial completo en BD

## Elementos Implementados

### Backend (/backend)

#### Modelo: Notification.js
```javascript
{
  userId: String,        // ID del usuario que recibe
  type: String,          // 'message', 'appointment', 'case', 'client_created', 'client_updated'
  title: String,         // Título corto (ej: "Nuevo Mensaje")
  message: String,       // Descripción completa
  relatedId: String,     // ID del recurso (mensaje, cita, caso)
  read: Boolean,         // Estado de lectura
  icon: String,          // Nombre del ícono Lucide React
  actionUrl: String,     // URL a donde navegar al hacer click
  createdAt: Date,       // Fecha de creación
  updatedAt: Date        // Fecha de actualización
}
```

#### Rutas API (/backend/routes/notifications.js)

**GET `/api/notifications`**
- Parámetro: `unreadOnly=true|false`
- Retorna: Lista de notificaciones + contador de no leídas
- Uso: En polling cada 5 segundos

**PUT `/api/notifications/:id/read`**
- Marca una notificación como leída
- Retorna: Notification actualizada

**PUT `/api/notifications/read/all`**
- Marca TODAS las notificaciones no leídas como leídas
- Retorna: Contador de modificadas

**DELETE `/api/notifications/:id`**
- Elimina una notificación
- Retorna: Mensaje de éxito

**DELETE `/api/notifications/clear/read`**
- Elimina TODAS las notificaciones leídas
- Retorna: Contador de eliminadas

### Frontend

#### AppContext (src/context/AppContext.jsx)

**Estados agregados:**
```javascript
const [notifications, setNotifications] = useState([])
const [unreadCount, setUnreadCount] = useState(0)
```

**Polling implementado:**
```javascript
useEffect(() => {
  if (!user) return
  
  const fetchNotifications = async () => {
    const result = await getNotificationsAPI()
    setNotifications(result.notifications)
    setUnreadCount(result.unreadCount)
  }
  
  fetchNotifications()
  const interval = setInterval(fetchNotifications, 5000) // Cada 5 segundos
  return () => clearInterval(interval)
}, [user])
```

**Funciones públicas:**
- `markNotificationAsRead(notificationId)` - Marca como leída
- `markAllNotificationsAsRead()` - Marca todas como leídas
- `deleteNotification(notificationId)` - Elimina una notificación

#### Componentes

**NotificationBell.jsx**
- Botón con ícono de campana
- Badge rojo mostrando número de no leídas
- Se integra en TopBar

**NotificationCenter.jsx**
- Panel deslizable desde la derecha
- Lista de todas las notificaciones
- Acciones: marcar como leída, eliminar
- Navegación a recurso relacionado
- Botón "Marcar todas como leídas"

**Toast.jsx** (No implementado automáticamente aún)
- Notificación emergente temporal
- Aparece en esquina inferior izquierda
- Se auto-cierra después de 4 segundos

#### API Service (src/services/apiService.js)

Funciones agregadas:
```javascript
export const getNotificationsAPI = (unreadOnly = false)
export const markNotificationReadAPI = (id)
export const markAllNotificationsReadAPI = ()
export const deleteNotificationAPI = (id)
export const clearReadNotificationsAPI = ()
```

## Cómo Crear Notificaciones desde Backend

Cuando ocurra un evento (nuevo mensaje, cita, etc.), llamar a `createNotification`:

```javascript
import { createNotification } from '../routes/notifications.js'

// Ejemplo 1: Nuevo mensaje
await createNotification(
  clientId,                    // userId
  'message',                   // type
  'Nuevo Mensaje',            // title
  `${lawyerName} te envió: "${messageText.substring(0, 50)}..."`,  // message
  messageId,                   // relatedId
  `/cliente/mensajes`,         // actionUrl
  'Mail'                       // icon
)

// Ejemplo 2: Nueva cita
await createNotification(
  clientId,
  'appointment',
  'Nueva Cita Agendada',
  `Cita el ${date} a las ${time}`,
  appointmentId,
  `/cliente/citas`,
  'Calendar'
)

// Ejemplo 3: Cambio en caso
await createNotification(
  clientId,
  'case',
  'Expediente Actualizado',
  `El caso "${caseTitle}" ha sido actualizado`,
  caseId,
  `/cliente/expedientes`,
  'FileText'
)
```

## Integración en Rutas Existentes

Deben actualizarse estas rutas para crear notificaciones cuando ocurren eventos:

### `/backend/routes/messages.js`
Al crear un mensaje, enviar notificación al receptor:
```javascript
if (result.success) {
  await createNotification(
    conversationId.to,
    'message',
    'Nuevo Mensaje',
    newMessage.text.substring(0, 50),
    newMessage.id,
    '/mensajes',
    'Mail'
  )
}
```

### `/backend/routes/appointments.js`
Al crear/actualizar cita:
```javascript
await createNotification(
  appointmentClientId,
  'appointment',
  'Cita Actualizada',
  `Cita reprogramada para ${newDate}`,
  appointmentId,
  '/citas',
  'Calendar'
)
```

### `/backend/routes/cases.js` (próximo paso)
Al crear/actualizar caso.

## Cómo Funciona el Flujo

1. **Usuario inicia sesión** → AppContext lo detecta
2. **useEffect inicia polling** → Llama getNotificationsAPI() cada 5s
3. **Backend recibe request** → Busca notificaciones no leídas + cuenta total
4. **Frontend actualiza state** → `notifications` y `unreadCount`
5. **UI re-renderiza** → Badge muestra count, NotificationCenter muestra lista
6. **Usuario hace click en Bell** → Abre NotificationCenter
7. **Usuario hace click en notificación** → Se marca como leída + navega a recurso
8. **Usuario ve badge actualizado** → Count disminuye

## Estado Actual

✅ Backend completamente implementado
✅ Frontend completamente implementado
✅ AppContext con polling
✅ Componentes UI listos
⏭️ **Próximo paso**: Actualizar rutas de messages, appointments, cases para crear notificaciones

## Testing

Para probar manualmente:

1. Entrar a MongoDB Compass
2. Crear documentos Notification en db.notifications:
```json
{
  "userId": "user_id",
  "type": "message",
  "title": "Test",
  "message": "Esto es una prueba",
  "read": false,
  "icon": "Mail",
  "createdAt": ISODate("2026-03-25T...")
}
```
3. Entrar a app, ver que el badge aparece
4. Hacer click en Bell para ver la notificación

## Iconos Disponibles (Lucide React)

- `Mail` - Mensajes
- `Calendar` - Citas
- `FileText` - Casos/Documentos
- `AlertCircle` - Alertas
- `CheckCircle2` - Confirmaciones
- `Bell` - Campana
- `Trash2` - Eliminaciones
