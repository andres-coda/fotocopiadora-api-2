-- ============================================================
-- HELPER PRIVADO: crea/obtiene solicitud y registra petición
-- ============================================================
create or replace function _fc_solicitud_registrar_peticion(
    p_id_solicitud_inout inout uuid,        -- null = crear nueva; out = id usada
    p_id_libro_completo uuid,
    p_id_usuario uuid,
    p_id_empresa uuid,
    p_campo varchar,
    p_valor_actual jsonb,
    p_valor_nuevo jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
    v_id_peticion uuid;
begin
    -- Crear solicitud si no existe (primera petición de esta transacción)
    if p_id_solicitud_inout is null then
        insert into solicitud (id_libro_completo, id_usuario, id_empresa, estado)
        values (p_id_libro_completo, p_id_usuario, p_id_empresa, 1)
        returning id into p_id_solicitud_inout;
    end if;

    -- Registrar la petición
    insert into peticion (id_solicitud, campo, valor_anterior, valor_nuevo, estado)
    values (p_id_solicitud_inout, p_campo, p_valor_actual, p_valor_nuevo, 1)
    returning id into v_id_peticion;

    return v_id_peticion;
end $$;

grant execute on function _fc_solicitud_registrar_peticion(
    inout uuid, uuid, uuid, uuid, varchar, jsonb, jsonb
) to app_role;


-- ============================================================
-- FUNCIÓN 1: Campos directos de libro_completo
-- ============================================================
create or replace function fc_verificar_peticiones_libro_completo(
    p_id_libro_completo uuid,
    p_id_usuario uuid,
    p_id_empresa uuid,
    p_campos jsonb,                     -- {"autor": "x", "edicion": 2, "anio": "2023", "img": "url", "descripcion": "txt"}
    p_id_solicitud_inout inout uuid     -- null = crear; out = id solicitud creada/usada
)
returns table(
    campo varchar,
    accion varchar,                     -- 'directo' | 'peticion_creada' | 'sin_cambio'
    valor_actual jsonb,
    valor_nuevo jsonb,
    id_solicitud uuid,
    id_peticion uuid
)
language plpgsql
security definer
as $$
declare
    v_actual record;
    v_campo text;
    v_valor_actual jsonb;
    v_valor_nuevo jsonb;
    v_diferente boolean;
    v_id_peticion uuid;
begin
    -- 1. Leer valores actuales de una sola vez
    select autor, edicion, anio, img, descripcion
    into v_actual
    from libro_completo
    where id = p_id_libro_completo;

    if not found then
        raise exception 'libro_completo % no encontrado', p_id_libro_completo;
    end if;

    -- 2. Iterar campos recibidos (solo los que vienen en el JSON)
    for v_campo in select jsonb_object_keys(p_campos) loop
        v_valor_nuevo := p_campos -> v_campo;

        -- Obtener valor actual según el campo
        v_valor_actual := case v_campo
            when 'autor'       then to_jsonb(v_actual.autor)
            when 'edicion'     then to_jsonb(v_actual.edicion)
            when 'anio'        then to_jsonb(v_actual.anio)
            when 'img'         then to_jsonb(v_actual.img)
            when 'descripcion' then to_jsonb(v_actual.descripcion)
            else null
        end;

        -- Si el campo no es válido, saltar
        if v_valor_actual is null and v_campo not in ('autor','edicion','anio','img','descripcion') then
            continue;
        end if;

        -- 3. Determinar si hay cambio real sobre valor existente
        v_diferente := (v_valor_actual is not null and v_valor_actual <> v_valor_nuevo);

        if v_diferente then
            -- Requiere petición
            v_id_peticion := _fc_solicitud_registrar_peticion(
                p_id_solicitud_inout, p_id_libro_completo, p_id_usuario, p_id_empresa,
                v_campo, v_valor_actual, v_valor_nuevo
            );
            return query select v_campo, 'peticion_creada', v_valor_actual, v_valor_nuevo, p_id_solicitud_inout, v_id_peticion;
        elsif v_valor_nuevo is not null then
            -- Valor nuevo proporcionado y (actual es null O son iguales) -> directo
            return query select v_campo, 'directo', v_valor_actual, v_valor_nuevo, null::uuid, null::uuid;
        else
            -- No mandaron valor para este campo
            return query select v_campo, 'sin_cambio', v_valor_actual, null::jsonb, null::uuid, null::uuid;
        end if;
    end loop;

    -- Si no vino ningún campo en el JSON, no hacer nada
    if jsonb_typeof(p_campos) <> 'object' or jsonb_object_keys(p_campos) is null then
        return;
    end if;
end $$;

grant execute on function fc_verificar_peticiones_libro_completo(
    uuid, uuid, uuid, jsonb, inout uuid
) to app_role;


-- ============================================================
-- FUNCIÓN 2: Campos relacionados (nivel, nombre, editorial, materia, componentes)
-- ============================================================
create or replace function fc_verificar_peticiones_libro_relacionados(
    p_id_libro_completo uuid,
    p_id_usuario uuid,
    p_id_empresa uuid,
    p_campos jsonb,                     -- {"id_nivel": "uuid", "nombre": "x", "id_editorial": "uuid", "id_materia": "uuid", "componentes": ["uuid1","uuid2"]}
    p_id_solicitud_inout inout uuid     -- null = crear; out = id solicitud creada/usada (compartida con función 1)
)
returns table(
    campo varchar,
    accion varchar,
    valor_actual jsonb,
    valor_nuevo jsonb,
    id_solicitud uuid,
    id_peticion uuid
)
language plpgsql
security definer
as $$
declare
    v_libro_id uuid;
    v_actual_nivel uuid;
    v_actual_nombre varchar;
    v_actual_editorial uuid;
    v_actual_materia uuid;
    v_actual_componentes uuid[];
    v_campo text;
    v_valor_actual jsonb;
    v_valor_nuevo jsonb;
    v_diferente boolean;
    v_id_peticion uuid;
    v_comp_actual text;
    v_comp_nuevo text;
begin
    -- 1. Leer valores actuales (una sola query con join)
    select lc.id_libro, lc.id_nivel, l.nombre, l.id_editorial, l.id_materia,
           coalesce(array_agg(lc2.id_componente) filter (where lc2.id_componente is not null), '{}')
    into v_libro_id, v_actual_nivel, v_actual_nombre, v_actual_editorial, v_actual_materia, v_actual_componentes
    from libro_completo lc
    join libro l on l.id = lc.id_libro
    left join libro_componente lc2 on lc2.id_libro = lc.id
    where lc.id = p_id_libro_completo
    group by lc.id_libro, lc.id_nivel, l.nombre, l.id_editorial, l.id_materia;

    if not found then
        raise exception 'libro_completo % no encontrado', p_id_libro_completo;
    end if;

    -- 2. Iterar campos recibidos
    for v_campo in select jsonb_object_keys(p_campos) loop
        v_valor_nuevo := p_campos -> v_campo;

        -- Mapear campo a valor actual y detectar diferencia
        case v_campo
            when 'nivel' then
                v_valor_actual := to_jsonb(v_actual_nivel);
                v_diferente := (v_actual_nivel is not null and v_actual_nivel <> (v_valor_nuevo)::uuid);

            when 'nombre' then
                v_valor_actual := to_jsonb(v_actual_nombre);
                v_diferente := (v_actual_nombre is not null and v_actual_nombre <> (v_valor_nuevo)::text);

            when 'editorial' then
                v_valor_actual := to_jsonb(v_actual_editorial);
                v_diferente := (v_actual_editorial is not null and v_actual_editorial <> (v_valor_nuevo)::uuid);

            when 'materia' then
                v_valor_actual := to_jsonb(v_actual_materia);
                v_diferente := (v_actual_materia is not null and v_actual_materia <> (v_valor_nuevo)::uuid);

            when 'componentes' then
                v_valor_actual := to_jsonb(v_actual_componentes);
                v_comp_actual := array_to_string(v_actual_componentes, ',');
                v_comp_nuevo := array_to_string((v_valor_nuevo)::uuid[], ',');
                v_diferente := (v_actual_componentes is not null and array_length(v_actual_componentes, 1) > 0 and v_comp_actual <> v_comp_nuevo);

            else
                continue; -- campo no reconocido
        end case;

        -- 3. Clasificar acción
        if v_diferente then
            v_id_peticion := _fc_solicitud_registrar_peticion(
                p_id_solicitud_inout, p_id_libro_completo, p_id_usuario, p_id_empresa,
                v_campo, v_valor_actual, v_valor_nuevo
            );
            return query select v_campo, 'peticion_creada', v_valor_actual, v_valor_nuevo, p_id_solicitud_inout, v_id_peticion;
        elsif v_valor_nuevo is not null and v_valor_nuevo <> 'null'::jsonb then
            return query select v_campo, 'directo', v_valor_actual, v_valor_nuevo, null::uuid, null::uuid;
        else
            return query select v_campo, 'sin_cambio', v_valor_actual, null::jsonb, null::uuid, null::uuid;
        end if;
    end loop;
end $$;

grant execute on function fc_verificar_peticiones_libro_relacionados(
    uuid, uuid, uuid, jsonb, inout uuid
) to app_role;


-- ============================================================
-- FUNCIÓN CONVENIENCIA: Llama ambas y devuelve todo unificado
-- Útil cuando querés validar todo de una vez desde la API
-- ============================================================
create or replace function fc_verificar_peticiones_libro_completo(
    p_id_libro_completo uuid,
    p_id_usuario uuid,
    p_id_empresa uuid,
    p_campos_extra jsonb default '{}',       -- campos de libro_completo
    p_campos_rel jsonb default '{}'          -- campos relacionados
)
returns table(
    campo varchar,
    accion varchar,
    valor_actual jsonb,
    valor_nuevo jsonb,
    id_solicitud uuid,
    id_peticion uuid
)
language plpgsql
security definer
as $$
declare
    v_id_solicitud uuid := null;
begin
    -- Ejecutar función 1 (campos extra)
    return query
    select * from fc_verificar_peticiones_libro_completo(
        p_id_libro_completo, p_id_usuario, p_id_empresa,
        p_campos_extra, v_id_solicitud
    );

    -- Ejecutar función 2 (campos relacionados) - comparte v_id_solicitud
    return query
    select * from fc_verificar_peticiones_libro_relacionados(
        p_id_libro_completo, p_id_usuario, p_id_empresa,
        p_campos_rel, v_id_solicitud
    );
end $$;

grant execute on function fc_verificar_peticiones_libro_completo(
    uuid, uuid, uuid, jsonb, jsonb
) to app_role;