-- Migración 001: Crear esquema de autenticación
-- Fecha: 2025-07-23
-- Descripción: Crear tablas para sistema de autenticación JWT

-- Crear esquema auth si no existe
CREATE SCHEMA IF NOT EXISTS auth;

-- Tabla de usuarios para autenticación
CREATE TABLE IF NOT EXISTS auth.usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin', 'supervisor', 'empleado', 'rrhh')),
    activo BOOLEAN NOT NULL DEFAULT true,
    refresh_token TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON auth.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON auth.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON auth.usuarios(activo);

-- Tabla de sesiones (opcional, para tracking avanzado)
CREATE TABLE IF NOT EXISTS auth.sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT true
);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON auth.sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token_hash ON auth.sesiones(token_hash);
CREATE INDEX IF NOT EXISTS idx_sesiones_activa ON auth.sesiones(activa);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION auth.update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion en usuarios
DROP TRIGGER IF EXISTS trigger_update_usuarios_fecha_actualizacion ON auth.usuarios;
CREATE TRIGGER trigger_update_usuarios_fecha_actualizacion
    BEFORE UPDATE ON auth.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_fecha_actualizacion();

-- Insertar usuario administrador por defecto (password: admin123)
-- Hash generado con bcrypt, salt rounds: 12
INSERT INTO auth.usuarios (email, password, nombre, apellido, rol, activo)
VALUES (
    'admin@mpd.gov.ar',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXIG.ztHfHyq',
    'Administrador',
    'Sistema',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insertar usuario de prueba RRHH (password: rrhh123)
INSERT INTO auth.usuarios (email, password, nombre, apellido, rol, activo)
VALUES (
    'rrhh@mpd.gov.ar',
    '$2b$12$8Hn8LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXIG.ztH',
    'Recursos',
    'Humanos',
    'rrhh',
    true
) ON CONFLICT (email) DO NOTHING;

-- Comentarios en las tablas
COMMENT ON TABLE auth.usuarios IS 'Usuarios del sistema con autenticación JWT';
COMMENT ON TABLE auth.sesiones IS 'Registro de sesiones activas para tracking';

COMMENT ON COLUMN auth.usuarios.email IS 'Email único del usuario, usado para login';
COMMENT ON COLUMN auth.usuarios.password IS 'Hash de la contraseña con bcrypt';
COMMENT ON COLUMN auth.usuarios.rol IS 'Rol del usuario: admin, supervisor, empleado, rrhh';
COMMENT ON COLUMN auth.usuarios.refresh_token IS 'Token de renovación JWT';
COMMENT ON COLUMN auth.usuarios.ultimo_acceso IS 'Última vez que el usuario se autenticó';

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'usuarios') THEN
        RAISE NOTICE 'Tabla auth.usuarios creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'sesiones') THEN
        RAISE NOTICE 'Tabla auth.sesiones creada exitosamente';
    END IF;
END $$;
