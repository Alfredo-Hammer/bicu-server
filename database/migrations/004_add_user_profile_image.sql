-- ====================================================
-- MIGRACIÓN: Agregar columna profile_image a users
-- ====================================================
-- Fecha: 2026-03-02
-- Descripción: Agrega columna profile_image a la tabla users para soportar fotos de perfil
-- ====================================================

-- Agregar columna profile_image si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_image'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_image TEXT;
        RAISE NOTICE 'Columna profile_image agregada a tabla users';
    ELSE
        RAISE NOTICE 'Columna profile_image ya existe en tabla users';
    END IF;
END $$;

-- Verificación
SELECT 'Migración 004 completada: profile_image agregado' AS status;
