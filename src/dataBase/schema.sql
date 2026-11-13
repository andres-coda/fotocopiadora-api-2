-- db_postrgres.sql
-- Full schema of the project database (`postgres` on localhost:5432).
--
-- Generated with pg_dump. Do NOT edit by hand: any manual change is lost on
-- the next regeneration. For a schema change, write a numbered script in DB/
-- and regenerate this file afterwards.
--
-- Contains every object of the `public` schema: extensions, tables, columns,
-- defaults, constraints, indexes, sequences, functions, triggers, RLS,
-- policies and grants.
--
-- REGENERATE (database running, from the DB/ folder):
--   pg_dump -h localhost -p 5432 -U <user> -d postgres \
--     --schema-only --schema=public --no-owner --no-comments \
--     -f db_postrgres.sql
--   Then remove the \restrict / \unrestrict lines that psql 18 adds at the
--   top and bottom (they carry a random key and break non-psql clients).
--
-- RESTORE (on an EMPTY database):
--   psql -U <owner> -d <db> -v ON_ERROR_STOP=1 -f db_postrgres.sql
--
-- WARNING: this file is not idempotent. It uses CREATE TABLE, not
-- CREATE TABLE IF NOT EXISTS, so restoring it over an existing database fails.
-- Do not add --clean either: with --schema-only that turns into DROP TABLE
-- and you lose the data.
--
-- NOTE: pgcrypto and uuid-ossp functions are not listed one by one; they come
-- from their extensions. Nothing in this schema depends on them: every uuid
-- default uses gen_random_uuid(), native since PostgreSQL 13.
--
-- Generated: 2026-11-12 from PostgreSQL 18.4
--

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: tp_pedido_item; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tp_pedido_item AS (
	cantidad integer,
	detalles character varying(255),
	id_sede uuid,
	id_libro uuid,
	especificaciones jsonb
);


