-- ============================================================
-- FUNCIÓN ÚNICA: Verifica, actualiza directo y registra peticiones
-- Retorna true si se ejecutó correctamente, false si hubo error
-- ============================================================
create or replace function fc_procesar_actualizacion_libro_completo(
    p_id_libro_completo uuid,
    p_id_usuario uuid,
    p_id_empresa uuid,
    p_campos jsonb                      -- {"autor": "x", "edicion": 2, "anio": "2023", "img": "url", "descripcion": "txt"}
)
returns boolean
language plpgsql
security definer
as $$
declare
    v_actual record;
    v_campo text;
    v_valor_nuevo jsonb;
    v_valor_actual jsonb;
    v_id_solicitud uuid := null;
    v_id_peticion uuid;
    v_direct_updates jsonb := '{}'::jsonb;
begin
    -- 1. Leer valores actuales de una sola vez
    select autor, edicion, anio, img, descripcion
    into v_actual
    from libro_completo
    where id = p_id_libro_completo;

    if not found then
        raise exception 'libro_completo % no encontrado', p_id_libro_completo;
    end if;

    -- 2. Iterar campos recibidos, clasificar y acumular
    for v_campo in select jsonb_object_keys(p_campos) loop
        v_valor_nuevo := p_campos -> v_campo;

        v_valor_actual := case v_campo
            when 'autor'       then to_jsonb(v_actual.autor)
            when 'edicion'     then to_jsonb(v_actual.edicion)
            when 'anio'        then to_jsonb(v_actual.anio)
            when 'img'         then to_jsonb(v_actual.img)
            when 'descripcion' then to_jsonb(v_actual.descripcion)
            else null
        end;

        if v_valor_actual is null and v_campo not in ('autor','edicion','anio','img','descripcion') then
            continue;
        end if;

        -- Regla 1: BD null, DTO null -> sin_cambio (no acumular, no petición)
        -- Regla 2: BD null, DTO not null -> actualizado_directo (acumular para UPDATE único)
        -- Regla 3: BD not null, DTO null -> peticion_creada
        -- Regla 4: BD not null, DTO not null, iguales -> sin_cambio
        -- Regla 5: BD not null, DTO not null, distintos -> peticion_creada

        if v_valor_actual is not null then
            -- BD TIENE dato (casos 3, 4, 5)
            if v_valor_nuevo is null or v_valor_nuevo = 'null'::jsonb then
                -- Caso 3: DTO null -> petición
                select id_solicitud, id_peticion into v_id_solicitud, v_id_peticion
                from _fc_solicitud_registrar_peticion(
                    v_id_solicitud, p_id_libro_completo, p_id_usuario, p_id_empresa,
                    v_campo, v_valor_actual, v_valor_nuevo
                );
            elsif v_valor_actual <> v_valor_nuevo then
                -- Caso 5: distinto -> petición
                select id_solicitud, id_peticion into v_id_solicitud, v_id_peticion
                from _fc_solicitud_registrar_peticion(
                    v_id_solicitud, p_id_libro_completo, p_id_usuario, p_id_empresa,
                    v_campo, v_valor_actual, v_valor_nuevo
                );
            else
                -- Caso 4: igual -> sin_cambio (no hacer nada)
            end if;
        else
            -- BD NO TIENE dato (casos 1, 2)
            if v_valor_nuevo is null or v_valor_nuevo = 'null'::jsonb then
                -- Caso 1: DTO null -> sin_cambio (no hacer nada)
            else
                -- Caso 2: DTO tiene valor -> acumular para UPDATE directo
                v_direct_updates := v_direct_updates || jsonb_build_object(v_campo, v_valor_nuevo);
            end if;
        end if;
    end loop;

    -- 3. Ejecutar UPDATE único para todos los campos 'actualizado_directo'
    if jsonb_typeof(v_direct_updates) = 'object' and jsonb_object_keys(v_direct_updates) is not null then
        declare
            v_set_clause text;
        begin
            select string_agg(format('%I = %L', key, value), ', ' order by key)
            into v_set_clause
            from jsonb_each_text(v_direct_updates);

            execute format('update libro_completo set %s, fecha_actualizacion = now() where id = $1',
                           v_set_clause)
            using p_id_libro_completo;
        end;
    end if;

    -- Retornar true si se ejecutó sin errores (incluye peticiones registradas)
    return true;
end $$;

grant execute on function fc_procesar_actualizacion_libro_completo(
    uuid, uuid, uuid, jsonb
) to app_role;