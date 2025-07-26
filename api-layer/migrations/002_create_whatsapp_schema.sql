-- Migración 002: Crear esquema de WhatsApp
-- Fecha: 2025-07-23
-- Descripción: Crear tablas para integración con WhatsApp Business API

-- Crear esquema whatsapp si no existe
CREATE SCHEMA IF NOT EXISTS whatsapp;

-- Tabla de mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp.mensajes (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('incoming', 'outgoing')),
    contenido TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'sent' CHECK (estado IN ('sent', 'delivered', 'read', 'failed')),
    metadata JSONB,
    fecha_mensaje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones activas
CREATE TABLE IF NOT EXISTS whatsapp.conversaciones (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    empleado_id INTEGER REFERENCES licencias.empleados(id),
    tipo VARCHAR(50) DEFAULT 'general' CHECK (tipo IN ('general', 'solicitud_licencia', 'consulta', 'soporte')),
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'abandonada', 'escalada')),
    contexto JSONB, -- Para guardar el estado de la conversación
    ultimo_mensaje TEXT,
    fecha_ultimo_mensaje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de templates de mensajes
CREATE TABLE IF NOT EXISTS whatsapp.templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array de variables que acepta el template
    categoria VARCHAR(50) DEFAULT 'general',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes iniciadas por WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp.solicitudes_whatsapp (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    empleado_id INTEGER REFERENCES licencias.empleados(id),
    solicitud_id INTEGER REFERENCES licencias.solicitudes_licencia(id),
    estado VARCHAR(20) DEFAULT 'iniciada' CHECK (estado IN ('iniciada', 'en_progreso', 'completada', 'cancelada')),
    datos_recopilados JSONB DEFAULT '{}', -- Datos recopilados durante la conversación
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completada TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mensajes_phone_number ON whatsapp.mensajes(phone_number);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON whatsapp.mensajes(fecha_mensaje);
CREATE INDEX IF NOT EXISTS idx_mensajes_tipo ON whatsapp.mensajes(tipo);
CREATE INDEX IF NOT EXISTS idx_mensajes_estado ON whatsapp.mensajes(estado);

CREATE INDEX IF NOT EXISTS idx_conversaciones_phone_number ON whatsapp.conversaciones(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversaciones_empleado_id ON whatsapp.conversaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_activa ON whatsapp.conversaciones(activa);
CREATE INDEX IF NOT EXISTS idx_conversaciones_estado ON whatsapp.conversaciones(estado);

CREATE INDEX IF NOT EXISTS idx_templates_name ON whatsapp.templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_activo ON whatsapp.templates(activo);

CREATE INDEX IF NOT EXISTS idx_solicitudes_whatsapp_phone ON whatsapp.solicitudes_whatsapp(phone_number);
CREATE INDEX IF NOT EXISTS idx_solicitudes_whatsapp_empleado ON whatsapp.solicitudes_whatsapp(empleado_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_whatsapp_estado ON whatsapp.solicitudes_whatsapp(estado);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION whatsapp.update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS trigger_update_mensajes_fecha_actualizacion ON whatsapp.mensajes;
CREATE TRIGGER trigger_update_mensajes_fecha_actualizacion
    BEFORE UPDATE ON whatsapp.mensajes
    FOR EACH ROW
    EXECUTE FUNCTION whatsapp.update_fecha_actualizacion();

DROP TRIGGER IF EXISTS trigger_update_conversaciones_fecha_actualizacion ON whatsapp.conversaciones;
CREATE TRIGGER trigger_update_conversaciones_fecha_actualizacion
    BEFORE UPDATE ON whatsapp.conversaciones
    FOR EACH ROW
    EXECUTE FUNCTION whatsapp.update_fecha_actualizacion();

DROP TRIGGER IF EXISTS trigger_update_templates_fecha_actualizacion ON whatsapp.templates;
CREATE TRIGGER trigger_update_templates_fecha_actualizacion
    BEFORE UPDATE ON whatsapp.templates
    FOR EACH ROW
    EXECUTE FUNCTION whatsapp.update_fecha_actualizacion();

DROP TRIGGER IF EXISTS trigger_update_solicitudes_whatsapp_fecha_actualizacion ON whatsapp.solicitudes_whatsapp;
CREATE TRIGGER trigger_update_solicitudes_whatsapp_fecha_actualizacion
    BEFORE UPDATE ON whatsapp.solicitudes_whatsapp
    FOR EACH ROW
    EXECUTE FUNCTION whatsapp.update_fecha_actualizacion();

-- Insertar templates básicos
INSERT INTO whatsapp.templates (name, content, variables, categoria) VALUES
('bienvenida', 'Hola {{nombre}}, bienvenido al sistema de licencias del MPD. ¿En qué puedo ayudarte?', '["nombre"]', 'general'),
('solicitud_recibida', 'Tu solicitud de licencia ha sido recibida. Número de referencia: {{numero_solicitud}}', '["numero_solicitud"]', 'solicitudes'),
('solicitud_aprobada', 'Tu solicitud de licencia {{tipo_licencia}} del {{fecha_inicio}} al {{fecha_fin}} ha sido APROBADA.', '["tipo_licencia", "fecha_inicio", "fecha_fin"]', 'solicitudes'),
('solicitud_rechazada', 'Tu solicitud de licencia ha sido rechazada. Motivo: {{motivo}}', '["motivo"]', 'solicitudes'),
('documentacion_faltante', 'Para procesar tu solicitud necesitamos la siguiente documentación: {{documentos}}', '["documentos"]', 'solicitudes')
ON CONFLICT (name) DO NOTHING;

-- Comentarios en las tablas
COMMENT ON TABLE whatsapp.mensajes IS 'Registro de todos los mensajes enviados y recibidos por WhatsApp';
COMMENT ON TABLE whatsapp.conversaciones IS 'Conversaciones activas con empleados';
COMMENT ON TABLE whatsapp.templates IS 'Templates de mensajes predefinidos';
COMMENT ON TABLE whatsapp.solicitudes_whatsapp IS 'Solicitudes de licencia iniciadas por WhatsApp';

COMMENT ON COLUMN whatsapp.mensajes.phone_number IS 'Número de teléfono en formato internacional';
COMMENT ON COLUMN whatsapp.mensajes.message_id IS 'ID único del mensaje de WhatsApp';
COMMENT ON COLUMN whatsapp.mensajes.tipo IS 'Tipo de mensaje: incoming (recibido) o outgoing (enviado)';
COMMENT ON COLUMN whatsapp.mensajes.estado IS 'Estado del mensaje: sent, delivered, read, failed';

COMMENT ON COLUMN whatsapp.conversaciones.contexto IS 'Estado actual de la conversación (JSON)';
COMMENT ON COLUMN whatsapp.conversaciones.tipo IS 'Tipo de conversación: general, solicitud_licencia, consulta, soporte';

COMMENT ON COLUMN whatsapp.templates.variables IS 'Array JSON de variables que acepta el template';

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'whatsapp' AND table_name = 'mensajes') THEN
        RAISE NOTICE 'Tabla whatsapp.mensajes creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'whatsapp' AND table_name = 'conversaciones') THEN
        RAISE NOTICE 'Tabla whatsapp.conversaciones creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'whatsapp' AND table_name = 'templates') THEN
        RAISE NOTICE 'Tabla whatsapp.templates creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'whatsapp' AND table_name = 'solicitudes_whatsapp') THEN
        RAISE NOTICE 'Tabla whatsapp.solicitudes_whatsapp creada exitosamente';
    END IF;
END $$;
