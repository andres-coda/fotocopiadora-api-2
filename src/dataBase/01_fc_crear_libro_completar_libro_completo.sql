-- 01_fc_crear_libro_completar_libro_completo.sql
-- Archivo nuevo: no modifica ninguno de los anteriores.
--
-- QUE CAMBIA
--   `fc_crear_libro` completa el catalogo antes de crear el libro de la empresa.
--
-- COMO SE EJECUTA
--   Rol dueño de las funciones (CREATE OR REPLACE FUNCTION exige ownership):
--     psql -U <dueno> -d fotocopiadora -v ON_ERROR_STOP=1 -f 01_fc_crear_libro_completar_libro_completo.sql
--
-- REGISTRO DE CAMBIOS
--   # 1 Objeto: public.fc_crear_libro(character varying x3, integer x2, jsonb,
--          uuid, character varying x6, integer, character varying, jsonb)
--       Defecto medido: en la rama `p_id_libro_completo IS NOT NULL` la funcion
--       solo asigna `v_libro_completo := p_id_libro_completo` y descarta
--       p_anio, p_autor, p_img, p_edicion y p_descripcion (schema.sql:1453-1468).
--       Resultado: al elegir un libro del catalogo y completar un dato que
--       estaba vacio, ese dato se perdia: nunca llegaba a libro_completo.
--       Correccion: en esa rama se llama a fc_procesar_actualizacion_libro_completo,
--       que ya resuelve campo por campo:
--         - catalogo NULL/vacio + valor nuevo  -> UPDATE directo
--         - catalogo con valor + valor distinto -> solicitud + peticion (aprobacion)
--         - catalogo con valor + valor igual    -> no hace nada
--       Efecto sobre datos existentes: ninguno al ejecutar este archivo. En
--       tiempo de ejecucion puede insertar en solicitud/peticion y actualizar
--       campos que estaban vacios en libro_completo.
--
-- ALCANCE DELIBERADO
--   No se llama a fc_procesar_actualizacion_libro (nombre, materia, editorial,
--   nivel, componentes). Esos campos definen CUAL libro_completo se eligio: la
--   busqueda ya filtro por ellos, y esa funcion cambia `id_nivel` y reasigna
--   componentes, con lo que podria mover el registro a otro libro maestro.

do $migracion$
declare
    v_oid oid;