--
-- Name: _fc_solicitud_registrar_peticion(uuid, uuid, character varying, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._fc_solicitud_registrar_peticion(p_id_solicitud uuid, p_id_libro_completo uuid, p_campo character varying, p_valor_actual jsonb, p_valor_nuevo jsonb) RETURNS TABLE(id_solicitud uuid, id_peticion uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
    v_id_solicitud uuid := p_id_solicitud;
    v_id_peticion uuid;
begin
    -- Crear solicitud si no existe (primera petición de esta transacción)
    if v_id_solicitud is null then
        insert into solicitud (id_libro_completo, id_usuario, id_empresa, estado)
        values (p_id_libro_completo, fc_usuario_actual(), fc_empresa_actual(), 1)
        returning id into v_id_solicitud;
    end if;

    -- Registrar la petición
    insert into peticion (id_solicitud, campo, valor_anterior, valor_nuevo, estado)
    values (v_id_solicitud, p_campo, p_valor_actual, p_valor_nuevo, 1)
    returning id into v_id_peticion;

    -- Devolver ambos valores
    return query select v_id_solicitud, v_id_peticion;
end $$;


--
-- Name: _fc_verificar_actualizacion_libro(character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._fc_verificar_actualizacion_libro(p_actual character varying, p_nuevo character varying) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    v_actual_normalizado jsonb :=
        NULLIF(to_jsonb(p_actual), '""'::jsonb);

    v_nuevo_normalizado jsonb :=
        NULLIF(to_jsonb(p_nuevo), '""'::jsonb);
BEGIN
    return v_actual_normalizado IS DISTINCT FROM v_nuevo_normalizado;
END;
$$;


--
-- Name: _fc_verificar_actualizacion_libro_completo(anyelement, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._fc_verificar_actualizacion_libro_completo(p_actual anyelement, p_nuevo anyelement) RETURNS TABLE(v_actualizar boolean, v_peticion boolean)
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    v_actual_normalizado jsonb :=
        NULLIF(to_jsonb(p_actual), '""'::jsonb);

    v_nuevo_normalizado jsonb :=
        NULLIF(to_jsonb(p_nuevo), '""'::jsonb);
BEGIN
    v_actualizar := false;
    v_peticion := false;

    IF v_actual_normalizado IS NULL THEN
        -- BD NULL y nuevo NULL: no hace nada.
        -- BD NULL y nuevo con valor: actualización directa.
        v_actualizar := v_nuevo_normalizado IS NOT NULL;
    ELSE
        -- BD con valor y nuevo NULL o distinto: petición.
        -- BD con valor y nuevo igual: no hace nada.
        v_peticion :=
            v_actual_normalizado IS DISTINCT FROM v_nuevo_normalizado;
    END IF;

    RETURN NEXT;
END;
$$;


--
-- Name: fc_actualizar_estado_pedido(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_actualizar_estado_pedido() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_pedido UUID;
    v_pendientes INTEGER;
    v_listos INTEGER;
    v_retirados INTEGER;
    v_new_estado INT;
BEGIN
   IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        v_id_pedido = NEW.id_pedido;
    ELSE v_id_pedido = OLD.id_pedido;
    END IF;

   SELECT
        COUNT(*) FILTER (WHERE estado IN (1, 2, 3)),
        COUNT(*) FILTER (WHERE estado = 4),
        COUNT(*) FILTER (WHERE estado = 5)
    INTO
        v_pendientes,
        v_listos,
        v_retirados
    FROM pedido_item
    WHERE id_pedido = v_id_pedido;

   IF v_pendientes > 0 THEN
        v_new_estado := 1; -- Pendiente
    ELSIF v_listos > 0 THEN
        v_new_estado := 4; -- Listo
    ELSIF v_retirados > 0 THEN
        v_new_estado := 5; -- Retirado
    ELSE
        v_new_estado := 6; -- Cancelado
    END IF;
   UPDATE pedido SET
        estado = v_new_estado
    WHERE id = v_id_pedido;

   RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: fc_actualizar_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_actualizar_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: fc_actualizar_resumen(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_actualizar_resumen() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM fc_sumar_resumen_libro(NEW);
        RETURN NEW;
    end if;
    IF TG_OP = 'DELETE' THEN
        PERFORM fc_restar_resumen_libro(OLD);
        RETURN OLD;
    end if;
    IF TG_OP = 'UPDATE' THEN
        PERFORM fc_sumar_resumen_libro(NEW);
        PERFORM fc_restar_resumen_libro(OLD);
        RETURN NEW;
    end if;
    RETURN NULL;
END;
$$;


--
-- Name: fc_actualizar_resumen_cliente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_actualizar_resumen_cliente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE NOTICE 'Se ejecutó el trigger. Operación: %', TG_OP;
    IF TG_OP = 'INSERT' THEN
        RAISE NOTICE 'Estado: %', NEW.estado;
        RAISE NOTICE 'id cliente: %', NEW.id_cliente;
        PERFORM fc_sumar_resumen_cliente(NEW);
        RAISE NOTICE 'Después de sumar';
        RETURN NEW;
    end if;
    IF TG_OP = 'DELETE' THEN
        PERFORM fc_restar_resumen_cliente(OLD);
        RETURN OLD;
    end if;
    IF TG_OP = 'UPDATE' THEN
        RAISE NOTICE 'Estado: % -> %', OLD.estado, NEW.estado;
        PERFORM fc_sumar_resumen_cliente(NEW);
        PERFORM fc_restar_resumen_cliente(OLD);
        RETURN NEW;
    end if;
    RETURN NULL;
END;
$$;


--
-- Name: fc_aplicar_peticion(uuid, integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_aplicar_peticion(p_id_peticion uuid, p_estado integer, p_observaciones character varying) RETURNS TABLE(id_afectado uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    declare
        v_id_solicitud        uuid;
        v_id_libro_completo   uuid;
        v_id_libro            uuid;
        v_campo               varchar(20);
        v_estado_actual       integer;
        v_estado_solicitud    integer;
        v_valor_crudo         varchar;
        v_valor_nuevo         jsonb;
        v_texto               text;
        v_pendientes          integer;
        v_aceptadas           integer;
        v_compartido          boolean := false;
    begin
        -- 1. preconditions
        select p.id_solicitud, p.campo, p.valor_nuevo, p.estado
          into v_id_solicitud, v_campo, v_valor_crudo, v_estado_actual
          from peticion p
         where p.id = p_id_peticion;

        if not found then
            raise exception 'peticion % not found', p_id_peticion;
        end if;

        if v_estado_actual <> 1 then
            raise exception 'peticion % already resolved (estado %)', p_id_peticion, v_estado_actual;
        end if;

        if p_estado not in (2, 3) then
            raise exception 'invalid estado %: use 2 (accept) or 3 (reject)', p_estado;
        end if;

        v_valor_nuevo := case
            when v_valor_crudo is null or btrim(v_valor_crudo) = '' then null
            else v_valor_crudo::jsonb
        end;

        select s.id_libro_completo, lc.id_libro, s.estado
          into v_id_libro_completo, v_id_libro, v_estado_solicitud
          from solicitud s
          join libro_completo lc on lc.id = s.id_libro_completo
         where s.id = v_id_solicitud;

        if v_id_libro_completo is null then
            raise exception 'libro_completo not found for solicitud %', v_id_solicitud;
        end if;

        if v_estado_solicitud <> 1 then
            raise exception 'solicitud % already resolved (estado %)', v_id_solicitud, v_estado_solicitud;
        end if;

        -- 2. apply the requested field only when accepted
        if p_estado = 2 then
            v_compartido := v_campo in ('nombre', 'materia', 'editorial');

            if v_campo <> 'componentes' then
                v_texto := nullif(v_valor_nuevo #>> '{}', '');
            end if;

            case v_campo
                when 'nombre' then
                    if v_texto is null then
                        raise exception 'empty nombre in peticion %', p_id_peticion;
                    end if;
                    if exists (select 1 from libro l where l.nombre = v_texto and l.id <> v_id_libro) then
                        raise exception 'a book named % already exists', v_texto;
                    end if;
                    update libro l set nombre = v_texto where l.id = v_id_libro;

                when 'materia' then
                    if v_texto is null then
                        raise exception 'empty materia in peticion %', p_id_peticion;
                    end if;
                    update libro l
                       set id_materia = coalesce(fc_obtener_o_crear_materia(v_texto), l.id_materia)
                     where l.id = v_id_libro;

                when 'editorial' then
                    update libro l
                       set id_editorial = case
                            when v_texto is null then null
                            else fc_obtener_o_crear_editorial(v_texto)
                       end
                     where l.id = v_id_libro;

                when 'nivel' then
                    update libro_completo lc
                       set id_nivel = fc_obtener_o_crear_nivel(v_texto)
                     where lc.id = v_id_libro_completo;

                when 'anio' then
                    update libro_completo lc set anio = v_texto where lc.id = v_id_libro_completo;

                when 'autor' then
                    update libro_completo lc set autor = v_texto where lc.id = v_id_libro_completo;

                when 'img' then
                    update libro_completo lc set img = v_texto where lc.id = v_id_libro_completo;

                when 'edicion' then
                    update libro_completo lc
                       set edicion = case when v_texto is null then null else v_texto::integer end
                     where lc.id = v_id_libro_completo;

                when 'descripcion' then
                    update libro_completo lc set descripcion = v_texto where lc.id = v_id_libro_completo;

                when 'componentes' then
                    delete from libro_componente lc where lc.id_libro = v_id_libro_completo;
                    perform fc_crear_componente_libro(
                        coalesce(v_valor_nuevo, '[]'::jsonb),
                        v_id_libro_completo
                    );

                else
                    raise exception 'unsupported campo % in peticion', v_campo;
            end case;
        end if;

        -- 3. resolve the request
        update peticion p
           set estado = p_estado,
               observaciones = coalesce(p_observaciones, p.observaciones)
         where p.id = p_id_peticion;

        -- 4. close the solicitud when nothing is pending
        select count(*) filter (where p.estado = 1),
               count(*) filter (where p.estado = 2)
          into v_pendientes, v_aceptadas
          from peticion p
         where p.id_solicitud = v_id_solicitud;

        if v_pendientes = 0 then
            update solicitud s
               set estado = case when v_aceptadas > 0 then 2 else 3 end,
                   fecha_resolucion = now()
             where s.id = v_id_solicitud;
        end if;

        -- 5. affected books
        if p_estado = 2 then
            if v_compartido then
                return query select lc.id from libro_completo lc where lc.id_libro = v_id_libro;
            else
                return query select v_id_libro_completo;
            end if;
        end if;

        return;
    end
    $$;


--
-- Name: fc_auditoria(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_auditoria() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_anteriores JSONB;
    v_nuevos JSONB;
    v_fila JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_fila := to_jsonb(NEW);
        INSERT INTO auditoria(operacion,tabla, clave,datos_nuevos,id_empresa, id_usuario)
        VALUES (
            TG_OP,
            TG_TABLE_NAME,
            fc_extraer_clave(v_fila, VARIADIC TG_ARGV),
            v_fila,
            fc_empresa_actual(),
            fc_usuario_actual()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_fila := to_jsonb(OLD);
        INSERT INTO auditoria(operacion,tabla, clave,datos_anteriores,id_empresa, id_usuario)
        VALUES (
            TG_OP,
            TG_TABLE_NAME,
            fc_extraer_clave(v_fila, VARIADIC TG_ARGV),
            v_fila,
            fc_empresa_actual(),
            fc_usuario_actual()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        SELECT
            datos_anteriores,
            datos_nuevos
        INTO
            v_anteriores,
            v_nuevos
        FROM fc_extraer_cambios(
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        IF v_anteriores = '{}'::jsonb THEN
            RETURN NEW;
        END IF;
        INSERT INTO auditoria(operacion,tabla, clave, datos_anteriores,datos_nuevos,id_empresa, id_usuario)
        VALUES (
            TG_OP,
            TG_TABLE_NAME,
            fc_extraer_clave(to_jsonb(NEW),VARIADIC TG_ARGV),
            v_anteriores,
            v_nuevos,
            fc_empresa_actual(),
            fc_usuario_actual()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: fc_empresa_actual(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_empresa_actual() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    PERFORM fc_cargar_contexto_usuario();
    RETURN NULLIF(
        current_setting('app.empresa_id', true),
        ''
    )::uuid;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    email character varying(50),
    telefono character varying(15),
    nombre character varying(50),
    CONSTRAINT ch_cliente_email CHECK (((email IS NULL) OR ((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    CONSTRAINT ch_telefono CHECK (((telefono)::text ~ '^\+?[0-9]{10,}$'::text)),
    CONSTRAINT chk_cliente_contacto_minimo CHECK (((email IS NOT NULL) OR (telefono IS NOT NULL)))
);


--
-- Name: componente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.componente (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(30) NOT NULL
);

ALTER TABLE ONLY public.componente FORCE ROW LEVEL SECURITY;


--
-- Name: editorial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.editorial (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(255) NOT NULL
);


--
-- Name: especificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.especificacion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(10) NOT NULL
);


--
-- Name: libro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libro (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(255) NOT NULL,
    id_materia uuid NOT NULL,
    id_editorial uuid
);


--
-- Name: libro_completo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libro_completo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_libro uuid NOT NULL,
    id_nivel uuid,
    anio character varying(4),
    autor character varying(50),
    img character varying(200),
    edicion integer,
    descripcion character varying(250)
);


--
-- Name: libro_componente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libro_componente (
    id_libro uuid NOT NULL,
    id_componente uuid NOT NULL
);


--
-- Name: libro_empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libro_empresa (
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    id_libro uuid NOT NULL,
    deleted boolean DEFAULT false,
    cantidad_pg integer DEFAULT 0 NOT NULL,
    cantidad_adhesivo integer DEFAULT 0 NOT NULL,
    especificaciones_defecto jsonb DEFAULT '["color", "d_f", "anillado"]'::jsonb NOT NULL,
    detalle_impresion character varying(50),
    CONSTRAINT ch_cantidad_adhesivos_positiva CHECK ((cantidad_adhesivo >= 0)),
    CONSTRAINT ch_cantidad_pg_positiva CHECK ((cantidad_pg >= 0))
);


--
-- Name: materia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(50) NOT NULL
);


--
-- Name: nivel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nivel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(30) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false
);


--
-- Name: pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    fecha_entrega date DEFAULT now() NOT NULL,
    importe_total numeric(10,2) DEFAULT 0 NOT NULL,
    archivos integer DEFAULT 1 NOT NULL,
    anillados integer DEFAULT 0 NOT NULL,
    sena numeric(10,2) DEFAULT 0 NOT NULL,
    id_cliente uuid NOT NULL,
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    estado integer DEFAULT 1 NOT NULL,
    CONSTRAINT ch_anillado_positiva CHECK ((anillados >= 0)),
    CONSTRAINT ch_archivos_positiva CHECK ((archivos > 0)),
    CONSTRAINT ch_importe_total_positiva CHECK ((importe_total >= (0)::numeric)),
    CONSTRAINT ch_sena_positiva CHECK ((sena >= (0)::numeric)),
    CONSTRAINT ck_estado_pedido CHECK (((estado >= 1) AND (estado <= 7)))
);


--
-- Name: pedido_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_item (
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    cantidad integer DEFAULT 0 NOT NULL,
    detalles character varying(255),
    estado integer DEFAULT 1 NOT NULL,
    id_sede uuid NOT NULL,
    id_pedido uuid NOT NULL,
    id_libro uuid NOT NULL,
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    id integer NOT NULL,
    CONSTRAINT ch_cantidad_positiva CHECK ((cantidad > 0)),
    CONSTRAINT ck_estado_pedido_item CHECK (((estado >= 1) AND (estado <= 7)))
);


--
-- Name: pedido_item_especificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_item_especificacion (
    id_pedido uuid NOT NULL,
    id_especificacion uuid NOT NULL,
    nro_item integer NOT NULL
);


--
-- Name: resumen_libro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resumen_libro (
    pendiente integer DEFAULT 0 NOT NULL,
    listo integer DEFAULT 0 NOT NULL,
    cancelado integer DEFAULT 0 NOT NULL,
    retirado integer DEFAULT 0 NOT NULL,
    id_libro uuid NOT NULL,
    id_empresa uuid NOT NULL,
    CONSTRAINT ck_resumen_libro_no_negativo CHECK (((pendiente >= 0) AND (listo >= 0) AND (retirado >= 0) AND (cancelado >= 0)))
);


--
-- Name: sede; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sede (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock (
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    id_libro uuid NOT NULL,
    id_empresa uuid NOT NULL,
    CONSTRAINT ch_stock_positiva CHECK ((stock >= 0))
);


--
-- Name: vw_componentes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_componentes WITH (security_invoker='true') AS
 SELECT lc.id_libro,
    string_agg(DISTINCT (c.nombre)::text, ', '::text ORDER BY (c.nombre)::text) AS componentes
   FROM (public.libro_componente lc
     JOIN public.componente c ON ((c.id = lc.id_componente)))
  GROUP BY lc.id_libro;


--
-- Name: vw_especificaciones; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_especificaciones WITH (security_invoker='true') AS
 SELECT pi.nro_item,
    pi.id_pedido,
    array_agg(DISTINCT e.nombre ORDER BY e.nombre) AS especificaciones
   FROM (public.pedido_item_especificacion pi
     JOIN public.especificacion e ON ((e.id = pi.id_especificacion)))
  GROUP BY pi.nro_item, pi.id_pedido;


--
-- Name: vw_libro_busqueda; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_libro_busqueda WITH (security_invoker='true') AS
 SELECT lc.id,
    l.nombre,
    lc.descripcion,
    lc.edicion,
    lc.autor,
    lc.anio,
    lc.img,
    n.nombre AS nivel,
    vw_c.componentes,
    le.cantidad_pg,
    le.cantidad_adhesivo,
    le.especificaciones_defecto,
    m.nombre AS materia,
    e.nombre AS editorial,
    rl.pendiente,
    rl.listo,
    rl.retirado,
    rl.cancelado,
    le.id_empresa,
    m.id AS id_materia,
    le.detalle_impresion,
    le.deleted,
    s.stock,
    l.id AS id_libro
   FROM ((((((((public.libro_empresa le
     JOIN public.libro_completo lc ON ((lc.id = le.id_libro)))
     LEFT JOIN public.nivel n ON ((lc.id_nivel = n.id)))
     JOIN public.libro l ON ((l.id = lc.id_libro)))
     LEFT JOIN public.materia m ON ((m.id = l.id_materia)))
     LEFT JOIN public.editorial e ON ((e.id = l.id_editorial)))
     LEFT JOIN public.vw_componentes vw_c ON ((vw_c.id_libro = lc.id)))
     LEFT JOIN public.resumen_libro rl ON ((rl.id_libro = le.id_libro)))
     LEFT JOIN public.stock s ON ((s.id_libro = le.id_libro)));


--
-- Name: vw_pedidos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_pedidos WITH (security_invoker='true') AS
 SELECT p.id,
    p.fecha_creacion,
    p.fecha_actualizacion,
    p.fecha_entrega,
    p.importe_total,
    p.sena,
    p.deleted,
    p.archivos,
    p.anillados,
    p.estado,
    c.telefono,
    c.email,
    c.nombre,
    c.id AS id_cliente,
    c.deleted AS delete_cliente
   FROM (public.pedido p
     LEFT JOIN public.cliente c ON ((c.id = p.id_cliente)));


--
-- Name: vw_pedidos_item; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_pedidos_item WITH (security_invoker='true') AS
 SELECT pi.id_pedido,
    pi.id AS nro_pedido,
    pi.cantidad,
    pi.detalles,
    pi.estado,
    vwe.especificaciones,
    vwlb.cantidad_pg,
    vwlb.cantidad_adhesivo,
    vwlb.nombre,
    vwlb.descripcion,
    vwlb.edicion,
    vwlb.anio,
    vwlb.nivel,
    vwlb.componentes,
    vwlb.materia,
    vwlb.editorial,
    vwlb.pendiente,
    vwlb.listo,
    vwlb.retirado,
    vwlb.cancelado,
    vw_p.fecha_creacion,
    vw_p.fecha_entrega,
    vw_p.importe_total,
    vw_p.sena,
    vw_p.anillados,
    vw_p.archivos,
    vw_p.estado AS estado_pedido,
    vw_p.telefono,
    vw_p.email,
    vw_p.id_cliente,
    s.nombre AS sede,
    s.id AS id_sede,
    pi.id_libro,
    vwlb.id_materia,
    count(*) OVER () AS total
   FROM ((((public.pedido_item pi
     LEFT JOIN public.vw_especificaciones vwe ON (((vwe.id_pedido = pi.id_pedido) AND (pi.id = vwe.nro_item))))
     LEFT JOIN public.vw_libro_busqueda vwlb ON ((vwlb.id = pi.id_libro)))
     JOIN public.vw_pedidos vw_p ON ((vw_p.id = pi.id_pedido)))
     LEFT JOIN public.sede s ON ((s.id = pi.id_sede)));


--
-- Name: fc_buscar_pedido(character varying, integer[], text[], date, date, integer, integer, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_buscar_pedido(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date, p_limite integer, p_offset integer, p_orden text[]) RETURNS SETOF public.vw_pedidos_item
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_limite integer;
    v_order text := '';
    v_criterio text;
    v_campo text;
    v_direccion text;
    v_expresion text;
    v_sql text;
BEGIN
    IF p_limite IS NULL OR p_limite < 0 OR p_limite > 50 THEN
        v_limite := 50;
    ELSIF p_limite = 0 THEN
        v_limite := NULL;
    ELSE
        v_limite := p_limite;
    END IF;

    IF p_orden IS NOT NULL THEN
        FOREACH v_criterio IN ARRAY p_orden LOOP
            v_campo := split_part(v_criterio, ':', 1);
            v_direccion := lower(split_part(v_criterio, ':', 2));
            IF v_direccion NOT IN ('asc', 'desc') THEN
                v_direccion := 'asc';
            END IF;

            v_expresion := CASE v_campo
                WHEN 'fechaEntrega' THEN 'f.fecha_entrega'
                WHEN 'fechaCreacion' THEN 'f.fecha_creacion'
                WHEN 'libro' THEN 'f.nombre'
                WHEN 'cliente' THEN 'f.id_cliente'
                ELSE NULL
            END;

            IF v_expresion IS NOT NULL THEN
                v_order := v_order
                    || CASE WHEN v_order = '' THEN '' ELSE ', ' END
                    || v_expresion || ' ' || v_direccion;
            END IF;
        END LOOP;
    END IF;

    -- Desempate estable: sin esto, LIMIT/OFFSET puede repetir o saltear filas.
    v_order := v_order
        || CASE WHEN v_order = '' THEN '' ELSE ', ' END
        || 'f.id_pedido, f.nro_pedido';

    v_sql := 'SELECT f.* FROM fc_filtrar_pedidos_item($1, $2, $3, $4, $5) AS f'
        || ' ORDER BY ' || v_order;

    IF v_limite IS NOT NULL THEN
        v_sql := v_sql || ' LIMIT ' || v_limite;
    END IF;

    IF p_offset IS NOT NULL AND p_offset > 0 THEN
        v_sql := v_sql || ' OFFSET ' || p_offset;
    END IF;

    RETURN QUERY EXECUTE v_sql
        USING p_busqueda, p_estados, p_especificaciones, p_entrega, p_tomado;
END;
$_$;


--
-- Name: resumen_cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resumen_cliente (
    pendiente integer DEFAULT 0 NOT NULL,
    listo integer DEFAULT 0 NOT NULL,
    cancelado integer DEFAULT 0 NOT NULL,
    retirado integer DEFAULT 0 NOT NULL,
    id_cliente uuid NOT NULL,
    CONSTRAINT ck_resumen_cliente_no_negativo CHECK (((pendiente >= 0) AND (listo >= 0) AND (retirado >= 0) AND (cancelado >= 0)))
);


--
-- Name: vw_cliente; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_cliente WITH (security_invoker='true') AS
 SELECT c.id,
    c.nombre,
    c.email,
    c.telefono,
    c.fecha_creacion,
    c.fecha_actualizacion,
    c.deleted,
    rc.pendiente,
    rc.retirado,
    rc.listo,
    rc.cancelado
   FROM (public.cliente c
     LEFT JOIN public.resumen_cliente rc ON ((rc.id_cliente = c.id)));


--
-- Name: fc_busqueda_cliente(character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_busqueda_cliente(p_busqueda character varying, p_limite integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS SETOF public.vw_cliente
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF p_busqueda IS NULL
        OR length(trim(p_busqueda)) < 3 THEN
        RETURN;
    END IF;
    p_limite := LEAST(
            GREATEST(p_limite, 1),
            50
                );
    RETURN QUERY
        WITH palabras AS (SELECT unnest(
                                         regexp_split_to_array(
                                                 lower(trim(p_busqueda)),
                                                 '\s+'
                                         )
                                 ) palabra)
        SELECT *
        FROM vw_cliente c
        WHERE NOT EXISTS (SELECT 1
          FROM palabras p
          WHERE NOT (
            (
                p.palabra ~ '^[0-9]+$'
                AND c.telefono LIKE '%' || p.palabra
            ) OR (
                lower(
                    concat_ws(
                        ' ',
                        c.nombre,
                        c.email
                    )
                ) LIKE '%' || p.palabra || '%'
            )))
        ORDER BY
            c.pendiente,
            c.listo
        LIMIT p_limite
        OFFSET p_offset;
END;
$_$;


--
-- Name: fc_busqueda_cliente(text, integer, integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_busqueda_cliente(p_busqueda text, p_limite integer DEFAULT 50, p_offset integer DEFAULT 0, p_deleted boolean DEFAULT false) RETURNS TABLE(id uuid, nombre character varying, email character varying, telefono character varying, fecha_creacion timestamp without time zone, fecha_actualizacion timestamp without time zone, deleted boolean, pendiente integer, retirado integer, listo integer, cancelado integer, total bigint)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF p_busqueda IS NULL
        OR length(trim(p_busqueda)) < 3 THEN
        RETURN;
    END IF;
    p_limite := LEAST(
            GREATEST(p_limite, 1),
            50
                );
    RETURN QUERY
        WITH palabras AS (SELECT unnest(
                                         regexp_split_to_array(
                                                 lower(trim(p_busqueda)),
                                                 '\s+'
                                         )
                                 ) palabra)
        SELECT
            c.*,
            COUNT(*) OVER() AS total
        FROM vw_cliente c
        WHERE c.deleted = p_deleted and NOT EXISTS (SELECT 1
          FROM palabras p
          WHERE NOT (
            (
                p.palabra ~ '^[0-9]+$'
                AND c.telefono LIKE '%' || p.palabra
            ) OR (
                lower(
                    concat_ws(
                        ' ',
                        c.nombre,
                        c.email
                    )
                ) LIKE '%' || p.palabra || '%'
            )))
        ORDER BY
            c.pendiente,
            c.listo
        LIMIT p_limite
        OFFSET p_offset;
END;
$_$;


--
-- Name: fc_busqueda_libro(text, integer, integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_busqueda_libro(p_busqueda text, p_limite integer DEFAULT 50, p_offset integer DEFAULT 0, p_deleted boolean DEFAULT false) RETURNS TABLE(id uuid, nombre character varying, descripcion character varying, edicion integer, autor character varying, anio character varying, img character varying, nivel character varying, componentes text, cantidad_pg integer, cantidad_adhesivo integer, especificaciones_defecto jsonb, materia character varying, editorial character varying, pendiente integer, listo integer, retirado integer, cancelado integer, id_empresa uuid, id_materia uuid, detalle_impresion character varying, deleted boolean, stock integer, id_libro uuid, total bigint)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF p_busqueda IS NULL
       OR length(trim(p_busqueda)) < 3 THEN
        RETURN;
    END IF;

    p_limite := LEAST(
                    GREATEST(p_limite, 1),
                    50
                 );

    RETURN QUERY
    WITH palabras AS (
        SELECT unnest(
            regexp_split_to_array(
                lower(trim(p_busqueda)),
                '\s+'
            )
        ) AS palabra
    )
    SELECT
        vw_lb.*,
        COUNT(*) OVER() AS total
    FROM vw_libro_busqueda vw_lb
    WHERE vw_lb.deleted = p_deleted and NOT EXISTS (
        SELECT 1
        FROM palabras p
        WHERE NOT (
            (
                p.palabra ~ '^[0-9]{4}$'
                AND vw_lb.anio::text = p.palabra
            )
            OR
            (
                lower(
                    concat_ws(
                        ' ',
                        vw_lb.nombre,
                        vw_lb.nivel,
                        vw_lb.componentes,
                        vw_lb.editorial,
                        vw_lb.materia
                    )
                ) LIKE '%' || p.palabra || '%'
            )
        )
    )
    ORDER BY
        vw_lb.nombre,
        vw_lb.nivel
    LIMIT p_limite
    OFFSET p_offset;

END;
$_$;


--
-- Name: fc_busqueda_libro_completo(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_busqueda_libro_completo(p_busqueda text, p_limite integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, nombre character varying, descripcion character varying, edicion integer, autor character varying, anio character varying, img character varying, nivel character varying, componentes text, materia character varying, editorial character varying, total bigint)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF p_busqueda IS NULL
       OR length(trim(p_busqueda)) < 3 THEN
        RETURN;
    END IF;

    p_limite := LEAST(
                    GREATEST(p_limite, 1),
                    50
                 );

    RETURN QUERY
    WITH palabras AS (
        SELECT unnest(
            regexp_split_to_array(
                lower(trim(p_busqueda)),
                '\s+'
            )
        ) AS palabra
    )
    SELECT
        vw_c.*,
        COUNT(*) OVER() AS total
    FROM vw_libro_completo vw_c
    WHERE NOT EXISTS (
        SELECT 1
        FROM palabras p
        WHERE NOT (
            (
                p.palabra ~ '^[0-9]{4}$'
                AND vw_c.anio::text = p.palabra
            )
            OR
            (
                lower(
                    concat_ws(
                        ' ',
                        vw_c.nombre,
                        vw_c.nivel,
                        vw_c.componentes,
                        vw_c.editorial,
                        vw_c.materia,
                        vw_c.edicion
                    )
                ) LIKE '%' || p.palabra || '%'
            )
        )
    )
    ORDER BY
        vw_c.nombre,
        vw_c.nivel,
        vw_c.componentes,
        vw_c.anio
    LIMIT p_limite
    OFFSET p_offset;

END;
$_$;


--
-- Name: vw_cambio_estado; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_cambio_estado AS
 SELECT pi.estado,
    pi.fecha_actualizacion,
    pi.id_pedido AS id,
    pi.id AS nro_pedido,
    pi.id_libro,
    pi.id_empresa,
    rc.pendiente,
    rc.listo,
    rc.cancelado,
    rc.retirado,
    rc.id_cliente,
    rl.pendiente AS libro_pendiente,
    rl.retirado AS libro_retirado,
    rl.cancelado AS libro_cancelado,
    rl.listo AS libro_listo,
    p.estado AS estado_pedido,
    s.stock AS stock_libro
   FROM ((((public.pedido_item pi
     JOIN public.pedido p ON ((p.id = pi.id_pedido)))
     JOIN public.resumen_cliente rc ON ((rc.id_cliente = p.id_cliente)))
     JOIN public.stock s ON (((s.id_libro = pi.id_libro) AND (s.id_empresa = pi.id_empresa))))
     JOIN public.resumen_libro rl ON (((rl.id_libro = pi.id_libro) AND (rl.id_empresa = pi.id_empresa))));


--
-- Name: fc_cambiar_estado_pedido(integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_cambiar_estado_pedido(p_estado integer, p_id_pedido uuid) RETURNS SETOF public.vw_cambio_estado
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estados integer[];
BEGIN

    SELECT ARRAY_AGG(DISTINCT estado)
    INTO v_estados
    FROM pedido_item
    WHERE id_pedido = p_id_pedido;

    -- Todos los items tienen el mismo estado
    IF CARDINALITY(v_estados) = 1
   OR (
       p_estado = ANY(v_estados)
       AND CARDINALITY(v_estados) = 2
   )
THEN
    UPDATE pedido_item
    SET estado = p_estado
    WHERE id_pedido = p_id_pedido;
ELSE
    RAISE EXCEPTION
        'No se puede cambiar el estado del pedido. Estados actuales: %, estado solicitado: %',
        v_estados,
        p_estado;
END IF;

    RETURN QUERY
    SELECT *
    FROM vw_cambio_estado vw
    WHERE vw.id = p_id_pedido;
END;
$$;


--
-- Name: fc_cargar_contexto_usuario(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_cargar_contexto_usuario() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rol     VARCHAR(20);
    v_empresa UUID;
BEGIN
    -- Si ya fue cargado en esta transacción, no hacer nada
    IF current_setting('app.contexto_cargado', true) = 'true' THEN
        RETURN;
    END IF;

    SELECT rol, id_empresa
    INTO v_rol, v_empresa
    FROM usuario
    WHERE id = fc_usuario_actual();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario % no encontrado', fc_usuario_actual();
    END IF;

    -- Guardar en GUCs locales (duran solo la transacción con SET LOCAL)
    PERFORM set_config('app.rol',        v_rol,                true);
    PERFORM set_config('app.empresa_id', v_empresa::text,      true);
    PERFORM set_config('app.contexto_cargado', 'true',         true);
END;
$$;


--
-- Name: fc_cliente_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_cliente_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        delete from resumen_cliente where id_cliente = OLD.id;
        return OLD;
    END;
    $$;


--
-- Name: fc_contar_pedidos(character varying, integer[], text[], date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_contar_pedidos(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date) RETURNS bigint
    LANGUAGE plpgsql STABLE
    AS $$
declare
    v_total bigint;
begin
    select count(*) into v_total
    from fc_filtrar_pedidos_item(p_busqueda, p_estados, p_especificaciones, p_entrega, p_tomado);

    return v_total;
end;
$$;


--
-- Name: fc_crear_cliente(character varying, character varying, character varying, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_cliente(p_telefono character varying, p_email character varying, p_nombre character varying, p_id_cliente uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_cliente UUID;
    BEGIN
    IF p_id_cliente IS NOT NULL THEN
        RETURN p_id_cliente;
    END IF;
        SELECT id
        INTO v_cliente
        FROM cliente c
        WHERE ((c.telefono IS NOT NULL AND c.telefono = p_telefono)  OR (c.email IS NOT NULL AND c.email = p_email));
        IF v_cliente IS NULL THEN
            INSERT INTO cliente (nombre, telefono, email)
            VALUES (p_nombre, p_telefono, p_email)
            RETURNING id INTO v_cliente;
        END IF;
    RETURN v_cliente;
    END;
$$;


--
-- Name: fc_crear_componente_libro(jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_componente_libro(p_componentes jsonb, p_id_libro uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN

    INSERT INTO componente(nombre)
    SELECT DISTINCT nombre
    FROM jsonb_array_elements_text(p_componentes) t(nombre)
    ON CONFLICT(nombre)
        DO NOTHING;

    INSERT INTO libro_componente(
        id_libro,
        id_componente
    )
    SELECT DISTINCT
        p_id_libro,
        c.id
    FROM componente c
    JOIN jsonb_array_elements_text(p_componentes) t(nombre)
        ON c.nombre=t.nombre
    ON CONFLICT(id_libro,id_componente)
        DO NOTHING;

END;
$$;


--
-- Name: fc_crear_configuraciones(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_configuraciones() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    begin
        insert into configuraciones (id_empresa) values (NEW.id);
        return new;
    end;
$$;


--
-- Name: fc_crear_libro(character varying, character varying, character varying, integer, integer, jsonb, uuid, character varying, character varying, character varying, character varying, integer, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_libro(p_libro character varying, p_editorial character varying, p_materia character varying, p_pg integer, p_adhesivos integer, p_esp_defecto jsonb, p_id_libro_completo uuid, p_nivel character varying, p_anio character varying, p_autor character varying, p_img character varying, p_edicion integer, p_descripcion character varying, p_componentes jsonb) RETURNS public.vw_libro_busqueda
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_libro_completo uuid;
    v_resultado vw_libro_busqueda;
BEGIN

    IF p_id_libro_completo IS NULL THEN
        v_libro_completo:= fc_obtener_or_crear_libro_completo(
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
$$;


--
-- Name: fc_crear_pedido(character varying, character varying, character varying, uuid, date, numeric, integer, integer, numeric, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_pedido(p_telefono character varying, p_email character varying, p_nombre character varying, p_id_cliente uuid, p_fecha_entrega date, p_importe_total numeric, p_archivos integer, p_anillados integer, p_sena numeric, p_items jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_cliente UUID;
        v_pedido UUID;
        v_item tp_pedido_item;
        v_resultado jsonb;
    BEGIN
        v_cliente := fc_crear_cliente(p_telefono, p_email, p_nombre, p_id_cliente);

        INSERT INTO pedido (fecha_entrega, importe_total, archivos, anillados, sena, id_cliente)
        VALUES (p_fecha_entrega, p_importe_total, p_archivos, p_anillados, p_sena, v_cliente)
        RETURNING id INTO v_pedido;

        FOR v_item IN
        SELECT *
        FROM jsonb_to_recordset(p_items) AS x(
            cantidad integer,
            detalles varchar(255),
            id_sede uuid,
            id_libro uuid,
            especificaciones jsonb
        )
        LOOP
        perform fc_crear_pedido_item(v_pedido, v_item);
        END LOOP;
        v_resultado:= fc_obtener_pedido_json(v_pedido);
        return v_resultado;
    END;
    $$;


--
-- Name: fc_crear_pedido_item(uuid, public.tp_pedido_item); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_pedido_item(p_id_pedido uuid, p_item public.tp_pedido_item) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_pedido_item INTEGER;
BEGIN

    INSERT INTO pedido_item (
        cantidad,
        detalles,
        id_sede,
        id_libro,
        id_pedido
    )
    VALUES (
        p_item.cantidad,
        p_item.detalles,
        p_item.id_sede,
        p_item.id_libro,
        p_id_pedido
    )
    RETURNING id
    INTO v_id_pedido_item;

   -- Insertar todas las especificaciones de una sola vez
    INSERT INTO pedido_item_especificacion (
        id_pedido,
        nro_item,
        id_especificacion
    )
    SELECT
        p_id_pedido,
        v_id_pedido_item,
        e.id
    FROM jsonb_array_elements_text(p_item.especificaciones) esp(nombre)
    JOIN especificacion e
        ON e.nombre = esp.nombre;

    RETURN v_id_pedido_item;

END;
$$;


--
-- Name: fc_crear_resumen_cliente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_resumen_cliente() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        INSERT INTO resumen_cliente (id_cliente)
        values (NEW.id);
        RETURN NEW;
    END;
    $$;


--
-- Name: fc_crear_resumen_libro(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_resumen_libro() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        INSERT INTO resumen_libro (id_libro, id_empresa)
        values (NEW.id_libro, NEW.id_empresa);
        RETURN NEW;
    END;
    $$;


--
-- Name: fc_crear_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_crear_stock() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        INSERT INTO stock (id_libro, id_empresa)
        values (NEW.id_libro, NEW.id_empresa);
        RETURN NEW;
    END;
    $$;


--
-- Name: fc_es_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_es_admin() RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    PERFORM fc_cargar_contexto_usuario();
    RETURN current_setting('app.rol', true) IN ('admin', 'super_admin');
END;
$$;


--
-- Name: fc_es_empresa_actual(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_es_empresa_actual(p_id_empresa uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    PERFORM fc_cargar_contexto_usuario();

    IF current_setting('app.empresa_id', true)::UUID <> p_id_empresa THEN
        RETURN false;
    END IF;

    RETURN TRUE;
END;
$$;


--
-- Name: fc_es_super_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_es_super_admin() RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    PERFORM fc_cargar_contexto_usuario();
    RETURN current_setting('app.rol', true) = 'super_admin';
END;
$$;


--
-- Name: fc_extraer_cambios(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_extraer_cambios(old_row jsonb, new_row jsonb) RETURNS TABLE(datos_anteriores jsonb, datos_nuevos jsonb)
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    anteriores JSONB := '{}'::jsonb;
    nuevos JSONB := '{}'::jsonb;
    campo TEXT;
BEGIN

    FOR campo IN
        SELECT jsonb_object_keys(new_row)
    LOOP

        IF old_row -> campo IS DISTINCT FROM new_row -> campo THEN

            anteriores := anteriores ||
                jsonb_build_object(
                    campo,
                    old_row -> campo
                );

            nuevos := nuevos ||
                jsonb_build_object(
                    campo,
                    new_row -> campo
                );

        END IF;

    END LOOP;

    RETURN QUERY
    SELECT anteriores, nuevos;

END;
$$;


--
-- Name: fc_extraer_clave(jsonb, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_extraer_clave(fila jsonb, VARIADIC columnas text[]) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    clave   JSONB := '{}'::jsonb;
    columna TEXT;
BEGIN
    FOREACH columna IN ARRAY columnas
        LOOP
            clave := clave || jsonb_build_object(
                    columna,
                    fila -> columna
                              );
        END LOOP;
    RETURN clave;
END;
$$;


--
-- Name: fc_filtrar_pedidos_item(character varying, integer[], text[], date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_filtrar_pedidos_item(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date) RETURNS SETOF public.vw_pedidos_item
    LANGUAGE plpgsql STABLE
    AS $_$
begin
    return query
    SELECT vw_pi.*
    FROM vw_pedidos_item vw_pi
    WHERE (
        p_busqueda IS NULL
        OR length(trim(p_busqueda)) = 0
        OR NOT EXISTS (
            SELECT 1
            FROM unnest(regexp_split_to_array(lower(trim(p_busqueda)), '\s+')) AS p(palabra)
            WHERE NOT (
                (p.palabra ~ '^[0-9]+$' AND vw_pi.telefono LIKE '%' || p.palabra)
                OR lower(concat_ws(' ',
                        vw_pi.nombre,
                        vw_pi.email,
                        vw_pi.detalles,
                        vw_pi.componentes,
                        vw_pi.materia,
                        vw_pi.nivel,
                        vw_pi.fecha_entrega,
                        vw_pi.estado,
                        vw_pi.sede
                    )) LIKE '%' || p.palabra || '%'
            )
        )
    )
    AND (p_estados IS NULL OR cardinality(p_estados) = 0 OR vw_pi.estado = ANY (p_estados))
    AND (p_especificaciones IS NULL OR cardinality(p_especificaciones) = 0
         OR vw_pi.especificaciones::text[] && p_especificaciones)
    AND (p_entrega IS NULL OR vw_pi.fecha_entrega::date = p_entrega)
    AND (p_tomado IS NULL OR vw_pi.fecha_creacion::date = p_tomado);
end;
$_$;


--
-- Name: fc_libro_empresa_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_libro_empresa_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        delete from resumen_libro where id_libro = OLD.id_libro and (fc_es_super_admin() and id_empresa = OLD.id_empresa or fc_es_empresa_actual(id_empresa));
        delete from stock where id_libro = OLD.id_libro and (fc_es_super_admin() and id_empresa = OLD.id_empresa or fc_es_empresa_actual(id_empresa));
        return OLD;
    END;
    $$;


--
-- Name: fc_login(character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_login(p_nombre character varying, p_pass character varying) RETURNS TABLE(id uuid, nombre character varying, rol character varying, id_empresa uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
        declare
            v_id uuid;
            v_rol varchar;
            v_id_empresa uuid;
        begin
            select u.id, u.rol, u.id_empresa
              into v_id, v_rol, v_id_empresa
              from usuario u
             where u.nombre = p_nombre
               -- crypt() devuelve null si el valor guardado no es un hash valido,
               -- y `null = null` no es true: si alguien quedara en texto plano,
               -- falla cerrado en vez de autenticar.
               and u.password_hash = public.crypt(p_pass, u.password_hash);

            if v_id is null then
                raise exception 'Error al tratar de iniciar sesión. El usuario o la contraseña son incorrectas';
            end if;

            perform set_config('app.user_id', v_id::text, false);

            return query select v_id, p_nombre, v_rol, v_id_empresa;
        end;
        $$;


--
-- Name: fc_obtener_o_crear_editorial(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_o_crear_editorial(p_editorial character varying) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id uuid;
BEGIN
    IF p_editorial IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO editorial(nombre)
    VALUES (p_editorial)
    RETURNING id INTO v_id;

    RETURN v_id;
EXCEPTION
    WHEN unique_violation THEN
        SELECT id
        INTO v_id
        FROM editorial
        WHERE nombre = p_editorial;

        RETURN v_id;
END;
$$;


--
-- Name: fc_obtener_o_crear_libro(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_o_crear_libro(p_libro character varying, p_editorial character varying, p_materia character varying) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO libro(
        nombre,
        id_editorial,
        id_materia
    )
    VALUES(
        p_libro,
        fc_obtener_o_crear_editorial(p_editorial),
        fc_obtener_o_crear_materia(p_materia)
    )
    RETURNING id INTO v_id;

    RETURN v_id;

EXCEPTION
    WHEN unique_violation THEN
        SELECT id
        INTO v_id
        FROM libro
        WHERE nombre = p_libro;

        RETURN v_id;
END;
$$;


--
-- Name: fc_obtener_o_crear_materia(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_o_crear_materia(p_materia character varying) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id uuid;
BEGIN
    IF p_materia IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO materia(nombre)
    VALUES (p_materia)
    RETURNING id INTO v_id;

    RETURN v_id;

EXCEPTION
    WHEN unique_violation THEN
        SELECT id
        INTO v_id
        FROM materia
        WHERE nombre = p_materia;

        RETURN v_id;
END;
$$;


--
-- Name: fc_obtener_o_crear_nivel(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_o_crear_nivel(p_nivel character varying) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id uuid;
BEGIN
    IF p_nivel IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO nivel(nombre)
    VALUES (p_nivel)
    RETURNING id INTO v_id;

    RETURN v_id;

EXCEPTION
    WHEN unique_violation THEN
        SELECT id
        INTO v_id
        FROM nivel
        WHERE nombre = p_nivel;

        RETURN v_id;
END;
$$;


--
-- Name: fc_obtener_or_crear_libro_completo(character varying, character varying, character varying, character varying, character varying, character varying, character varying, integer, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_or_crear_libro_completo(p_libro character varying, p_editorial character varying, p_materia character varying, p_nivel character varying, p_anio character varying, p_autor character varying, p_img character varying, p_edicion integer, p_descripcion character varying, p_componentes jsonb) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_libro uuid;
    v_id_nivel uuid;
    v_id_libro_completo uuid;
    v_componentes_texto text;
BEGIN
    -- 1. Obtener o crear los IDs de las tablas maestras base
    v_id_libro := fc_obtener_o_crear_libro(p_libro, p_editorial, p_materia);
    v_id_nivel := fc_obtener_o_crear_nivel(p_nivel);

    -- 2. Convertir el JSONB de entrada a una cadena de texto normalizada y ordenada.
    -- Ej: si pasan ["Activity", "Student"] o ["Student", "Activity"], ambos se vuelven "Activity, Student"
    SELECT COALESCE(string_agg(DISTINCT c_nombre, ', ' ORDER BY c_nombre), '')
    INTO v_componentes_texto
    FROM jsonb_array_elements_text(p_componentes) AS c_nombre;

    -- 3. Buscar si existe un libro completo que coincida en todo, INCLUYENDO el set de componentes
    SELECT lc.id INTO v_id_libro_completo
    FROM libro_completo lc
    -- Usamos LEFT JOIN con tu vista para traer los componentes ya concatenados de los libros existentes
    LEFT JOIN vw_componentes vwc ON vwc.id_libro = lc.id
    WHERE lc.id_libro = v_id_libro
      AND (lc.id_nivel = v_id_nivel OR (lc.id_nivel IS NULL AND v_id_nivel IS NULL))
      AND (lc.anio = p_anio OR (lc.anio IS NULL AND p_anio IS NULL))
      AND (lc.edicion = p_edicion OR (lc.edicion IS NULL AND p_edicion IS NULL))
      -- Comparamos la combinación exacta de componentes (ej: "Activity, Student" = "Activity, Student")
      AND (COALESCE(vwc.componentes, '') = v_componentes_texto);

    -- 4. Si se encontró la combinación exacta, la devolvemos sin duplicar nada
    IF v_id_libro_completo IS NOT NULL THEN
        RETURN v_id_libro_completo;
    END IF;

    -- 5. Si no existe esa combinación, creamos el nuevo registro en libro_completo
    INSERT INTO libro_completo(id_libro, id_nivel, anio, autor, img, edicion, descripcion)
    VALUES(v_id_libro, v_id_nivel, p_anio, p_autor, p_img, p_edicion, p_descripcion)
    RETURNING id INTO v_id_libro_completo;

    -- 6. Insertamos los componentes en la tabla intermedia para este nuevo libro específico
    PERFORM fc_crear_componente_libro(p_componentes, v_id_libro_completo);

    -- 7. Retornamos el ID del nuevo libro completo con su set único de componentes
    RETURN v_id_libro_completo;
END;
$$;


--
-- Name: fc_obtener_pedido_json(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_pedido_json(p_id_pedido uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_resultado jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', vp.id,
        'fechaCreacion', vp.fecha_creacion,
        'fechaActualizacion', vp.fecha_actualizacion,
        'fechaEntrega', vp.fecha_entrega,
        'importeTotal', vp.importe_total,
        'sena', vp.sena,
        'archivos', vp.archivos,
        'anillados', vp.anillados,
        'estado', vp.estado,
        'cliente', jsonb_build_object(
            'id', vp.id_cliente,
            'nombre', vp.nombre,
            'telefono', vp.telefono,
            'email', vp.email
        ),
        'items',
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', vpi.nro_pedido,
                    'cantidad', vpi.cantidad,
                    'detalles', vpi.detalles,
                    'estado', vpi.estado,
                    'sede', jsonb_build_object(
                        'id', vpi.id_sede,
                        'nombre', vpi.sede
                    ),
                    'libro', jsonb_build_object(
                        'id', vpi.id_libro,
                        'nombre', vpi.nombre,
                        'descripcion', vpi.descripcion,
                        'edicion', vpi.edicion,
                        'anio', vpi.anio,
                        'nivel', vpi.nivel,
                        'componentes', vpi.componentes,
                        'materia', vpi.materia,
                        'id_materia', vpi.id_materia,
                        'editorial', vpi.editorial
                    ),
                    'especificaciones', vpi.especificaciones
                )
                ORDER BY vpi.nro_pedido
            )
            FROM vw_pedidos_item vpi
            WHERE vpi.id_pedido = vp.id
        )
    )
    INTO v_resultado
    FROM vw_pedidos vp
    WHERE vp.id = p_id_pedido;

    RETURN v_resultado;
END;
$$;


--
-- Name: fc_obtener_propuestas(integer, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_obtener_propuestas(p_limite integer DEFAULT 20, p_offset integer DEFAULT 0, p_orden text DEFAULT 'ASC'::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_total integer;
  v_resultado jsonb;
  v_sql text;
BEGIN
  -- Validar p_orden para evitar SQL injection
  IF upper(p_orden) NOT IN ('ASC', 'DESC') THEN
    p_orden := 'ASC';
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM propuesta
  WHERE deleted = false;

  v_sql := format(
    'SELECT jsonb_agg(p_data ORDER BY p_data->>''nombre'' %s)
     FROM (
       SELECT jsonb_build_object(
         ''id'',                  p.id,
         ''nombre'',              p.nombre,
         ''fechaCreacion'',       p.fecha_creacion,
         ''fechaActualizacion'',  p.fecha_actualizacion,
         ''deleted'',             p.deleted,
         ''libros'', (
           SELECT jsonb_agg(
             jsonb_build_object(
               ''id'',                      vwlb.id,
               ''nombre'',                  vwlb.nombre,
               ''nivel'',                   vwlb.nivel,
               ''materia'',                 vwlb.materia,
               ''editorial'',               vwlb.editorial,
               ''cantidadPg'',              vwlb.cantidad_pg,
               ''adhesivos'',               vwlb.cantidad_adhesivo,
               ''componentes'',             vwlb.componentes,
               ''anio'',                    vwlb.anio,
               ''autor'',                   vwlb.autor,
               ''edicion'',                 vwlb.edicion,
               ''img'',                     vwlb.img,
               ''deleted'',                 vwlb.deleted,
               ''id_materia'',              vwlb.id_materia,
               ''especificacionesDefecto'', vwlb.especificaciones_defecto
             )
             ORDER BY vwlb.nombre
           )
           FROM propuesta_libro_empresa ple
           JOIN vw_libro_busqueda vwlb ON vwlb.id = ple.id_libro
           WHERE ple.id_propuesta = p.id
         )
       ) AS p_data
       FROM propuesta p
       WHERE p.deleted = false
       ORDER BY p.nombre %s
       LIMIT %s OFFSET %s
     ) sub',
    p_orden, p_orden, p_limite, p_offset
  );

  EXECUTE v_sql INTO v_resultado;

  RETURN jsonb_build_object(
    'total', v_total,
    'datos', COALESCE(v_resultado, '[]'::jsonb)
  );
END;
$$;


--
-- Name: fc_peticion_cerrar_solicitud(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_peticion_cerrar_solicitud() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    declare
        v_pendientes integer;
        v_aceptadas  integer;
        v_estado     integer;
    begin
        -- Only a peticion that actually left a state matters.
        if new.estado is not distinct from old.estado then
            return null;
        end if;

        -- Reopening a peticion (back to 1) never closes the solicitud.
        if new.estado is null or new.estado = 1 then
            return null;
        end if;

        select count(*) filter (where p.estado = 1),
               count(*) filter (where p.estado = 2)
          into v_pendientes, v_aceptadas
          from peticion p
         where p.id_solicitud = new.id_solicitud;

        if v_pendientes > 0 then
            return null;
        end if;

        -- Any accepted peticion makes the solicitud accepted (2).
        -- All rejected makes it rejected (3).
        v_estado := case when v_aceptadas > 0 then 2 else 3 end;

        update solicitud s
           set estado = v_estado,
               fecha_resolucion = coalesce(s.fecha_resolucion, now())
         where s.id = new.id_solicitud
           and s.estado is distinct from v_estado;

        return null;
    end
    $$;


--
-- Name: fc_procesar_actualizacion_libro(uuid, character varying, character varying, character varying, character varying, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_procesar_actualizacion_libro(p_id_libro_completo uuid, p_nombre character varying, p_materia character varying, p_editorial character varying, p_nivel character varying, p_componentes text[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
    v_actual record;
    v_id_solicitud uuid := null;
    v_nombre boolean default  false;
    v_materia boolean default false;
    v_editorial boolean default false;
    v_nivel boolean default false;
    v_componentes boolean default false;
    v_comp_actual text[];
    v_comp_nuevos text[];
begin
    -- 1. Leer valores actuales de una sola vez (vista para campos simples)
    select nombre, nivel, materia, editorial, componentes
    into v_actual
    from vw_libro_completo
    where id = p_id_libro_completo;

    if not found then
        raise exception 'libro_completo % no encontrado', p_id_libro_completo;
    end if;

    -- 2. Leer componentes actuales por NOMBRE (para comparar con p_componentes que viene por nombre)
    select array_agg(c.nombre order by c.nombre)
    into v_comp_actual
    from libro_componente lc
    join componente c on c.id = lc.id_componente
    where lc.id_libro = (select id_libro from libro_completo where id = p_id_libro_completo);

    v_comp_actual := coalesce(v_comp_actual, '{}');

    -- 3. Normalizar componentes entrantes: trim, quitar vacíos, dedup, ordenar
    if p_componentes is not null then
        v_comp_nuevos := array(
            select distinct trim(elem)
            from unnest(p_componentes) as elem
            where trim(elem) <> ''
            order by 1
        );
    else
        v_comp_nuevos := '{}';
    end if;

    -- 4. Verificar cambios en campos simples (helper ya trata null='' como igual)
    v_nombre := _fc_verificar_actualizacion_libro(v_actual.nombre, p_nombre);
    v_materia := _fc_verificar_actualizacion_libro(v_actual.materia, p_materia);
    v_editorial := _fc_verificar_actualizacion_libro(v_actual.editorial, p_editorial);
    v_nivel := _fc_verificar_actualizacion_libro(v_actual.nivel, p_nivel);

    -- 5. Verificar componentes: comparar arrays de nombres ordenados
    v_componentes := v_comp_actual <> v_comp_nuevos;

    -- 6. Crear solicitud si hay algún cambio
    if (v_nombre or v_materia or v_editorial or v_nivel or v_componentes) then
        insert into solicitud(id_libro_completo, id_usuario, estado, id_empresa)
            values (p_id_libro_completo, fc_usuario_actual(), 1, fc_empresa_actual())
            returning id into v_id_solicitud;
    end if;

    -- 7. Crear peticiones por cada campo que cambió
    IF v_id_solicitud IS NOT NULL THEN
        INSERT INTO peticion (
            id_solicitud,
            campo,
            valor_anterior,
            valor_nuevo,
            observaciones,
            estado
        )
        SELECT
            v_id_solicitud,
            p.campo,
            p.valor_anterior,
            p.valor_nuevo,
            NULL,
            1
        FROM (
            VALUES
                (
                    'nombre',
                    COALESCE(to_jsonb(NULLIF(v_actual.nombre, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_nombre, '')), 'null'::jsonb),
                    v_nombre
                ),
                (
                    'editorial',
                    COALESCE(to_jsonb(NULLIF(v_actual.editorial, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_editorial, '')), 'null'::jsonb),
                    v_editorial
                ),
                (
                    'materia',
                    COALESCE(to_jsonb(NULLIF(v_actual.materia, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_materia, '')), 'null'::jsonb),
                    v_materia
                ),
                (
                    'nivel',
                    COALESCE(to_jsonb(v_actual.nivel), 'null'::jsonb),
                    COALESCE(to_jsonb(p_nivel), 'null'::jsonb),
                    v_nivel
                ),
                (
                    'componentes',
                    to_jsonb(v_comp_actual),
                    to_jsonb(v_comp_nuevos),
                    v_componentes
                )
        ) AS p(campo, valor_anterior, valor_nuevo, crear)
        WHERE p.crear;
    END IF;

    -- 8. Retornar true si se ejecutó sin errores (excepción si falla)
    return true;
end $$;


--
-- Name: fc_procesar_actualizacion_libro_completo(uuid, character varying, integer, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_procesar_actualizacion_libro_completo(p_id_libro_completo uuid, p_autor character varying, p_edicion integer, p_anio character varying, p_img character varying, p_descripcion character varying) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
    v_actual record;
    v_id_solicitud uuid := null;
    v_autor boolean default  false;
    v_edicion boolean default false;
    v_anio boolean default false;
    v_img boolean default false;
    v_descripcion boolean default false;
    v_actualizar_autor boolean default  false;
    v_actualizar_edicion boolean default false;
    v_actualizar_anio boolean default false;
    v_actualizar_img boolean default false;
    v_actualizar_descripcion boolean default false;
begin
    -- 1. Leer valores actuales de una sola vez
    select autor, edicion, anio, img, descripcion
    into v_actual
    from libro_completo
    where id = p_id_libro_completo;

    if not found then
        raise exception 'libro_completo % no encontrado', p_id_libro_completo;
    end if;

    -- 2. Verificar y crear variables de actualización directa y peticiones

    select v.v_actualizar, v.v_peticion
    into v_actualizar_autor, v_autor
    from _fc_verificar_actualizacion_libro_completo(v_actual.autor, p_autor) AS v;

    select v.v_actualizar, v.v_peticion
    into v_actualizar_anio, v_anio
    from _fc_verificar_actualizacion_libro_completo(v_actual.anio, p_anio) AS v;

    select v.v_actualizar, v.v_peticion
    into v_actualizar_edicion, v_edicion
    from _fc_verificar_actualizacion_libro_completo(v_actual.edicion, p_edicion) AS v;

    select v.v_actualizar, v.v_peticion
    into v_actualizar_img, v_img
    from _fc_verificar_actualizacion_libro_completo(v_actual.img, p_img) AS v;

    select v.v_actualizar, v.v_peticion
    into v_actualizar_descripcion, v_descripcion
    from _fc_verificar_actualizacion_libro_completo(v_actual.descripcion, p_descripcion) AS v;

    -- 3. Crear solicitud si es necesario

    if(v_autor or v_anio or v_img or v_edicion or v_descripcion) then
        insert into solicitud(id_libro_completo, id_usuario, estado, id_empresa)
            values (p_id_libro_completo, fc_usuario_actual(), 1, fc_empresa_actual())
            returning id into v_id_solicitud;
    end if;

    -- 4. Crear petición si es necesario

    IF v_id_solicitud IS NOT NULL THEN

        INSERT INTO peticion (
            id_solicitud,
            campo,
            valor_anterior,
            valor_nuevo,
            observaciones,
            estado
        )
        SELECT
            v_id_solicitud,
            p.campo,
            p.valor_anterior,
            p.valor_nuevo,
            NULL,
            1
        FROM (
            VALUES
                (
                    'autor',
                    COALESCE(to_jsonb(NULLIF(v_actual.autor, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_autor, '')), 'null'::jsonb),
                    v_autor
                ),
                (
                    'anio',
                    COALESCE(to_jsonb(NULLIF(v_actual.anio, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_anio, '')), 'null'::jsonb),
                    v_anio
                ),
                (
                    'img',
                    COALESCE(to_jsonb(NULLIF(v_actual.img, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_img, '')), 'null'::jsonb),
                    v_img
                ),
                (
                    'edicion',
                    COALESCE(to_jsonb(v_actual.edicion), 'null'::jsonb),
                    COALESCE(to_jsonb(p_edicion), 'null'::jsonb),
                    v_edicion
                ),
                (
                    'descripcion',
                    COALESCE(to_jsonb(NULLIF(v_actual.descripcion, '')), 'null'::jsonb),
                    COALESCE(to_jsonb(NULLIF(p_descripcion, '')), 'null'::jsonb),
                    v_descripcion
                )
        ) AS p(campo, valor_anterior, valor_nuevo, crear)
        WHERE p.crear;

    END IF;

    -- 5. Actualizar libro completo

    UPDATE libro_completo
        SET
            autor       = CASE WHEN v_actualizar_autor       THEN p_autor       ELSE autor       END,
            edicion     = CASE WHEN v_actualizar_edicion     THEN p_edicion     ELSE edicion     END,
            anio        = CASE WHEN v_actualizar_anio        THEN p_anio        ELSE anio        END,
            img         = CASE WHEN v_actualizar_img         THEN p_img         ELSE img         END,
            descripcion = CASE WHEN v_actualizar_descripcion THEN p_descripcion ELSE descripcion END
        WHERE id = p_id_libro_completo
          AND (
              v_actualizar_autor OR
              v_actualizar_edicion OR
              v_actualizar_anio OR
              v_actualizar_img OR
              v_actualizar_descripcion
          );

    -- Retornar true si se ejecutó sin errores (incluye peticiones registradas)
    return true;
end $$;


--
-- Name: fc_prohibir_modificacion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_prohibir_modificacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF pg_trigger_depth() = 0 THEN
        RAISE EXCEPTION
            'La tabla % solo puede modificarse mediante triggers.',
            TG_TABLE_NAME;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: fc_recalcular_resumen_cliente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_recalcular_resumen_cliente() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Reinicia los contadores
    UPDATE resumen_cliente
    SET
        pendiente = 0,
        listo = 0,
        retirado = 0,
        cancelado = 0;

    -- Recalcula desde la tabla pedido
    UPDATE resumen_cliente rc
    SET
        pendiente = x.pendiente,
        listo = x.listo,
        retirado = x.retirado,
        cancelado = x.cancelado
    FROM (
        SELECT
            p.id_cliente,
            COUNT(*) FILTER (WHERE p.estado IN (1,2,3)) AS pendiente,
            COUNT(*) FILTER (WHERE p.estado = 4) AS listo,
            COUNT(*) FILTER (WHERE p.estado = 5) AS retirado,
            COUNT(*) FILTER (WHERE p.estado = 6) AS cancelado
        FROM pedido p
        GROUP BY p.id_cliente
    ) x
    JOIN cliente c
        ON c.id = x.id_cliente
    WHERE rc.id_cliente = x.id_cliente
      AND c.id_empresa = fc_empresa_actual();

END;
$$;


--
-- Name: fc_recalcular_resumen_libro(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_recalcular_resumen_libro() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Reinicia los contadores
    UPDATE resumen_libro
    SET
        pendiente = 0,
        listo = 0,
        retirado = 0,
        cancelado = 0;

    -- Recalcula sumando la cantidad de cada item
    UPDATE resumen_libro rl
    SET
        pendiente = x.pendiente,
        listo = x.listo,
        retirado = x.retirado,
        cancelado = x.cancelado
    FROM (
        SELECT
            pi.id_libro, pi.id_empresa,
            COALESCE(SUM(pi.cantidad) FILTER (WHERE pi.estado IN (1,2,3)), 0) AS pendiente,
            COALESCE(SUM(pi.cantidad) FILTER (WHERE pi.estado = 4), 0) AS listo,
            COALESCE(SUM(pi.cantidad) FILTER (WHERE pi.estado = 5), 0) AS retirado,
            COALESCE(SUM(pi.cantidad) FILTER (WHERE pi.estado = 6), 0) AS cancelado
        FROM pedido_item pi
        GROUP BY pi.id_libro, pi.id_empresa
    ) x
    WHERE rl.id_libro = x.id_libro
      AND rl.id_empresa = fc_empresa_actual();
END;
$$;


--
-- Name: fc_restar_resumen_cliente(public.pedido); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_restar_resumen_cliente(p_aux public.pedido) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE resumen_cliente SET
        pendiente = pendiente - CASE WHEN p_aux.estado IN(1,2,3) THEN 1 ELSE 0 END,
        listo = listo - CASE WHEN p_aux.estado = 4 THEN 1 ELSE 0 END,
        retirado = retirado - CASE WHEN p_aux.estado = 5 THEN 1 ELSE 0 END,
        cancelado = cancelado - CASE WHEN p_aux.estado = 6 THEN 1 ELSE 0 END
    WHERE id_cliente = p_aux.id_cliente;
END;
$$;


--
-- Name: fc_restar_resumen_libro(public.pedido_item); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_restar_resumen_libro(p_aux public.pedido_item) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE resumen_libro SET
        pendiente = pendiente - CASE WHEN p_aux.estado IN(1,2,3) THEN p_aux.cantidad ELSE 0 END,
        listo = listo - CASE WHEN p_aux.estado = 4 THEN p_aux.cantidad ELSE 0 END,
        retirado = retirado - CASE WHEN p_aux.estado = 5 THEN p_aux.cantidad ELSE 0 END,
        cancelado = cancelado - CASE WHEN p_aux.estado = 6 THEN p_aux.cantidad ELSE 0 END
    WHERE id_empresa = p_aux.id_empresa
      AND id_libro = p_aux.id_libro;
END;
$$;


--
-- Name: fc_rol_usuario(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_rol_usuario(p_id uuid) RETURNS character varying
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
        declare
            v_rol varchar;
        begin
            select u.rol into v_rol from usuario u where u.id = p_id;
            return v_rol;
        end;
        $$;


--
-- Name: fc_sumar_resumen_cliente(public.pedido); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_sumar_resumen_cliente(p_aux public.pedido) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    declare v_rows integer;
BEGIN
    UPDATE resumen_cliente SET
        pendiente = pendiente + CASE WHEN p_aux.estado IN(1,2,3) THEN 1 ELSE 0 END,
        listo = listo + CASE WHEN p_aux.estado = 4 THEN 1 ELSE 0 END,
        retirado = retirado + CASE WHEN p_aux.estado = 5 THEN 1 ELSE 0 END,
        cancelado = cancelado + CASE WHEN p_aux.estado = 6 THEN 1 ELSE 0 END
    WHERE id_cliente = p_aux.id_cliente;

    GET DIAGNOSTICS v_rows = ROW_COUNT;
RAISE NOTICE 'Filas actualizadas: %', v_rows;
END;
$$;


--
-- Name: fc_sumar_resumen_libro(public.pedido_item); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_sumar_resumen_libro(p_aux public.pedido_item) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE resumen_libro
    SET
        pendiente = pendiente + CASE WHEN p_aux.estado IN (1,2,3) THEN p_aux.cantidad ELSE 0 END,
        listo = listo + CASE WHEN p_aux.estado = 4 THEN p_aux.cantidad ELSE 0 END,
        retirado = retirado + CASE WHEN p_aux.estado = 5 THEN p_aux.cantidad ELSE 0 END,
        cancelado = cancelado + CASE WHEN p_aux.estado = 6 THEN p_aux.cantidad ELSE 0 END
    WHERE id_empresa = p_aux.id_empresa
      AND id_libro = p_aux.id_libro;
END;
$$;


--
-- Name: fc_usuario_actual(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_usuario_actual() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    user_id UUID;

BEGIN
    RETURN current_setting('app.user_id', true)::UUID;
    EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$;


--
-- Name: fc_verificar_peticiones_libro_relacionados(uuid, uuid, uuid, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fc_verificar_peticiones_libro_relacionados(p_id_libro_completo uuid, p_id_usuario uuid, p_id_empresa uuid, p_campos jsonb, p_id_solicitud uuid) RETURNS TABLE(campo character varying, accion character varying, valor_actual jsonb, valor_nuevo jsonb, id_solicitud uuid, id_peticion uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
    v_id_solicitud uuid := p_id_solicitud;
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

        -- Mapear campo a valor actual
        case v_campo
            when 'nivel' then
                v_valor_actual := to_jsonb(v_actual_nivel);
            when 'nombre' then
                v_valor_actual := to_jsonb(v_actual_nombre);
            when 'editorial' then
                v_valor_actual := to_jsonb(v_actual_editorial);
            when 'materia' then
                v_valor_actual := to_jsonb(v_actual_materia);
            when 'componentes' then
                v_valor_actual := to_jsonb(v_actual_componentes);
            else
                continue; -- campo no reconocido
        end case;

        -- 3. Reglas para campos relacionados:
        -- NUNCA realiza cambios directos (no existe 'directo')
        -- Genera petición SOLO cuando valor BD ≠ valor DTO (comparación JSONB)
        -- En todos los demás casos (iguales, o uno/both null) -> sin_cambio
        --
        -- NOTA: Comparación JSONB (v_valor_actual <> v_valor_nuevo) funciona para:
        --   - UUID, texto, enteros: comparación de valor
        --   - Arrays (componentes): comparación elemento a elemento
        --   - null vs valor: true (distintos)
        --   - null vs null: false (iguales)

        if v_valor_actual <> v_valor_nuevo then
            -- Valores distintos -> generar petición, NO cambia dato
            select id_solicitud, id_peticion into v_id_solicitud, v_id_peticion
            from _fc_solicitud_registrar_peticion(
                v_id_solicitud, p_id_libro_completo, p_id_usuario, p_id_empresa,
                v_campo, v_valor_actual, v_valor_nuevo
            );
            return query select v_campo, 'peticion_creada', v_valor_actual, v_valor_nuevo, v_id_solicitud, v_id_peticion;
        else
            -- Valores iguales (incluye ambos null) -> sin petición, sin cambio
            return query select v_campo, 'sin_cambio', v_valor_actual, v_valor_nuevo, null::uuid, null::uuid;
        end if;
    end loop;
end $$;


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id bigint NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    operacion character varying(10) NOT NULL,
    tabla character varying(50) NOT NULL,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    id_usuario uuid NOT NULL,
    id_empresa uuid,
    clave jsonb
);

ALTER TABLE ONLY public.auditoria FORCE ROW LEVEL SECURITY;


--
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditoria_id_seq OWNED BY public.auditoria.id;


--
-- Name: configuraciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuraciones (
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_entrega date,
    id_dato_cobro uuid,
    id_msj_pedido_tomado uuid,
    id_msj_pedido_retirado uuid,
    id_sede uuid,
    msj_retiro boolean DEFAULT false,
    msj_envio boolean DEFAULT false,
    hora_entrega smallint,
    CONSTRAINT chk_config_hora CHECK (((hora_entrega >= 0) AND (hora_entrega <= 23)))
);


--
-- Name: dato_cobro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dato_cobro (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_empresa uuid NOT NULL,
    nombre character varying(50) NOT NULL,
    mensaje text
);


--
-- Name: empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(50) NOT NULL,
    email character varying(150) NOT NULL,
    telefono character varying(15) NOT NULL,
    CONSTRAINT ch_email CHECK (((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT ch_telefono CHECK (((telefono)::text ~ '^\+?[0-9]{10,}$'::text))
);


--
-- Name: mensaje; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensaje (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_empresa uuid NOT NULL,
    nombre character varying(50) NOT NULL,
    mensaje text
);


--
-- Name: pedido_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedido_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedido_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedido_item_id_seq OWNED BY public.pedido_item.id;


--
-- Name: peticion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peticion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_solicitud uuid NOT NULL,
    campo character varying(20) NOT NULL,
    valor_anterior character varying,
    valor_nuevo character varying,
    observaciones character varying,
    estado integer DEFAULT 1,
    CONSTRAINT chk_peticion_campo CHECK (((campo)::text = ANY (ARRAY[('anio'::character varying)::text, ('autor'::character varying)::text, ('img'::character varying)::text, ('edicion'::character varying)::text, ('descripcion'::character varying)::text, ('nombre'::character varying)::text, ('materia'::character varying)::text, ('nivel'::character varying)::text, ('componentes'::character varying)::text, ('editorial'::character varying)::text]))),
    CONSTRAINT chk_peticion_estado CHECK ((estado = ANY (ARRAY[1, 2, 3])))
);


--
-- Name: precio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.precio (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT precio_id_not_null1 NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250),
    abreviatura character varying(10),
    CONSTRAINT ch_abreviatura CHECK (((abreviatura)::text = ANY ((ARRAY['byn'::character varying, 'byn_d_f'::character varying, 'color'::character varying, 'color_d_f'::character varying, 'adhes'::character varying, 'trokelado'::character varying, 'anillado_1'::character varying, 'anillado_2'::character varying, 'anillado_3'::character varying, 'anillado_4'::character varying])::text[]))),
    CONSTRAINT ch_precio_nombre_valido CHECK ((length((nombre)::text) >= 3))
);


--
-- Name: precio_categoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.precio_categoria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(30) NOT NULL,
    bloqueado boolean DEFAULT false
);


--
-- Name: precio_empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.precio_empresa (
    id_precio uuid DEFAULT gen_random_uuid() CONSTRAINT precio_id_not_null NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT precio_fecha_creacion_not_null NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT precio_fecha_actualizacion_not_null NOT NULL,
    deleted boolean DEFAULT false,
    importe numeric(10,2) DEFAULT 0 CONSTRAINT precio_importe_not_null NOT NULL,
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    detalles character varying(250),
    id_categoria uuid,
    CONSTRAINT ch_importe_positivo CHECK ((importe >= (0)::numeric))
);


--
-- Name: propuesta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propuesta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(50) NOT NULL,
    id_empresa uuid DEFAULT public.fc_empresa_actual()
);


--
-- Name: propuesta_libro_empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propuesta_libro_empresa (
    id_libro uuid NOT NULL,
    id_empresa uuid DEFAULT public.fc_empresa_actual() NOT NULL,
    id_propuesta uuid NOT NULL
);


--
-- Name: solicitud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_libro_completo uuid NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_resolucion timestamp without time zone,
    id_usuario uuid NOT NULL,
    estado integer,
    id_empresa uuid NOT NULL,
    CONSTRAINT chk_solicitud_estado CHECK ((estado = ANY (ARRAY[1, 2, 3])))
);


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted boolean DEFAULT false,
    nombre character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    id_empresa uuid DEFAULT public.fc_empresa_actual(),
    rol character varying(20) DEFAULT 'operador'::character varying NOT NULL,
    email character varying(50) NOT NULL,
    CONSTRAINT ch_tipos_rol CHECK (((rol)::text = ANY ((ARRAY['super_admin'::character varying, 'admin'::character varying, 'operador'::character varying])::text[]))),
    CONSTRAINT ck_super_admin_empresa CHECK (((((rol)::text <> 'super_admin'::text) AND (id_empresa IS NOT NULL)) OR (((rol)::text = 'super_admin'::text) AND (id_empresa IS NULL))))
);


--
-- Name: usuario_mensaje_fav; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario_mensaje_fav (
    id_usuario uuid DEFAULT public.fc_usuario_actual() NOT NULL,
    id_mensaje uuid NOT NULL
);


--
-- Name: vw_cambio_estado_pedido; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_cambio_estado_pedido AS
 SELECT p.id,
    p.estado,
    p.fecha_actualizacion,
    p.id_cliente,
    rc.retirado,
    rc.listo,
    rc.pendiente,
    rc.cancelado,
    pi.id_libro,
    pi.id_empresa,
    pi.id AS nro_pedido,
    rl.retirado AS libro_retirado,
    rl.listo AS libro_listo,
    rl.pendiente AS libro_pendiente,
    rl.cancelado AS libro_cancelado
   FROM (((public.pedido p
     JOIN public.pedido_item pi ON ((pi.id_pedido = p.id)))
     JOIN public.resumen_libro rl ON (((rl.id_libro = pi.id_libro) AND (rl.id_empresa = pi.id_empresa))))
     JOIN public.resumen_cliente rc ON ((rc.id_cliente = p.id_cliente)));


--
-- Name: vw_cambio_sede; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_cambio_sede AS
 SELECT pi.fecha_actualizacion,
    pi.id_pedido,
    pi.id,
    pi.id_libro,
    pi.id_empresa,
    pi.id_sede,
    p.id_cliente,
    s.nombre AS sede
   FROM ((public.pedido_item pi
     JOIN public.pedido p ON ((p.id = pi.id_pedido)))
     JOIN public.sede s ON ((pi.id_sede = s.id)));


--
-- Name: vw_empresa_completa; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_empresa_completa AS
 SELECT e.id,
    e.fecha_creacion,
    e.fecha_actualizacion,
    e.deleted,
    e.nombre,
    e.email,
    e.telefono,
    c.fecha_entrega,
    c.id_dato_cobro,
    c.id_msj_pedido_tomado,
    c.id_msj_pedido_retirado,
    c.id_sede,
    c.msj_retiro,
    c.msj_envio,
    c.hora_entrega,
    dc.nombre AS dato_cobro_nombre,
    dc.mensaje AS dato_cobro_mensaje,
    mr.nombre AS retirado_nombre,
    mr.mensaje AS retirado_mensaje,
    mt.nombre AS tomado_nombre,
    mt.mensaje AS tomado_mensaje,
    s.nombre AS sede,
    c.fecha_actualizacion AS config_fecha_actualizacion
   FROM (((((public.empresa e
     LEFT JOIN public.configuraciones c ON ((c.id_empresa = e.id)))
     LEFT JOIN public.dato_cobro dc ON ((dc.id = c.id_dato_cobro)))
     LEFT JOIN public.mensaje mr ON ((mr.id = c.id_msj_pedido_retirado)))
     LEFT JOIN public.mensaje mt ON ((mt.id = c.id_msj_pedido_tomado)))
     LEFT JOIN public.sede s ON ((s.id = c.id_sede)));


--
-- Name: vw_libro_completo; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_libro_completo WITH (security_invoker='true') AS
 SELECT lc.id,
    l.nombre,
    lc.descripcion,
    lc.edicion,
    lc.autor,
    lc.anio,
    lc.img,
    n.nombre AS nivel,
    vw_c.componentes,
    m.nombre AS materia,
    e.nombre AS editorial
   FROM (((((public.libro_completo lc
     LEFT JOIN public.nivel n ON ((lc.id_nivel = n.id)))
     JOIN public.libro l ON ((l.id = lc.id_libro)))
     LEFT JOIN public.materia m ON ((m.id = l.id_materia)))
     LEFT JOIN public.editorial e ON ((e.id = l.id_editorial)))
     LEFT JOIN public.vw_componentes vw_c ON ((vw_c.id_libro = lc.id)));


--
-- Name: vw_libro_componentes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_libro_componentes WITH (security_invoker='true') AS
 SELECT lc.id_libro,
    string_agg(DISTINCT (c.nombre)::text, ', '::text) AS componentes
   FROM (public.libro_componente lc
     JOIN public.componente c ON ((c.id = lc.id_componente)))
  GROUP BY lc.id_libro;


--
-- Name: vw_libro_nombre; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_libro_nombre WITH (security_invoker='true') AS
 SELECT l.id,
    l.nombre,
    l.deleted,
    m.id AS id_materia,
    m.nombre AS materia,
    e.id AS id_editorial,
    e.nombre AS editorial
   FROM ((public.libro l
     LEFT JOIN public.materia m ON ((l.id_materia = m.id)))
     LEFT JOIN public.editorial e ON ((e.id = l.id_editorial)));


--
-- Name: vw_pedido_libro; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_pedido_libro WITH (security_invoker='true') AS
 SELECT pi.id_pedido,
    pi.id AS nro_pedido,
    pi.cantidad,
    pi.detalles,
    pi.estado,
    pi.id_libro,
    vwe.especificaciones,
    p.fecha_creacion,
    p.fecha_entrega,
    p.importe_total,
    p.sena,
    p.anillados,
    p.archivos,
    p.estado AS estado_pedido,
    s.nombre AS sede,
    s.id AS id_sede,
    c.telefono,
    c.email,
    count(*) OVER () AS total,
    c.id AS id_cliente
   FROM ((((public.pedido_item pi
     LEFT JOIN public.vw_especificaciones vwe ON (((vwe.id_pedido = pi.id_pedido) AND (pi.id = vwe.nro_item))))
     JOIN public.pedido p ON ((p.id = pi.id_pedido)))
     JOIN public.cliente c ON ((c.id = p.id_cliente)))
     LEFT JOIN public.sede s ON ((s.id = pi.id_sede)));


--
-- Name: vw_propuesta; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_propuesta WITH (security_invoker='true') AS
 SELECT ple.id_libro,
    ple.id_propuesta,
    p.nombre AS nombre_propuesta,
    p.fecha_creacion,
    p.fecha_actualizacion,
    p.deleted AS deleted_propuesta,
    vwlb.nombre,
    vwlb.descripcion,
    vwlb.edicion,
    vwlb.autor,
    vwlb.anio,
    vwlb.img,
    vwlb.nivel,
    vwlb.componentes,
    vwlb.cantidad_pg,
    vwlb.cantidad_adhesivo,
    vwlb.especificaciones_defecto,
    vwlb.materia,
    vwlb.editorial,
    vwlb.detalle_impresion,
    vwlb.deleted,
    vwlb.id_materia
   FROM ((public.propuesta_libro_empresa ple
     LEFT JOIN public.vw_libro_busqueda vwlb ON ((vwlb.id = ple.id_libro)))
     LEFT JOIN public.propuesta p ON ((p.id = ple.id_propuesta)));


--
-- Name: auditoria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id SET DEFAULT nextval('public.auditoria_id_seq'::regclass);


--
-- Name: pedido_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item ALTER COLUMN id SET DEFAULT nextval('public.pedido_item_id_seq'::regclass);


--
-- Name: auditoria pk_auditoria; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT pk_auditoria PRIMARY KEY (id);


--
-- Name: cliente pk_cliente; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT pk_cliente PRIMARY KEY (id);


--
-- Name: componente pk_componente; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.componente
    ADD CONSTRAINT pk_componente PRIMARY KEY (id);


--
-- Name: configuraciones pk_config; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT pk_config PRIMARY KEY (id_empresa);


--
-- Name: dato_cobro pk_dato_cobro; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dato_cobro
    ADD CONSTRAINT pk_dato_cobro PRIMARY KEY (id);


--
-- Name: empresa pk_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT pk_empresa PRIMARY KEY (id);


--
-- Name: especificacion pk_especificacion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especificacion
    ADD CONSTRAINT pk_especificacion PRIMARY KEY (id);


--
-- Name: editorial pk_id_editorial; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorial
    ADD CONSTRAINT pk_id_editorial PRIMARY KEY (id);


--
-- Name: libro pk_id_libro; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro
    ADD CONSTRAINT pk_id_libro PRIMARY KEY (id);


--
-- Name: materia pk_id_materia; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT pk_id_materia PRIMARY KEY (id);


--
-- Name: libro_completo pk_libro_completo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_completo
    ADD CONSTRAINT pk_libro_completo PRIMARY KEY (id);


--
-- Name: libro_componente pk_libro_componente; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_componente
    ADD CONSTRAINT pk_libro_componente PRIMARY KEY (id_libro, id_componente);


--
-- Name: libro_empresa pk_libro_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_empresa
    ADD CONSTRAINT pk_libro_empresa PRIMARY KEY (id_empresa, id_libro);


--
-- Name: mensaje pk_mensaje; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT pk_mensaje PRIMARY KEY (id);


--
-- Name: nivel pk_nivel; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nivel
    ADD CONSTRAINT pk_nivel PRIMARY KEY (id);


--
-- Name: pedido pk_pedido; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pk_pedido PRIMARY KEY (id);


--
-- Name: pedido_item pk_pedido_item; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item
    ADD CONSTRAINT pk_pedido_item PRIMARY KEY (id_pedido, id);


--
-- Name: pedido_item_especificacion pk_pedido_item_especificacion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item_especificacion
    ADD CONSTRAINT pk_pedido_item_especificacion PRIMARY KEY (id_pedido, nro_item, id_especificacion);


--
-- Name: peticion pk_peticion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peticion
    ADD CONSTRAINT pk_peticion PRIMARY KEY (id);


--
-- Name: precio pk_precio; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio
    ADD CONSTRAINT pk_precio PRIMARY KEY (id);


--
-- Name: precio_categoria pk_precio_categoria; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio_categoria
    ADD CONSTRAINT pk_precio_categoria PRIMARY KEY (id);


--
-- Name: precio_empresa pk_precio_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio_empresa
    ADD CONSTRAINT pk_precio_empresa PRIMARY KEY (id_empresa, id_precio);


--
-- Name: propuesta pk_propuesta; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuesta
    ADD CONSTRAINT pk_propuesta PRIMARY KEY (id);


--
-- Name: propuesta_libro_empresa pk_propuesta_libro_empresa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuesta_libro_empresa
    ADD CONSTRAINT pk_propuesta_libro_empresa PRIMARY KEY (id_empresa, id_libro, id_propuesta);


--
-- Name: resumen_cliente pk_resumen; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumen_cliente
    ADD CONSTRAINT pk_resumen PRIMARY KEY (id_cliente);


--
-- Name: resumen_libro pk_resumen_libro; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumen_libro
    ADD CONSTRAINT pk_resumen_libro PRIMARY KEY (id_empresa, id_libro);


--
-- Name: sede pk_sede; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede
    ADD CONSTRAINT pk_sede PRIMARY KEY (id);


--
-- Name: solicitud pk_solicitud; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT pk_solicitud PRIMARY KEY (id);


--
-- Name: stock pk_stock; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT pk_stock PRIMARY KEY (id_empresa, id_libro);


--
-- Name: usuario pk_usuario; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT pk_usuario PRIMARY KEY (id);


--
-- Name: usuario uk_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT uk_email UNIQUE (email);


--
-- Name: precio uq_abreviatura; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio
    ADD CONSTRAINT uq_abreviatura UNIQUE (abreviatura);


--
-- Name: cliente uq_cliente_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT uq_cliente_email UNIQUE (id_empresa, email);


--
-- Name: cliente uq_cliente_telefono; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT uq_cliente_telefono UNIQUE (id_empresa, telefono);


--
-- Name: componente uq_componente_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.componente
    ADD CONSTRAINT uq_componente_nombre UNIQUE (nombre);


--
-- Name: dato_cobro uq_dato_cobro_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dato_cobro
    ADD CONSTRAINT uq_dato_cobro_nombre UNIQUE (id_empresa, nombre);


--
-- Name: editorial uq_editorial_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editorial
    ADD CONSTRAINT uq_editorial_nombre UNIQUE (nombre);


--
-- Name: empresa uq_empresa_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT uq_empresa_email UNIQUE (email);


--
-- Name: empresa uq_empresa_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT uq_empresa_nombre UNIQUE (nombre);


--
-- Name: empresa uq_empresa_telefono; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT uq_empresa_telefono UNIQUE (telefono);


--
-- Name: especificacion uq_esp_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especificacion
    ADD CONSTRAINT uq_esp_nombre UNIQUE (nombre);


--
-- Name: libro uq_libro_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro
    ADD CONSTRAINT uq_libro_nombre UNIQUE (nombre);


--
-- Name: materia uq_materia_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT uq_materia_nombre UNIQUE (nombre);


--
-- Name: mensaje uq_mensaje_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT uq_mensaje_nombre UNIQUE (id_empresa, nombre);


--
-- Name: nivel uq_nivel_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nivel
    ADD CONSTRAINT uq_nivel_nombre UNIQUE (nombre);


--
-- Name: usuario uq_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT uq_nombre UNIQUE (id_empresa, nombre);


--
-- Name: precio_categoria uq_precio_categoria_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio_categoria
    ADD CONSTRAINT uq_precio_categoria_nombre UNIQUE (nombre);


--
-- Name: precio uq_precio_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio
    ADD CONSTRAINT uq_precio_nombre UNIQUE (nombre);


--
-- Name: propuesta uq_propuesta_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuesta
    ADD CONSTRAINT uq_propuesta_nombre UNIQUE (id_empresa, nombre);


--
-- Name: sede uq_sede_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede
    ADD CONSTRAINT uq_sede_nombre UNIQUE (id_empresa, nombre);


--
-- Name: ix_pedido_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedido_cliente ON public.pedido USING btree (id_cliente);


--
-- Name: ix_pedido_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedido_estado ON public.pedido USING btree (estado);


--
-- Name: ix_pedido_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedido_fecha ON public.pedido USING btree (fecha_entrega);


--
-- Name: ix_pedido_item_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedido_item_estado ON public.pedido_item USING btree (id_pedido, id, estado);


--
-- Name: uq_super_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_super_admin ON public.usuario USING btree (rol) WHERE ((rol)::text = 'super_admin'::text);


--
-- Name: pedido tr_actualiza_resumen_cliente_update_estado; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_actualiza_resumen_cliente_update_estado AFTER UPDATE OF estado ON public.pedido FOR EACH ROW WHEN (((old.estado IS DISTINCT FROM new.estado) AND (NOT ((old.estado = ANY (ARRAY[1, 2, 3])) AND (new.estado = ANY (ARRAY[1, 2, 3])))))) EXECUTE FUNCTION public.fc_actualizar_resumen_cliente();


--
-- Name: pedido_item tr_actualizar_estado_pedido; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_actualizar_estado_pedido AFTER INSERT OR DELETE OR UPDATE ON public.pedido_item FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_estado_pedido();


--
-- Name: pedido tr_actualizar_resumen_cliente_insert_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_actualizar_resumen_cliente_insert_delete AFTER INSERT OR DELETE ON public.pedido FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_resumen_cliente();


--
-- Name: pedido_item tr_actualizar_resumen_libro; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_actualizar_resumen_libro AFTER INSERT OR DELETE OR UPDATE ON public.pedido_item FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_resumen();


--
-- Name: cliente tr_auditoria_cliente; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_cliente AFTER INSERT OR DELETE OR UPDATE ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: componente tr_auditoria_componente; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_componente AFTER INSERT OR DELETE OR UPDATE ON public.componente FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: libro tr_auditoria_libro; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_libro AFTER INSERT OR DELETE OR UPDATE ON public.libro FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: libro_componente tr_auditoria_libro_componente; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_libro_componente AFTER INSERT OR DELETE OR UPDATE ON public.libro_componente FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id_libro', 'id_componente');


--
-- Name: libro_empresa tr_auditoria_libro_empresa; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_libro_empresa AFTER INSERT OR DELETE OR UPDATE ON public.libro_empresa FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id_libro', 'id_empresa');


--
-- Name: precio_empresa tr_auditoria_lprecio; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_lprecio AFTER INSERT OR DELETE OR UPDATE ON public.precio_empresa FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: materia tr_auditoria_materia; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_materia AFTER INSERT ON public.materia FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: pedido tr_auditoria_pedido; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_pedido AFTER INSERT OR DELETE OR UPDATE ON public.pedido FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: pedido_item tr_auditoria_pedido_item; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_pedido_item AFTER INSERT OR DELETE OR UPDATE ON public.pedido_item FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id_pedido', 'id');


--
-- Name: pedido_item_especificacion tr_auditoria_pedido_item_especificacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_pedido_item_especificacion AFTER INSERT OR DELETE OR UPDATE ON public.pedido_item_especificacion FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id_pedido', 'nro_item', 'id_especificacion');


--
-- Name: propuesta tr_auditoria_propuesta; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_propuesta AFTER INSERT OR DELETE OR UPDATE ON public.propuesta FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: sede tr_auditoria_sede; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_sede AFTER INSERT OR DELETE OR UPDATE ON public.sede FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: stock tr_auditoria_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auditoria_stock AFTER INSERT OR DELETE OR UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id_empresa', 'id_libro');


--
-- Name: cliente tr_cliente_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_cliente_delete BEFORE DELETE ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.fc_cliente_delete();


--
-- Name: cliente tr_cliente_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_cliente_fecha_actualizacion BEFORE UPDATE ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: componente tr_componente_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_componente_fecha_actualizacion BEFORE UPDATE ON public.componente FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: configuraciones tr_config_auditoria; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_config_auditoria AFTER INSERT OR DELETE OR UPDATE ON public.configuraciones FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id_empresa');


--
-- Name: configuraciones tr_config_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_config_fecha_actualizacion BEFORE UPDATE ON public.configuraciones FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: cliente tr_crear_resumen_cliente; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_crear_resumen_cliente AFTER INSERT ON public.cliente FOR EACH ROW EXECUTE FUNCTION public.fc_crear_resumen_cliente();


--
-- Name: libro_empresa tr_crear_resumen_libro; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_crear_resumen_libro AFTER INSERT ON public.libro_empresa FOR EACH ROW EXECUTE FUNCTION public.fc_crear_resumen_libro();


--
-- Name: libro_empresa tr_crear_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_crear_stock AFTER INSERT ON public.libro_empresa FOR EACH ROW EXECUTE FUNCTION public.fc_crear_stock();


--
-- Name: empresa tr_empresa_auditoria; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_empresa_auditoria AFTER INSERT OR DELETE OR UPDATE ON public.empresa FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: empresa tr_empresa_config_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_empresa_config_insert AFTER INSERT ON public.empresa FOR EACH ROW EXECUTE FUNCTION public.fc_crear_configuraciones();


--
-- Name: empresa tr_empresa_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_empresa_fecha_actualizacion BEFORE UPDATE ON public.empresa FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: libro_completo tr_libro_completo_auditoria; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_libro_completo_auditoria AFTER INSERT OR DELETE OR UPDATE ON public.libro_completo FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: libro_empresa tr_libro_empresa_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_libro_empresa_delete BEFORE DELETE ON public.libro_empresa FOR EACH ROW EXECUTE FUNCTION public.fc_libro_empresa_delete();


--
-- Name: libro tr_libro_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_libro_fecha_actualizacion BEFORE UPDATE ON public.libro FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: materia tr_materia_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_materia_fecha_actualizacion BEFORE UPDATE ON public.materia FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: nivel tr_nivel_auditoria; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_nivel_auditoria AFTER INSERT ON public.nivel FOR EACH ROW EXECUTE FUNCTION public.fc_auditoria('id');


--
-- Name: nivel tr_nivel_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_nivel_fecha_actualizacion BEFORE UPDATE ON public.nivel FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: pedido tr_pedido_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_pedido_fecha_actualizacion BEFORE UPDATE ON public.pedido FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: pedido_item tr_pedido_item_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_pedido_item_fecha_actualizacion BEFORE UPDATE ON public.pedido_item FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: peticion tr_peticion_cerrar_solicitud; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_peticion_cerrar_solicitud AFTER UPDATE OF estado ON public.peticion FOR EACH ROW EXECUTE FUNCTION public.fc_peticion_cerrar_solicitud();


--
-- Name: precio_empresa tr_precio_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_precio_fecha_actualizacion BEFORE UPDATE ON public.precio_empresa FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: propuesta tr_propuesta_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_propuesta_fecha_actualizacion BEFORE UPDATE ON public.propuesta FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: sede tr_sede_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_sede_fecha_actualizacion BEFORE UPDATE ON public.sede FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: stock tr_stock_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_stock_fecha_actualizacion BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: usuario tr_usuario_fecha_actualizacion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_usuario_fecha_actualizacion BEFORE UPDATE ON public.usuario FOR EACH ROW EXECUTE FUNCTION public.fc_actualizar_fecha_actualizacion();


--
-- Name: auditoria fk_auditoria_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_auditoria_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id);


--
-- Name: auditoria fk_auditoria_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


--
-- Name: pedido fk_cliente_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_cliente_pedido FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- Name: resumen_cliente fk_cliente_resumen; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumen_cliente
    ADD CONSTRAINT fk_cliente_resumen FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- Name: configuraciones fk_config_dato_cobro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT fk_config_dato_cobro FOREIGN KEY (id_dato_cobro) REFERENCES public.dato_cobro(id);


--
-- Name: configuraciones fk_config_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT fk_config_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: configuraciones fk_config_mensaje_retirado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT fk_config_mensaje_retirado FOREIGN KEY (id_msj_pedido_retirado) REFERENCES public.mensaje(id);


--
-- Name: configuraciones fk_config_mensaje_tomado; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT fk_config_mensaje_tomado FOREIGN KEY (id_msj_pedido_tomado) REFERENCES public.mensaje(id);


--
-- Name: configuraciones fk_config_sede; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuraciones
    ADD CONSTRAINT fk_config_sede FOREIGN KEY (id_sede) REFERENCES public.sede(id);


--
-- Name: dato_cobro fk_dato_cobro_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dato_cobro
    ADD CONSTRAINT fk_dato_cobro_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: usuario fk_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: cliente fk_empresa_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_empresa_cliente FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: pedido fk_empresa_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_empresa_pedido FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: sede fk_empresa_sede; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede
    ADD CONSTRAINT fk_empresa_sede FOREIGN KEY (id_empresa) REFERENCES public.empresa(id);


--
-- Name: pedido_item_especificacion fk_especificacion; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item_especificacion
    ADD CONSTRAINT fk_especificacion FOREIGN KEY (id_especificacion) REFERENCES public.especificacion(id) ON DELETE CASCADE;


--
-- Name: libro fk_id_materia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro
    ADD CONSTRAINT fk_id_materia FOREIGN KEY (id_materia) REFERENCES public.materia(id) ON DELETE CASCADE;


--
-- Name: pedido_item fk_item_libro_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item
    ADD CONSTRAINT fk_item_libro_empresa FOREIGN KEY (id_empresa, id_libro) REFERENCES public.libro_empresa(id_empresa, id_libro) ON DELETE CASCADE;


--
-- Name: pedido_item fk_item_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item
    ADD CONSTRAINT fk_item_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id) ON DELETE CASCADE;


--
-- Name: pedido_item fk_item_sede; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item
    ADD CONSTRAINT fk_item_sede FOREIGN KEY (id_sede) REFERENCES public.sede(id) ON DELETE CASCADE;


--
-- Name: libro_completo fk_libro_completo_libro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_completo
    ADD CONSTRAINT fk_libro_completo_libro FOREIGN KEY (id_libro) REFERENCES public.libro(id) ON DELETE CASCADE;


--
-- Name: libro_completo fk_libro_completo_nivel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_completo
    ADD CONSTRAINT fk_libro_completo_nivel FOREIGN KEY (id_nivel) REFERENCES public.nivel(id);


--
-- Name: libro_componente fk_libro_componente_componente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_componente
    ADD CONSTRAINT fk_libro_componente_componente FOREIGN KEY (id_componente) REFERENCES public.componente(id) ON DELETE CASCADE;


--
-- Name: libro_componente fk_libro_componente_libro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_componente
    ADD CONSTRAINT fk_libro_componente_libro FOREIGN KEY (id_libro) REFERENCES public.libro_completo(id) ON DELETE CASCADE;


--
-- Name: libro fk_libro_editorial; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro
    ADD CONSTRAINT fk_libro_editorial FOREIGN KEY (id_editorial) REFERENCES public.editorial(id);


--
-- Name: propuesta_libro_empresa fk_libro_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuesta_libro_empresa
    ADD CONSTRAINT fk_libro_empresa FOREIGN KEY (id_empresa, id_libro) REFERENCES public.libro_empresa(id_empresa, id_libro) ON DELETE CASCADE;


--
-- Name: libro_empresa fk_libro_empresa_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_empresa
    ADD CONSTRAINT fk_libro_empresa_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: libro_empresa fk_libro_empresa_libro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libro_empresa
    ADD CONSTRAINT fk_libro_empresa_libro FOREIGN KEY (id_libro) REFERENCES public.libro_completo(id) ON DELETE CASCADE;


--
-- Name: mensaje fk_mensaje_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT fk_mensaje_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: peticion fk_peticion_solicitud; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peticion
    ADD CONSTRAINT fk_peticion_solicitud FOREIGN KEY (id_solicitud) REFERENCES public.solicitud(id);


--
-- Name: pedido_item_especificacion fk_pie_pedido_items; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_item_especificacion
    ADD CONSTRAINT fk_pie_pedido_items FOREIGN KEY (id_pedido, nro_item) REFERENCES public.pedido_item(id_pedido, id) ON DELETE CASCADE;


--
-- Name: precio_empresa fk_precio_categoria; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio_empresa
    ADD CONSTRAINT fk_precio_categoria FOREIGN KEY (id_categoria) REFERENCES public.precio_categoria(id);


--
-- Name: precio_empresa fk_precio_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio_empresa
    ADD CONSTRAINT fk_precio_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: precio_empresa fk_precio_empresa_precio; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.precio_empresa
    ADD CONSTRAINT fk_precio_empresa_precio FOREIGN KEY (id_precio) REFERENCES public.precio(id) ON DELETE CASCADE;


--
-- Name: propuesta_libro_empresa fk_propuesta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuesta_libro_empresa
    ADD CONSTRAINT fk_propuesta FOREIGN KEY (id_propuesta) REFERENCES public.propuesta(id) ON DELETE CASCADE;


--
-- Name: propuesta fk_propuesta_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuesta
    ADD CONSTRAINT fk_propuesta_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- Name: resumen_libro fk_resumen_libro_libro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumen_libro
    ADD CONSTRAINT fk_resumen_libro_libro FOREIGN KEY (id_empresa, id_libro) REFERENCES public.libro_empresa(id_empresa, id_libro) ON DELETE CASCADE;


--
-- Name: solicitud fk_solicitud_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT fk_solicitud_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id);


--
-- Name: solicitud fk_solicitud_libro_completo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT fk_solicitud_libro_completo FOREIGN KEY (id_libro_completo) REFERENCES public.libro_completo(id);


--
-- Name: solicitud fk_solicitud_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud
    ADD CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


--
-- Name: stock fk_stock_libro_empresa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT fk_stock_libro_empresa FOREIGN KEY (id_empresa, id_libro) REFERENCES public.libro_empresa(id_empresa, id_libro) ON DELETE CASCADE;


--
-- Name: usuario_mensaje_fav fk_umf_mensaje; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_mensaje_fav
    ADD CONSTRAINT fk_umf_mensaje FOREIGN KEY (id_mensaje) REFERENCES public.mensaje(id);


--
-- Name: usuario_mensaje_fav fk_umf_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_mensaje_fav
    ADD CONSTRAINT fk_umf_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


--
-- Name: auditoria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

--
-- Name: cliente; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cliente ENABLE ROW LEVEL SECURITY;

--
-- Name: componente; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.componente ENABLE ROW LEVEL SECURITY;

--
-- Name: configuraciones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.configuraciones ENABLE ROW LEVEL SECURITY;

--
-- Name: dato_cobro; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dato_cobro ENABLE ROW LEVEL SECURITY;

--
-- Name: editorial; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.editorial ENABLE ROW LEVEL SECURITY;

--
-- Name: empresa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;

--
-- Name: especificacion; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.especificacion ENABLE ROW LEVEL SECURITY;

--
-- Name: libro; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.libro ENABLE ROW LEVEL SECURITY;

--
-- Name: libro_completo; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.libro_completo ENABLE ROW LEVEL SECURITY;

--
-- Name: libro_componente; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.libro_componente ENABLE ROW LEVEL SECURITY;

--
-- Name: libro_empresa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.libro_empresa ENABLE ROW LEVEL SECURITY;

--
-- Name: materia; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.materia ENABLE ROW LEVEL SECURITY;

--
-- Name: mensaje; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mensaje ENABLE ROW LEVEL SECURITY;

--
-- Name: nivel; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nivel ENABLE ROW LEVEL SECURITY;

--
-- Name: auditoria pc_auditoria_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_auditoria_select ON public.auditoria FOR SELECT USING ((public.fc_es_super_admin() OR (public.fc_es_admin() AND public.fc_es_empresa_actual(id_empresa))));


--
-- Name: cliente pc_cliente; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_cliente ON public.cliente USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: componente pc_componente_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_componente_delete ON public.componente FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: componente pc_componente_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_componente_insert ON public.componente FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: componente pc_componente_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_componente_select ON public.componente FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: componente pc_componente_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_componente_update ON public.componente FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: configuraciones pc_config_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_config_select ON public.configuraciones FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: configuraciones pc_config_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_config_update ON public.configuraciones FOR UPDATE USING (public.fc_es_empresa_actual(id_empresa)) WITH CHECK (public.fc_es_empresa_actual(id_empresa));


--
-- Name: dato_cobro pc_dato_cobro_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_dato_cobro_delete ON public.dato_cobro FOR DELETE USING ((public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin()));


--
-- Name: dato_cobro pc_dato_cobro_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_dato_cobro_insert ON public.dato_cobro FOR INSERT WITH CHECK ((public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin()));


--
-- Name: dato_cobro pc_dato_cobro_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_dato_cobro_select ON public.dato_cobro FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: dato_cobro pc_dato_cobro_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_dato_cobro_update ON public.dato_cobro FOR UPDATE USING ((public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin())) WITH CHECK ((public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin()));


--
-- Name: editorial pc_editorial_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_editorial_delete ON public.editorial FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: editorial pc_editorial_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_editorial_insert ON public.editorial FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: editorial pc_editorial_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_editorial_select ON public.editorial FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: editorial pc_editorial_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_editorial_update ON public.editorial FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: empresa pc_empresa_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_empresa_delete ON public.empresa FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: empresa pc_empresa_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_empresa_insert ON public.empresa FOR INSERT WITH CHECK (public.fc_es_super_admin());


--
-- Name: empresa pc_empresa_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_empresa_select ON public.empresa FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id)));


--
-- Name: empresa pc_empresa_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_empresa_update ON public.empresa FOR UPDATE USING ((public.fc_es_super_admin() OR (public.fc_es_admin() AND public.fc_es_empresa_actual(id)))) WITH CHECK ((public.fc_es_super_admin() OR (public.fc_es_admin() AND public.fc_es_empresa_actual(id))));


--
-- Name: especificacion pc_especificacion_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_especificacion_delete ON public.especificacion FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: especificacion pc_especificacion_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_especificacion_insert ON public.especificacion FOR INSERT WITH CHECK (public.fc_es_super_admin());


--
-- Name: especificacion pc_especificacion_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_especificacion_select ON public.especificacion FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: especificacion pc_especificacion_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_especificacion_update ON public.especificacion FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: libro_completo pc_libro_completo_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_completo_delete ON public.libro_completo FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: libro_completo pc_libro_completo_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_completo_insert ON public.libro_completo FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: libro_completo pc_libro_completo_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_completo_select ON public.libro_completo FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: libro_completo pc_libro_completo_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_completo_update ON public.libro_completo FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: libro_componente pc_libro_componente_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_componente_delete ON public.libro_componente FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: libro_componente pc_libro_componente_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_componente_insert ON public.libro_componente FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: libro_componente pc_libro_componente_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_componente_select ON public.libro_componente FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: libro_componente pc_libro_componente_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_componente_update ON public.libro_componente FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: libro pc_libro_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_delete ON public.libro FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: libro_empresa pc_libro_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_empresa ON public.libro_empresa USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: libro pc_libro_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_insert ON public.libro FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: libro pc_libro_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_select ON public.libro FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: libro pc_libro_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_libro_update ON public.libro FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: materia pc_materia_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_materia_delete ON public.materia FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: materia pc_materia_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_materia_insert ON public.materia FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: materia pc_materia_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_materia_select ON public.materia FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: materia pc_materia_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_materia_update ON public.materia FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: mensaje pc_msj_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_msj_delete ON public.mensaje FOR DELETE USING ((public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin()));


--
-- Name: mensaje pc_msj_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_msj_insert ON public.mensaje FOR INSERT WITH CHECK (public.fc_es_empresa_actual(id_empresa));


--
-- Name: mensaje pc_msj_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_msj_select ON public.mensaje FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: mensaje pc_msj_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_msj_update ON public.mensaje FOR UPDATE USING (public.fc_es_empresa_actual(id_empresa)) WITH CHECK (public.fc_es_empresa_actual(id_empresa));


--
-- Name: nivel pc_nivel_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_nivel_insert ON public.nivel FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: nivel pc_nivel_nombre; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_nivel_nombre ON public.nivel FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: nivel pc_nivel_nombre_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_nivel_nombre_delete ON public.nivel FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: nivel pc_nivel_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_nivel_select ON public.nivel FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: pedido pc_pedido_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_pedido_all ON public.pedido USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: pedido_item pc_pedido_item_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_pedido_item_all ON public.pedido_item USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: peticion pc_peticion_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_peticion_delete ON public.peticion FOR DELETE USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(( SELECT solicitud.id_empresa
   FROM public.solicitud
  WHERE (solicitud.id = peticion.id_solicitud)
 LIMIT 1))));


--
-- Name: peticion pc_peticion_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_peticion_insert ON public.peticion FOR INSERT WITH CHECK (public.fc_es_empresa_actual(( SELECT solicitud.id_empresa
   FROM public.solicitud
  WHERE (solicitud.id = peticion.id_solicitud)
 LIMIT 1)));


--
-- Name: peticion pc_peticion_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_peticion_select ON public.peticion FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(( SELECT solicitud.id_empresa
   FROM public.solicitud
  WHERE (solicitud.id = peticion.id_solicitud)
 LIMIT 1))));


--
-- Name: peticion pc_peticion_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_peticion_update ON public.peticion FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: precio_categoria pc_precio_categoria_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_categoria_delete ON public.precio_categoria FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: precio_categoria pc_precio_categoria_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_categoria_insert ON public.precio_categoria FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: precio_categoria pc_precio_categoria_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_categoria_select ON public.precio_categoria FOR SELECT USING ((public.fc_es_super_admin() OR (EXISTS ( SELECT 1
   FROM public.precio_empresa pe
  WHERE ((pe.id_categoria = precio_categoria.id) AND public.fc_es_empresa_actual(pe.id_empresa))))));


--
-- Name: precio_categoria pc_precio_categoria_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_categoria_update ON public.precio_categoria FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: precio pc_precio_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_delete ON public.precio FOR DELETE USING (public.fc_es_super_admin());


--
-- Name: precio_empresa pc_precio_empresa; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_empresa ON public.precio_empresa USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: precio pc_precio_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_insert ON public.precio FOR INSERT WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: precio pc_precio_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_select ON public.precio FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: precio pc_precio_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_precio_update ON public.precio FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: propuesta pc_propuesta_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_propuesta_delete ON public.propuesta FOR DELETE USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: propuesta pc_propuesta_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_propuesta_insert ON public.propuesta FOR INSERT WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: propuesta_libro_empresa pc_propuesta_libro_empresa_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_propuesta_libro_empresa_all ON public.propuesta_libro_empresa USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: propuesta pc_propuesta_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_propuesta_select ON public.propuesta FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: propuesta pc_propuesta_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_propuesta_update ON public.propuesta FOR UPDATE USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa))) WITH CHECK ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: resumen_cliente pc_resumen_cliente_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_resumen_cliente_select ON public.resumen_cliente FOR SELECT USING ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: resumen_libro pc_resumen_libro_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_resumen_libro_select ON public.resumen_libro FOR SELECT USING ((id_empresa = public.fc_empresa_actual()));


--
-- Name: sede pc_sede_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_sede_delete ON public.sede FOR DELETE USING ((public.fc_es_super_admin() OR (public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin())));


--
-- Name: sede pc_sede_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_sede_insert ON public.sede FOR INSERT WITH CHECK ((public.fc_es_super_admin() OR (public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin())));


--
-- Name: sede pc_sede_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_sede_select ON public.sede FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: sede pc_sede_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_sede_update ON public.sede FOR UPDATE USING ((public.fc_es_super_admin() OR (public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin()))) WITH CHECK ((public.fc_es_super_admin() OR (public.fc_es_empresa_actual(id_empresa) AND public.fc_es_admin())));


--
-- Name: solicitud pc_solicitud_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_solicitud_delete ON public.solicitud FOR DELETE USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: solicitud pc_solicitud_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_solicitud_insert ON public.solicitud FOR INSERT WITH CHECK (public.fc_es_empresa_actual(id_empresa));


--
-- Name: solicitud pc_solicitud_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_solicitud_select ON public.solicitud FOR SELECT USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: solicitud pc_solicitud_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_solicitud_update ON public.solicitud FOR UPDATE USING (public.fc_es_super_admin()) WITH CHECK (public.fc_es_super_admin());


--
-- Name: stock pc_stock_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_stock_all ON public.stock USING ((public.fc_es_super_admin() OR public.fc_es_empresa_actual(id_empresa)));


--
-- Name: usuario pc_usuario_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_usuario_insert ON public.usuario FOR INSERT WITH CHECK ((public.fc_es_super_admin() OR (public.fc_es_admin() AND (id_empresa = public.fc_empresa_actual()) AND ((rol)::text <> 'super_admin'::text))));


--
-- Name: usuario_mensaje_fav pc_usuario_mensaje_fav; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_usuario_mensaje_fav ON public.usuario_mensaje_fav USING ((public.fc_usuario_actual() = id_usuario));


--
-- Name: usuario pc_usuario_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_usuario_select ON public.usuario FOR SELECT USING (
CASE
    WHEN public.fc_es_super_admin() THEN true
    WHEN public.fc_es_admin() THEN (id_empresa = public.fc_empresa_actual())
    ELSE (id = public.fc_usuario_actual())
END);


--
-- Name: usuario pc_usuario_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pc_usuario_update ON public.usuario FOR UPDATE USING ((public.fc_es_super_admin() OR (public.fc_es_admin() AND (id_empresa = public.fc_empresa_actual())) OR (id = public.fc_usuario_actual()))) WITH CHECK ((public.fc_es_super_admin() OR (public.fc_es_admin() AND (id_empresa = public.fc_empresa_actual()) AND ((rol)::text <> 'super_admin'::text)) OR ((id = public.fc_usuario_actual()) AND (id_empresa = public.fc_empresa_actual()) AND ((rol)::text = (public.fc_rol_usuario(public.fc_usuario_actual()))::text))));


--
-- Name: pedido; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pedido ENABLE ROW LEVEL SECURITY;

--
-- Name: pedido_item; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pedido_item ENABLE ROW LEVEL SECURITY;

--
-- Name: pedido_item_especificacion; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pedido_item_especificacion ENABLE ROW LEVEL SECURITY;

--
-- Name: pedido_item_especificacion pedido_item_especificacion_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pedido_item_especificacion_all ON public.pedido_item_especificacion USING ((public.fc_usuario_actual() IS NOT NULL)) WITH CHECK ((public.fc_usuario_actual() IS NOT NULL));


--
-- Name: peticion; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.peticion ENABLE ROW LEVEL SECURITY;

--
-- Name: precio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.precio ENABLE ROW LEVEL SECURITY;

--
-- Name: precio_categoria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.precio_categoria ENABLE ROW LEVEL SECURITY;

--
-- Name: precio_empresa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.precio_empresa ENABLE ROW LEVEL SECURITY;

--
-- Name: propuesta; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propuesta ENABLE ROW LEVEL SECURITY;

--
-- Name: propuesta_libro_empresa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propuesta_libro_empresa ENABLE ROW LEVEL SECURITY;

--
-- Name: resumen_cliente; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resumen_cliente ENABLE ROW LEVEL SECURITY;

--
-- Name: resumen_libro; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resumen_libro ENABLE ROW LEVEL SECURITY;

--
-- Name: sede; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sede ENABLE ROW LEVEL SECURITY;

--
-- Name: solicitud; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.solicitud ENABLE ROW LEVEL SECURITY;

--
-- Name: stock; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;

--
-- Name: usuario; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

--
-- Name: usuario_mensaje_fav; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuario_mensaje_fav ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO app_role;


--
-- Name: FUNCTION fc_actualizar_estado_pedido(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_actualizar_estado_pedido() TO app_role;


--
-- Name: FUNCTION fc_actualizar_fecha_actualizacion(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_actualizar_fecha_actualizacion() TO app_role;


--
-- Name: FUNCTION fc_actualizar_resumen(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_actualizar_resumen() TO app_role;


--
-- Name: FUNCTION fc_actualizar_resumen_cliente(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_actualizar_resumen_cliente() TO app_role;


--
-- Name: FUNCTION fc_aplicar_peticion(p_id_peticion uuid, p_estado integer, p_observaciones character varying); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_aplicar_peticion(p_id_peticion uuid, p_estado integer, p_observaciones character varying) TO app_role;


--
-- Name: FUNCTION fc_auditoria(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_auditoria() TO app_role;


--
-- Name: FUNCTION fc_empresa_actual(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_empresa_actual() TO app_role;


--
-- Name: TABLE cliente; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.cliente TO app_role;


--
-- Name: TABLE componente; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.componente TO app_role;


--
-- Name: TABLE editorial; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.editorial TO app_role;


--
-- Name: TABLE especificacion; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.especificacion TO app_role;


--
-- Name: TABLE libro; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.libro TO app_role;


--
-- Name: TABLE libro_completo; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.libro_completo TO app_role;


--
-- Name: TABLE libro_componente; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.libro_componente TO app_role;


--
-- Name: TABLE libro_empresa; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.libro_empresa TO app_role;


--
-- Name: TABLE materia; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.materia TO app_role;


--
-- Name: TABLE nivel; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.nivel TO app_role;


--
-- Name: TABLE pedido; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.pedido TO app_role;


--
-- Name: TABLE pedido_item; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.pedido_item TO app_role;


--
-- Name: TABLE pedido_item_especificacion; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.pedido_item_especificacion TO app_role;


--
-- Name: TABLE resumen_libro; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.resumen_libro TO app_role;


--
-- Name: TABLE sede; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.sede TO app_role;


--
-- Name: TABLE stock; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.stock TO app_role;


--
-- Name: TABLE vw_componentes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_componentes TO app_role;


--
-- Name: TABLE vw_especificaciones; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_especificaciones TO app_role;


--
-- Name: TABLE vw_libro_busqueda; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_libro_busqueda TO app_role;


--
-- Name: TABLE vw_pedidos; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.vw_pedidos TO app_role;


--
-- Name: TABLE vw_pedidos_item; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_pedidos_item TO app_role;


--
-- Name: FUNCTION fc_buscar_pedido(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date, p_limite integer, p_offset integer, p_orden text[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_buscar_pedido(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date, p_limite integer, p_offset integer, p_orden text[]) TO app_role;


--
-- Name: TABLE resumen_cliente; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.resumen_cliente TO app_role;


--
-- Name: TABLE vw_cliente; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.vw_cliente TO app_role;


--
-- Name: FUNCTION fc_busqueda_cliente(p_busqueda character varying, p_limite integer, p_offset integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_busqueda_cliente(p_busqueda character varying, p_limite integer, p_offset integer) TO app_role;


--
-- Name: TABLE vw_cambio_estado; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_cambio_estado TO app_role;


--
-- Name: FUNCTION fc_cargar_contexto_usuario(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_cargar_contexto_usuario() TO app_role;


--
-- Name: FUNCTION fc_contar_pedidos(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_contar_pedidos(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date) TO app_role;


--
-- Name: FUNCTION fc_crear_resumen_cliente(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_crear_resumen_cliente() TO app_role;


--
-- Name: FUNCTION fc_crear_resumen_libro(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_crear_resumen_libro() TO app_role;


--
-- Name: FUNCTION fc_crear_stock(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_crear_stock() TO app_role;


--
-- Name: FUNCTION fc_es_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_es_admin() TO app_role;


--
-- Name: FUNCTION fc_es_empresa_actual(p_id_empresa uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_es_empresa_actual(p_id_empresa uuid) TO app_role;


--
-- Name: FUNCTION fc_es_super_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_es_super_admin() TO app_role;


--
-- Name: FUNCTION fc_extraer_cambios(old_row jsonb, new_row jsonb); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_extraer_cambios(old_row jsonb, new_row jsonb) TO app_role;


--
-- Name: FUNCTION fc_extraer_clave(fila jsonb, VARIADIC columnas text[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_extraer_clave(fila jsonb, VARIADIC columnas text[]) TO app_role;


--
-- Name: FUNCTION fc_filtrar_pedidos_item(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_filtrar_pedidos_item(p_busqueda character varying, p_estados integer[], p_especificaciones text[], p_entrega date, p_tomado date) TO app_role;


--
-- Name: FUNCTION fc_procesar_actualizacion_libro(p_id_libro_completo uuid, p_nombre character varying, p_materia character varying, p_editorial character varying, p_nivel character varying, p_componentes text[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_procesar_actualizacion_libro(p_id_libro_completo uuid, p_nombre character varying, p_materia character varying, p_editorial character varying, p_nivel character varying, p_componentes text[]) TO app_role;


--
-- Name: FUNCTION fc_prohibir_modificacion(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_prohibir_modificacion() TO app_role;


--
-- Name: FUNCTION fc_recalcular_resumen_cliente(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_recalcular_resumen_cliente() TO app_role;


--
-- Name: FUNCTION fc_recalcular_resumen_libro(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_recalcular_resumen_libro() TO app_role;


--
-- Name: FUNCTION fc_restar_resumen_cliente(p_aux public.pedido); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_restar_resumen_cliente(p_aux public.pedido) TO app_role;


--
-- Name: FUNCTION fc_restar_resumen_libro(p_aux public.pedido_item); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_restar_resumen_libro(p_aux public.pedido_item) TO app_role;


--
-- Name: FUNCTION fc_rol_usuario(p_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_rol_usuario(p_id uuid) TO app_role;


--
-- Name: FUNCTION fc_sumar_resumen_cliente(p_aux public.pedido); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_sumar_resumen_cliente(p_aux public.pedido) TO app_role;


--
-- Name: FUNCTION fc_sumar_resumen_libro(p_aux public.pedido_item); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_sumar_resumen_libro(p_aux public.pedido_item) TO app_role;


--
-- Name: FUNCTION fc_usuario_actual(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_usuario_actual() TO app_role;


--
-- Name: FUNCTION fc_verificar_peticiones_libro_relacionados(p_id_libro_completo uuid, p_id_usuario uuid, p_id_empresa uuid, p_campos jsonb, p_id_solicitud uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fc_verificar_peticiones_libro_relacionados(p_id_libro_completo uuid, p_id_usuario uuid, p_id_empresa uuid, p_campos jsonb, p_id_solicitud uuid) TO app_role;


--
-- Name: TABLE auditoria; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.auditoria TO app_role;


--
-- Name: SEQUENCE auditoria_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE public.auditoria_id_seq TO app_role;


--
-- Name: TABLE configuraciones; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.configuraciones TO app_role;


--
-- Name: TABLE dato_cobro; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.dato_cobro TO app_role;


--
-- Name: TABLE empresa; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.empresa TO app_role;


--
-- Name: TABLE mensaje; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.mensaje TO app_role;


--
-- Name: SEQUENCE pedido_item_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE public.pedido_item_id_seq TO app_role;


--
-- Name: TABLE peticion; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.peticion TO app_role;


--
-- Name: TABLE precio; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.precio TO app_role;


--
-- Name: TABLE precio_categoria; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.precio_categoria TO app_role;


--
-- Name: TABLE precio_empresa; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.precio_empresa TO app_role;


--
-- Name: TABLE propuesta; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.propuesta TO app_role;


--
-- Name: TABLE propuesta_libro_empresa; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.propuesta_libro_empresa TO app_role;


--
-- Name: TABLE solicitud; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.solicitud TO app_role;


--
-- Name: TABLE usuario; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.usuario TO app_role;


--
-- Name: TABLE usuario_mensaje_fav; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.usuario_mensaje_fav TO app_role;


--
-- Name: TABLE vw_cambio_estado_pedido; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_cambio_estado_pedido TO app_role;


--
-- Name: TABLE vw_cambio_sede; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_cambio_sede TO app_role;


--
-- Name: TABLE vw_empresa_completa; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_empresa_completa TO app_role;


--
-- Name: TABLE vw_libro_completo; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_libro_completo TO app_role;


--
-- Name: TABLE vw_libro_nombre; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_libro_nombre TO app_role;


--
-- Name: TABLE vw_pedido_libro; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_pedido_libro TO app_role;


--
-- Name: TABLE vw_propuesta; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.vw_propuesta TO app_role;


--
-- PostgreSQL database dump complete
--


