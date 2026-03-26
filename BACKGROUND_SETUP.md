# 🎨 Configuración de Background Profesional

## Instrucciones para Agregar Imagen de Fondo

El Landing page ahora tiene un estilo premium con background gradient, pero puedes personalizarlo con tu propia imagen de fondo.

### **1. Preparar la Imagen**

Crea una imagen de fondo con estas características:
- **Dimensiones**: 1280 x 714 px (mínimo)
- **Formato**: JPG, PNG o WebP
- **Peso**: Menor a 200KB (optimizar para web)
- **Estilo**: Profesional, elegante, con tonos que complemente la paleta de colores

**Paleta de Colores del Sitio:**
- Azul oscuro: `#1a3a5c`
- Morado: `#3b2752`
- Dorado: `#d4a74a`
- Blanco: `#ffffff`

### **2. Guardar la Imagen**

```
src/
├── assets/
│   └── backgrounds/
│       └── hero-bg.jpg  ← Tu imagen aquí
```

Crea la carpeta `src/assets/backgrounds/` si no existe.

### **3. Actualizar el CSS**

En `src/pages/Landing.css`, cambia la línea del `.hero-bg`:

**Opción A: Reemplazar el gradient con imagen**
```css
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(135deg, rgba(26, 58, 92, 0.7) 0%, rgba(59, 39, 82, 0.7) 100%),
    url('/src/assets/backgrounds/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;
}
```

**Opción B: Imagen con efecto overlay**
```css
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(135deg, rgba(26, 58, 92, 0.75) 0%, rgba(59, 39, 82, 0.75) 100%),
    url('/src/assets/backgrounds/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;
}
```

### **4. Alternativa: Usar un Gradiente Personalizado**

Si prefieres un gradiente premium sin imagen:

```css
.hero-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 80% 20%, rgba(212, 167, 74, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 20% 80%, rgba(100, 150, 200, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #1a3a5c 0%, #3b2752 100%);
  background-attachment: fixed;
  z-index: 0;
}
```

### **5. Efectos Disponibles**

El CSS actual ya incluye:
- ✅ Animación de movimiento sutil del background
- ✅ Hover effects en todas las cards
- ✅ Botones con efecto gradient y sombra
- ✅ Transiciones suaves (0.3s)
- ✅ Efectos de brillo al pasar el mouse
- ✅ Tarjetas con blur/glassmorphism

### **6. Colores Base Personalizables**

En el CSS, puedes cambiar los colores principales:

```css
/* Colores Primarios */
--primary-600: #1a3a5c;  /* Azul oscuro */
--primary-800: #3b2752;  /* Morado */

/* Colores de Acento */
--accent-400: #d4a74a;   /* Dorado */
--accent-600: #c19a3b;   /* Dorado oscuro */
```

### **7. Optimizaciones CSS Aplicadas**

✨ **Nuevos Estilos Premium:**
- Glassmorphism (efecto vidrio) en hero-cards
- Shimmer effect (brillo) en service-cards
- Scale + Blur transitions en hover
- Sombras con profundidad multi-capa
- Gradientes en textos e iconos

### **8. Recursos Recomendados**

- **Imágenes Gratuitas**: Unsplash, Pexels, Pixabay
- **Palabras clave**: "professional background", "office", "legal", "justice"
- **Herramienta de optimización**: TinyPNG, ImageOptim

---

¡Tu Landing page ahora tiene un look 100% profesional y elegante! 🚀