begin
    -- PASO 0: precondiciones -------------------------------------------------

    v_oid := to_regprocedure(
        'public.fc_crear_libro(character varying, character varying, character varying,'
        ' integer, integer, jsonb, uuid, character varying, character varying,'
        ' character varying, character varying, integer, character varying, jsonb)'
    );

    if v_oid is null then
        raise exception 'No existe public.fc_crear_libro con la firma esperada: no aplico nada.';
    end if;

    if to_regprocedure(
        'public.fc_procesar_actualizacion_libro_completo(uuid, character varying,'
        ' integer, character varying, character varying, character varying)'
    ) is null then
        raise exception 'No existe public.fc_procesar_actualizacion_libro_completo, que es requisito de este cambio. No aplico nada.';
    end if;

    if to_regclass('public.solicitud') is null or to_regclass('public.peticion') is null then
        raise exception 'Faltan public.solicitud o public.peticion: la funcion llamada escribe ahi. No aplico nada.';
    end if;

    raise notice 'Precondiciones OK.';

    -- PASO 1: reemplazar la funcion -----------------------------------------
    -- Se mantienen nombre, firma, orden y nombres de parametros: CREATE OR
    -- REPLACE no admite renombrar parametros de entrada.

    execute $fn$
    create or replace function public.fc_crear_libro(p_libro character varying, p_editorial character varying, p_materia character varying, p_pg integer, p_adhesivos integer, p_esp_defecto jsonb, p_id_libro_completo uuid, p_nivel character varying, p_anio character varying, p_autor character varying, p_img character varying, p_edicion integer, p_descripcion character varying, p_componentes jsonb) returns public.vw_libro_busqueda
        language plpgsql
        as $cuerpo$
    DECLARE
        v_libro_completo uuid;
        v_resultado vw_libro_busqueda;
    BEGIN

        IF p_id_libro_completo IS NULL THEN
            v_libro_completo := fc_obtener_or_crear_libro_completo(
                p_libro,
                p_editorial,
                p_materia,
                p_nivel,
                p_anio,
                p_autor,
                p_img,
                p_edicion,
                p_descripcion,
                p_componentes
            );
        ELSE
            v_libro_completo := p_id_libro_completo;

            -- El catalogo ya existe: se completa lo que llego vacio y lo que
            -- cambia queda como solicitud de aprobacion. No sobreescribe datos.
            PERFORM fc_procesar_actualizacion_libro_completo(
                v_libro_completo,
                p_autor,
                p_edicion,
                p_anio,
                p_img,
                p_descripcion
            );
        END IF;

        INSERT INTO libro_empresa(
            id_libro,
            cantidad_pg,
            cantidad_adhesivo,
            especificaciones_defecto
        )
        VALUES(
            v_libro_completo,
            p_pg,
            p_adhesivos,
            p_esp_defecto
        );

        SELECT *
        INTO v_resultado
        FROM vw_libro_busqueda
        WHERE id = v_libro_completo;

        RETURN v_resultado;
    END;
    $cuerpo$;
    $fn$;

    raise notice 'PASO 1: fc_crear_libro reemplazada.';

    -- PASO 2: verificar que el cuerpo nuevo es el que quedo guardado ---------

    if position('fc_procesar_actualizacion_libro_completo' in pg_get_functiondef(v_oid)) = 0 then
        raise exception 'La definicion guardada no contiene la llamada nueva: se deshace el cambio.';
    end if;

    if pg_get_function_identity_arguments(v_oid) not like '%p_id_libro_completo uuid%' then
        raise exception 'La firma de fc_crear_libro quedo distinta a la esperada: se deshace el cambio.';
    end if;

    -- PASO 3: verificar que el rol de la API puede ejecutar la funcion llamada

    if not has_function_privilege(
        'app_role',
        'public.fc_procesar_actualizacion_libro_completo(uuid, character varying, integer, character varying, character varying, character varying)',
        'EXECUTE'
    ) then
        raise exception 'app_role no puede ejecutar fc_procesar_actualizacion_libro_completo: se deshace el cambio.';
    end if;

    raise notice 'Verificacion OK: fc_crear_libro completa libro_completo cuando recibe id_libro_completo.';
end;
$migracion$;

-- VERIFICACION MANUAL (lo que el bloque no puede saber)
--   1. Elegir un libro del catalogo que tenga, por ejemplo, la descripcion
--      vacia y el autor cargado. Crear el libro desde la app completando la
--      descripcion.
--   2. Comprobar que libro_completo quedo con la descripcion nueva:
--        select id, autor, descripcion, edicion, anio, img
--          from libro_completo where id = '<id_libro_completo>';
--   3. Comprobar que NO se creo una solicitud por los campos que llegaron
--      iguales (deberia haber 0 filas nuevas si solo se completo un vacio):
--        select * from solicitud
--         where id_libro_completo = '<id_libro_completo>'
--         order by ult_act desc;
--   4. Intentar cambiar un campo que YA tenia dato: deberia aparecer una
--      fila en peticion con estado pendiente, no un update silencioso.
--
-- ROLLBACK
--   Revierte con la definicion original, que sigue estando en
--   src/dataBase/schema.sql (lineas 1445-1490): volver a ejecutarla con
--   CREATE OR REPLACE FUNCTION. Documentacion de precondiciones arriba.
--   No revierte las filas que se hayan insertado en solicitud/peticion ni los
--   valores que se hayan completado en libro_completo durante el uso normal
--   de la aplicacion: para eso hace falta restaurar el dump previo.
