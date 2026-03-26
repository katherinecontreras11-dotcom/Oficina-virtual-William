# 📸 Cargar Imagen de Fondo - Guía Actualizada

## ✅ Lo que he arreglado:

1. **CSS actualizado** - Ahora busca la imagen en la ruta correcta: `src/assets/backgrounds/hero-bg.jpg`
2. **Carpeta creada** - La carpeta `src/assets/backgrounds/` ya existe
3. **Servidor corriendo** - En `http://localhost:5174/`

---

## 🎯 Pasos para Cargar tu Imagen:

### Opción 1: Si ya tienes la imagen (RECOMENDADO)

```
1. Encuentra tu imagen (JPG, PNG o WebP)
2. Renómbrala a: hero-bg.jpg
3. Colócala en: src/assets/backgrounds/
   └── Ubicación completa: c:\Users\tranp_3bhil36\Desktop\Oficina-virtual-William\src\assets\backgrounds\hero-bg.jpg
4. Recarga el navegador (F5 o Ctrl+Shift+R para cache-busting)
```

### Opción 2: Si necesitas una imagen de prueba

Descarga una imagen profesional de alguno de estos sitios:
- **Unsplash**: https://unsplash.com/
- **Pexels**: https://pexels.com/
- **Pixabay**: https://pixabay.com/

Busca palabras clave: "office", "law", "justice", "professional"

**Requisitos:**
- Dimensiones mínimas: 1280 x 714 px
- Formato: JPG, PNG o WebP
- Peso: Menor a 200KB
- Estilo: Profesional, elegante

---

## 🔍 Dónde colocar la imagen:

```
Oficina-virtual-William/
└── src/
    └── assets/
        └── backgrounds/
            └── hero-bg.jpg  ← TU IMAGEN AQUÍ
```

---

## 🔧 CSS Configurado:

```css
.hero-bg {
  background-image: 
    linear-gradient(135deg, rgba(26, 58, 92, 0.75) 0%, rgba(59, 39, 82, 0.75) 100%),
    url('../assets/backgrounds/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
```

**Explicación:**
- Primer layer: Gradiente oscuro (overlay para contraste)
- Segundo layer: Tu imagen de fondo
- El overlay asegura que el texto sea legible

---

## ⚙️ Personalizar Opacidad del Overlay:

Si el overlay es muy oscuro o clara, puedes ajustar los valores `0.75`:

```css
/* Más oscuro (menos visible la imagen): */
rgba(26, 58, 92, 0.85) y rgba(59, 39, 82, 0.85)

/* Más claro (más visible la imagen): */
rgba(26, 58, 92, 0.60) y rgba(59, 39, 82, 0.60)
```

---

## 🚀 Recarga del Navegador:

Después de colocar la imagen:

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

Esto hace un **hard refresh** (limpia el cache) y carga la imagen nueva.

---

## ✨ Resultado Esperado:

Una Landing Page con:
- ✅ Imagen de fondo personalizada
- ✅ Overlay gradiente profesional
- ✅ Texto legible (contraste asegurado)
- ✅ Efecto profesional y elegante

---

## 📲 Servidor Activo:

- **Local**: http://localhost:5174/
- **Hot Reload**: Activo (cambios en vivo)

¡Simplemente coloca la imagen y recarga! 🎉
