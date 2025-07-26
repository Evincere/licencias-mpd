# 🎨 Guía de Estilo - Sistema de Licencias MPD

## 📋 **Principios de Diseño**

### ✅ **DO - Hacer**
- ✅ Usar clases CSS centralizadas de `components.css`
- ✅ Aplicar colores semánticos según el contexto
- ✅ Mantener consistencia en espaciado y bordes
- ✅ Usar glassmorphism para elementos de interfaz
- ✅ Aplicar transiciones suaves (300ms)

### ❌ **DON'T - No hacer**
- ❌ Usar estilos inline complejos
- ❌ Crear colores personalizados fuera del sistema
- ❌ Mezclar diferentes sistemas de espaciado
- ❌ Usar transiciones muy rápidas (<150ms) o lentas (>500ms)

## 🎯 **Colores Semánticos**

### **Verde (Success)**
- **Uso**: Aprobaciones, confirmaciones, éxito, creación
- **Clases**: `.btn-success`, `.card-success`, `.badge-success`, `.text-success`

### **Rojo (Danger)**
- **Uso**: Rechazos, errores, eliminación, alertas críticas
- **Clases**: `.btn-danger`, `.card-danger`, `.badge-danger`, `.text-danger`

### **Amarillo (Warning)**
- **Uso**: Pendientes, advertencias, información importante
- **Clases**: `.btn-warning`, `.card-warning`, `.badge-warning`, `.text-warning`

### **Azul (Info)**
- **Uso**: Información general, navegación, acciones neutras
- **Clases**: `.btn-info`, `.card-info`, `.badge-info`, `.text-info`

### **Púrpura (Analytics)**
- **Uso**: Análisis, reportes, métricas, datos
- **Clases**: `.btn-analytics`, `.card-analytics`, `.badge-analytics`, `.text-analytics`

### **Gris (Neutral)**
- **Uso**: Estados inactivos, información secundaria
- **Clases**: `.badge-neutral`, `.text-neutral`

## 🧩 **Componentes Disponibles**

### **Botones**
```html
<!-- Botón de éxito -->
<button className="btn-success">Aprobar Solicitud</button>

<!-- Botón de peligro -->
<button className="btn-danger">Rechazar</button>

<!-- Botón fantasma -->
<button className="btn-ghost">Cancelar</button>
```

### **Cards**
```html
<!-- Card de éxito -->
<div className="card-success">
  <h3>Solicitud Aprobada</h3>
  <p>La solicitud ha sido procesada exitosamente.</p>
</div>

<!-- Card de métrica -->
<div className="metric-card success">
  <h4>Total Aprobadas</h4>
  <span className="text-2xl font-bold">89</span>
</div>
```

### **Badges**
```html
<!-- Badge de estado -->
<span className="badge-success">Aprobada</span>
<span className="badge-warning">Pendiente</span>
<span className="badge-danger">Rechazada</span>
```

### **Alertas**
```html
<!-- Alerta informativa -->
<div className="alert-info">
  <h4>Información</h4>
  <p>Se ha actualizado el sistema.</p>
</div>
```

### **Acciones Rápidas**
```html
<!-- Acción rápida -->
<div className="quick-action-button success-action group">
  <div className="flex items-center space-x-3">
    <div className="quick-action-icon">
      <PlusIcon />
    </div>
    <div>
      <p className="quick-action-title">Nueva Solicitud</p>
      <p className="quick-action-subtitle">Crear solicitud</p>
    </div>
  </div>
</div>
```

## 📐 **Espaciado Consistente**

### **Padding/Margin**
- **xs**: `4px` - Para elementos muy pequeños
- **sm**: `8px` - Para elementos compactos
- **md**: `12px` - Para espaciado normal
- **lg**: `16px` - Para elementos principales
- **xl**: `24px` - Para secciones
- **2xl**: `32px` - Para contenedores grandes

### **Bordes Redondeados**
- **sm**: `6px` - Para elementos pequeños
- **md**: `8px` - Para botones y inputs
- **lg**: `12px` - Para cards
- **xl**: `16px` - Para contenedores principales
- **2xl**: `24px` - Para elementos destacados

## ⚡ **Transiciones**

### **Duraciones**
- **fast**: `150ms` - Para micro-interacciones
- **normal**: `300ms` - Para la mayoría de elementos
- **slow**: `500ms` - Para animaciones complejas

### **Easing**
- **ease-out**: Para la mayoría de transiciones
- **ease-in-out**: Para animaciones de entrada/salida

## 🎯 **Ejemplos de Uso por Página**

### **Dashboard**
- Cards de métricas: `.metric-card` + variante semántica
- Acciones rápidas: `.quick-action-button` + variante
- Alertas: `.alert-info` para notificaciones

### **Lista de Empleados**
- Tabla: `.glass-card` para contenedor
- Estados: `.badge-success`, `.badge-warning`, etc.
- Acciones: `.btn-info`, `.btn-danger`

### **Formularios**
- Inputs: `.input-base` + variante semántica
- Botones: `.btn-success` para guardar, `.btn-ghost` para cancelar
- Validación: `.alert-danger` para errores

### **Solicitudes**
- Estados: `.badge-warning` (pendiente), `.badge-success` (aprobada)
- Acciones: `.btn-success` (aprobar), `.btn-danger` (rechazar)
- Detalles: `.card-info` para información

## 🔧 **Implementación**

### **1. Importar estilos**
Los estilos se importan automáticamente en `globals.css`:
```css
@import '../styles/design-tokens.css';
@import '../styles/components.css';
```

### **2. Usar clases consistentes**
```html
<!-- ✅ Correcto -->
<button className="btn-success">Aprobar</button>

<!-- ❌ Incorrecto -->
<button className="bg-green-500 text-white px-4 py-2 rounded">Aprobar</button>
```

### **3. Mantener semántica**
```html
<!-- ✅ Correcto - Verde para éxito -->
<div className="card-success">Solicitud aprobada</div>

<!-- ❌ Incorrecto - Color sin significado -->
<div className="card-info">Solicitud aprobada</div>
```

## 📚 **Recursos**

- **Design Tokens**: `frontend/styles/design-tokens.css`
- **Componentes**: `frontend/styles/components.css`
- **Documentación**: `frontend/DESIGN_SYSTEM_IMPROVEMENTS.md`
- **Esta guía**: `frontend/STYLE_GUIDE.md`

---

**Versión**: 1.0.0  
**Última actualización**: 2025-07-23  
**Mantenido por**: Equipo de Desarrollo MPD
