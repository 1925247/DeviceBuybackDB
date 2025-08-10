--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

--
-- Name: question_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.question_type AS ENUM (
    'single_choice',
    'multiple_choice',
    'text',
    'number',
    'boolean',
    'text_input'
);


ALTER TYPE public.question_type OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: admin_configurations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_configurations (
    id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value jsonb NOT NULL,
    config_type character varying(50) DEFAULT 'general'::character varying,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_configurations OWNER TO neondb_owner;

--
-- Name: admin_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_configurations_id_seq OWNER TO neondb_owner;

--
-- Name: admin_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_configurations_id_seq OWNED BY public.admin_configurations.id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO neondb_owner;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO neondb_owner;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: answer_choices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.answer_choices (
    id integer NOT NULL,
    question_id integer NOT NULL,
    text text NOT NULL,
    value text NOT NULL,
    impact numeric(10,2) DEFAULT 0,
    is_default boolean DEFAULT false,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    answer_text text NOT NULL,
    icon text,
    weightage real DEFAULT 0,
    repair_cost real DEFAULT 0,
    follow_up_action jsonb,
    severity character varying(50) DEFAULT 'none'::character varying,
    icon_color character varying(20) DEFAULT 'gray'::character varying,
    device_specific boolean DEFAULT false,
    percentage_impact numeric(5,2) DEFAULT 0,
    sort_order integer DEFAULT 0,
    description text,
    model_specific_rates jsonb,
    brand_specific_rates jsonb,
    is_reusable boolean DEFAULT true,
    metadata jsonb
);


ALTER TABLE public.answer_choices OWNER TO neondb_owner;

--
-- Name: answer_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.answer_choices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.answer_choices_id_seq OWNER TO neondb_owner;

--
-- Name: answer_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.answer_choices_id_seq OWNED BY public.answer_choices.id;


--
-- Name: answer_model_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.answer_model_mappings (
    id integer NOT NULL,
    answer_id integer NOT NULL,
    model_id integer NOT NULL,
    weightage real,
    repair_cost real,
    is_active boolean DEFAULT true,
    answer_text text,
    description text,
    severity text,
    custom_settings jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deduction_rate numeric(5,2) DEFAULT 0.00
);


ALTER TABLE public.answer_model_mappings OWNER TO neondb_owner;

--
-- Name: answer_model_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.answer_model_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.answer_model_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: answer_model_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.answer_model_mappings_id_seq OWNED BY public.answer_model_mappings.id;


--
-- Name: brand_device_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.brand_device_types (
    id integer NOT NULL,
    brand_id integer NOT NULL,
    device_type_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_device_types OWNER TO neondb_owner;

--
-- Name: brand_device_types_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.brand_device_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brand_device_types_id_seq OWNER TO neondb_owner;

--
-- Name: brand_device_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.brand_device_types_id_seq OWNED BY public.brand_device_types.id;


--
-- Name: brand_group_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.brand_group_mappings (
    id integer NOT NULL,
    group_id integer NOT NULL,
    brand_id integer NOT NULL,
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    custom_settings jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.brand_group_mappings OWNER TO neondb_owner;

--
-- Name: brand_group_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.brand_group_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brand_group_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: brand_group_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.brand_group_mappings_id_seq OWNED BY public.brand_group_mappings.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    logo_type text DEFAULT 'url'::text,
    description text,
    website text,
    featured boolean DEFAULT false,
    priority integer DEFAULT 0
);


ALTER TABLE public.brands OWNER TO neondb_owner;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_id_seq OWNER TO neondb_owner;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: buyback_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.buyback_requests (
    id integer NOT NULL,
    user_id integer,
    device_type character varying(100),
    manufacturer character varying(100),
    model character varying(100),
    condition character varying(100),
    offered_price numeric(10,2),
    status character varying(50) DEFAULT 'pending'::character varying,
    customer_name character varying(255),
    customer_email character varying(255),
    customer_phone character varying(50),
    pickup_address text,
    pickup_date date,
    pickup_time character varying(50),
    device_model_id integer,
    notes text,
    order_id character varying(100),
    condition_answers text,
    pin_code character varying(20),
    final_price numeric(10,2),
    lead_source character varying(100),
    lead_medium character varying(100),
    lead_campaign character varying(255),
    utm_source character varying(100),
    utm_medium character varying(100),
    utm_campaign character varying(255),
    utm_term character varying(255),
    utm_content character varying(255),
    referrer_url text,
    landing_page text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    device_age_months integer DEFAULT 0,
    market_demand character varying(50) DEFAULT 'normal_demand'::character varying,
    regional_adjustment numeric(4,2) DEFAULT 1.0,
    pickup_estimated_days character varying(20) DEFAULT '3-5 days'::character varying,
    gst_amount numeric(10,2) DEFAULT 0,
    agent_id integer
);


ALTER TABLE public.buyback_requests OWNER TO neondb_owner;

--
-- Name: buyback_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.buyback_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buyback_requests_id_seq OWNER TO neondb_owner;

--
-- Name: buyback_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.buyback_requests_id_seq OWNED BY public.buyback_requests.id;


--
-- Name: checkouts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.checkouts (
    id integer NOT NULL,
    user_id integer,
    email text NOT NULL,
    shipping_address_id integer,
    billing_address_id integer,
    shipping_method text,
    subtotal numeric(10,2) NOT NULL,
    shipping_cost numeric(10,2),
    tax_amount numeric(10,2),
    discount_amount numeric(10,2),
    total numeric(10,2) NOT NULL,
    discount_code text,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.checkouts OWNER TO neondb_owner;

--
-- Name: checkouts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.checkouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkouts_id_seq OWNER TO neondb_owner;

--
-- Name: checkouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.checkouts_id_seq OWNED BY public.checkouts.id;


--
-- Name: condition_answers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.condition_answers (
    id integer NOT NULL,
    question_id integer NOT NULL,
    answer text NOT NULL,
    impact numeric(5,2) NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deduction_type text DEFAULT 'percentage'::text NOT NULL,
    fixed_amount numeric(10,2),
    applicable_brands jsonb,
    applicable_models jsonb,
    description text
);


ALTER TABLE public.condition_answers OWNER TO neondb_owner;

--
-- Name: condition_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.condition_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.condition_answers_id_seq OWNER TO neondb_owner;

--
-- Name: condition_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.condition_answers_id_seq OWNED BY public.condition_answers.id;


--
-- Name: condition_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.condition_questions (
    id integer NOT NULL,
    device_type_id integer NOT NULL,
    question text NOT NULL,
    "order" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    brand_id integer,
    question_type text DEFAULT 'multiple_choice'::text NOT NULL,
    required boolean DEFAULT true NOT NULL,
    help_text text
);


ALTER TABLE public.condition_questions OWNER TO neondb_owner;

--
-- Name: condition_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.condition_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.condition_questions_id_seq OWNER TO neondb_owner;

--
-- Name: condition_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.condition_questions_id_seq OWNED BY public.condition_questions.id;


--
-- Name: device_models; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.device_models (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    image text,
    brand_id integer NOT NULL,
    device_type_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    variants json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    base_price real DEFAULT 0,
    specifications jsonb,
    release_year integer,
    year integer DEFAULT 2024,
    description text,
    priority integer DEFAULT 0
);


ALTER TABLE public.device_models OWNER TO neondb_owner;

--
-- Name: device_question_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.device_question_mappings (
    id integer NOT NULL,
    model_id integer NOT NULL,
    question_id integer NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.device_question_mappings OWNER TO neondb_owner;

--
-- Name: device_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.device_types (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    description text,
    icon_type text DEFAULT 'lucide'::text,
    custom_icon text,
    icon_color text DEFAULT '#3B82F6'::text,
    background_color text DEFAULT '#EFF6FF'::text,
    priority integer DEFAULT 0
);


ALTER TABLE public.device_types OWNER TO neondb_owner;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    question_text text NOT NULL,
    question_type text DEFAULT 'single_choice'::text NOT NULL,
    group_id integer,
    "order" integer DEFAULT 0,
    active boolean DEFAULT true,
    tooltip text,
    required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    device_model_ids text[],
    brand_ids text[],
    applicable_models text,
    question_group_id integer,
    help_text text,
    sort_order integer DEFAULT 0,
    is_reusable boolean DEFAULT true,
    exclude_model_ids jsonb,
    metadata jsonb
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: device_model_question_summary; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.device_model_question_summary AS
 SELECT dm.id AS model_id,
    dm.name AS model_name,
    b.name AS brand_name,
    dt.name AS device_type_name,
    count(dqm.question_id) AS question_count,
    array_agg(q.question_text ORDER BY q."order") AS questions
   FROM ((((public.device_models dm
     LEFT JOIN public.brands b ON ((dm.brand_id = b.id)))
     LEFT JOIN public.device_types dt ON ((dm.device_type_id = dt.id)))
     LEFT JOIN public.device_question_mappings dqm ON (((dm.id = dqm.model_id) AND (dqm.active = true))))
     LEFT JOIN public.questions q ON (((dqm.question_id = q.id) AND (q.active = true))))
  WHERE (dm.active = true)
  GROUP BY dm.id, dm.name, b.name, dt.name
  ORDER BY dm.name;


ALTER VIEW public.device_model_question_summary OWNER TO neondb_owner;

--
-- Name: device_model_variants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.device_model_variants (
    id integer NOT NULL,
    model_id integer NOT NULL,
    variant_name text NOT NULL,
    storage text,
    color text,
    ram text,
    processor text,
    display_size text,
    base_price real NOT NULL,
    current_price real NOT NULL,
    market_value real,
    depreciation_rate real DEFAULT 0,
    availability boolean DEFAULT true,
    sku text,
    specifications jsonb,
    images jsonb,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.device_model_variants OWNER TO neondb_owner;

--
-- Name: device_model_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.device_model_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_model_variants_id_seq OWNER TO neondb_owner;

--
-- Name: device_model_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.device_model_variants_id_seq OWNED BY public.device_model_variants.id;


--
-- Name: device_models_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.device_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_models_id_seq OWNER TO neondb_owner;

--
-- Name: device_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.device_models_id_seq OWNED BY public.device_models.id;


--
-- Name: device_question_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.device_question_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_question_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: device_question_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.device_question_mappings_id_seq OWNED BY public.device_question_mappings.id;


--
-- Name: device_types_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.device_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_types_id_seq OWNER TO neondb_owner;

--
-- Name: device_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.device_types_id_seq OWNED BY public.device_types.id;


--
-- Name: diagnostic_answers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.diagnostic_answers (
    id integer NOT NULL,
    question_id integer NOT NULL,
    answer text NOT NULL,
    is_pass boolean NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diagnostic_answers OWNER TO neondb_owner;

--
-- Name: diagnostic_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.diagnostic_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diagnostic_answers_id_seq OWNER TO neondb_owner;

--
-- Name: diagnostic_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.diagnostic_answers_id_seq OWNED BY public.diagnostic_answers.id;


--
-- Name: diagnostic_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.diagnostic_questions (
    id integer NOT NULL,
    device_type_id integer NOT NULL,
    question text NOT NULL,
    "order" integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.diagnostic_questions OWNER TO neondb_owner;

--
-- Name: diagnostic_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.diagnostic_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diagnostic_questions_id_seq OWNER TO neondb_owner;

--
-- Name: diagnostic_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.diagnostic_questions_id_seq OWNED BY public.diagnostic_questions.id;


--
-- Name: discounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.discounts (
    id integer NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text,
    discount_type text NOT NULL,
    value numeric(10,2),
    status text DEFAULT 'active'::text NOT NULL,
    min_order_amount numeric(10,2),
    max_discount_amount numeric(10,2),
    usage_limit integer,
    usage_count integer DEFAULT 0 NOT NULL,
    starts_at timestamp without time zone,
    ends_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.discounts OWNER TO neondb_owner;

--
-- Name: discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discounts_id_seq OWNER TO neondb_owner;

--
-- Name: discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.discounts_id_seq OWNED BY public.discounts.id;


--
-- Name: error_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.error_reports (
    id integer NOT NULL,
    error_id character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(100) DEFAULT 'general'::character varying,
    status_code integer,
    stack text,
    component_stack text,
    user_agent text,
    url text,
    user_id character varying(100),
    context jsonb,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resolved boolean DEFAULT false,
    resolution_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.error_reports OWNER TO neondb_owner;

--
-- Name: error_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.error_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.error_reports_id_seq OWNER TO neondb_owner;

--
-- Name: error_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.error_reports_id_seq OWNED BY public.error_reports.id;


--
-- Name: feature_toggles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feature_toggles (
    id integer NOT NULL,
    feature_key text NOT NULL,
    display_name text NOT NULL,
    description text NOT NULL,
    is_enabled boolean DEFAULT false,
    category text NOT NULL,
    scope text NOT NULL,
    scope_id integer,
    required_permission text,
    last_modified_by integer,
    last_modified_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.feature_toggles OWNER TO neondb_owner;

--
-- Name: feature_toggles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.feature_toggles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feature_toggles_id_seq OWNER TO neondb_owner;

--
-- Name: feature_toggles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.feature_toggles_id_seq OWNED BY public.feature_toggles.id;


--
-- Name: group_model_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.group_model_mappings (
    id integer NOT NULL,
    group_id integer NOT NULL,
    model_id integer NOT NULL,
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    group_name text,
    group_statement text,
    custom_settings jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_model_mappings OWNER TO neondb_owner;

--
-- Name: group_model_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.group_model_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_model_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: group_model_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.group_model_mappings_id_seq OWNED BY public.group_model_mappings.id;


--
-- Name: invoice_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoice_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false NOT NULL,
    html_template text NOT NULL,
    css_styles text,
    configuration jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    partner_id integer
);


ALTER TABLE public.invoice_templates OWNER TO neondb_owner;

--
-- Name: invoice_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.invoice_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_templates_id_seq OWNER TO neondb_owner;

--
-- Name: invoice_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.invoice_templates_id_seq OWNED BY public.invoice_templates.id;


--
-- Name: lead_completion_status; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lead_completion_status (
    id integer NOT NULL,
    lead_id integer NOT NULL,
    revaluation_completed boolean DEFAULT false,
    photos_uploaded boolean DEFAULT false,
    kyc_completed boolean DEFAULT false,
    payment_confirmed boolean DEFAULT false,
    device_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    agent_id character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lead_completion_status OWNER TO neondb_owner;

--
-- Name: lead_completion_status_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.lead_completion_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lead_completion_status_id_seq OWNER TO neondb_owner;

--
-- Name: lead_completion_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lead_completion_status_id_seq OWNED BY public.lead_completion_status.id;


--
-- Name: lead_kyc; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lead_kyc (
    id integer NOT NULL,
    lead_id integer NOT NULL,
    customer_name character varying(255) NOT NULL,
    id_type character varying(50) NOT NULL,
    id_number character varying(100) NOT NULL,
    id_photo_front text,
    id_photo_back text,
    customer_selfie text NOT NULL,
    verification_status character varying(20) DEFAULT 'pending'::character varying,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    agent_id character varying(50) NOT NULL,
    imei_number character varying(15),
    phone_photo_url text
);


ALTER TABLE public.lead_kyc OWNER TO neondb_owner;

--
-- Name: lead_kyc_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.lead_kyc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lead_kyc_id_seq OWNER TO neondb_owner;

--
-- Name: lead_kyc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lead_kyc_id_seq OWNED BY public.lead_kyc.id;


--
-- Name: lead_payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lead_payments (
    id integer NOT NULL,
    lead_id integer NOT NULL,
    payment_method character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    account_details text,
    transfer_proof text,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    agent_id character varying(50) NOT NULL
);


ALTER TABLE public.lead_payments OWNER TO neondb_owner;

--
-- Name: lead_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.lead_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lead_payments_id_seq OWNER TO neondb_owner;

--
-- Name: lead_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lead_payments_id_seq OWNED BY public.lead_payments.id;


--
-- Name: lead_photos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lead_photos (
    id integer NOT NULL,
    lead_id integer NOT NULL,
    photo_type character varying(50) NOT NULL,
    photo_url text NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    agent_id character varying(50) NOT NULL
);


ALTER TABLE public.lead_photos OWNER TO neondb_owner;

--
-- Name: lead_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.lead_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lead_photos_id_seq OWNER TO neondb_owner;

--
-- Name: lead_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lead_photos_id_seq OWNED BY public.lead_photos.id;


--
-- Name: model_pricing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_pricing (
    id integer NOT NULL,
    model_id integer,
    base_price numeric(10,2) NOT NULL,
    deduction_rate numeric(4,2) DEFAULT 0.0,
    pricing_tier_id integer,
    market_price numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.model_pricing OWNER TO neondb_owner;

--
-- Name: model_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.model_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.model_pricing_id_seq OWNER TO neondb_owner;

--
-- Name: model_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.model_pricing_id_seq OWNED BY public.model_pricing.id;


--
-- Name: model_question_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_question_mappings (
    id integer NOT NULL,
    model_id integer,
    question_id integer,
    question_group_id integer,
    required boolean DEFAULT true,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.model_question_mappings OWNER TO neondb_owner;

--
-- Name: model_question_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.model_question_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.model_question_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: model_question_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.model_question_mappings_id_seq OWNED BY public.model_question_mappings.id;


--
-- Name: model_question_modes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_question_modes (
    id integer NOT NULL,
    model_id integer NOT NULL,
    question_mode character varying(20) DEFAULT 'standard'::character varying,
    enable_advanced boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT model_question_modes_question_mode_check CHECK (((question_mode)::text = ANY ((ARRAY['standard'::character varying, 'advanced'::character varying, 'both'::character varying])::text[])))
);


ALTER TABLE public.model_question_modes OWNER TO neondb_owner;

--
-- Name: model_question_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.model_question_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.model_question_modes_id_seq OWNER TO neondb_owner;

--
-- Name: model_question_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.model_question_modes_id_seq OWNED BY public.model_question_modes.id;


--
-- Name: partner_staff; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.partner_staff (
    id integer NOT NULL,
    user_id integer NOT NULL,
    partner_id integer NOT NULL,
    role text DEFAULT 'partner_staff'::text NOT NULL,
    assigned_regions jsonb,
    assigned_pincodes jsonb,
    custom_permissions jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.partner_staff OWNER TO neondb_owner;

--
-- Name: partner_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.partner_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partner_staff_id_seq OWNER TO neondb_owner;

--
-- Name: partner_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.partner_staff_id_seq OWNED BY public.partner_staff.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    logo text,
    status text DEFAULT 'active'::text NOT NULL,
    specialization text,
    regions jsonb,
    device_types jsonb,
    pin_codes jsonb,
    commission_rate numeric(5,2) DEFAULT 10 NOT NULL,
    tenant_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.partners OWNER TO neondb_owner;

--
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partners_id_seq OWNER TO neondb_owner;

--
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    checkout_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    payment_method text NOT NULL,
    payment_method_details json,
    payment_intent_id text,
    charge_id text,
    status text NOT NULL,
    error_message text,
    refunded boolean DEFAULT false NOT NULL,
    refunded_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO neondb_owner;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO neondb_owner;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: pricing_tiers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pricing_tiers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    base_multiplier numeric(4,2) DEFAULT 1.0,
    deduction_rate numeric(4,2) DEFAULT 0.0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pricing_tiers OWNER TO neondb_owner;

--
-- Name: pricing_tiers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pricing_tiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_tiers_id_seq OWNER TO neondb_owner;

--
-- Name: pricing_tiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pricing_tiers_id_seq OWNED BY public.pricing_tiers.id;


--
-- Name: product_question_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_question_mappings (
    id integer NOT NULL,
    product_id integer NOT NULL,
    question_id integer NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_question_mappings OWNER TO neondb_owner;

--
-- Name: product_question_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.product_question_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_question_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: product_question_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.product_question_mappings_id_seq OWNED BY public.product_question_mappings.id;


--
-- Name: question_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.question_groups (
    id integer NOT NULL,
    name text NOT NULL,
    statement text NOT NULL,
    device_type_id integer,
    icon text,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category character varying(100) DEFAULT 'general'::character varying,
    description text,
    sort_order integer DEFAULT 0,
    color text DEFAULT '#3B82F6'::text,
    is_reusable boolean DEFAULT true,
    device_types jsonb,
    question_level character varying(20) DEFAULT 'standard'::character varying,
    CONSTRAINT question_groups_question_level_check CHECK (((question_level)::text = ANY ((ARRAY['standard'::character varying, 'advanced'::character varying, 'both'::character varying])::text[])))
);


ALTER TABLE public.question_groups OWNER TO neondb_owner;

--
-- Name: question_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.question_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_groups_id_seq OWNER TO neondb_owner;

--
-- Name: question_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.question_groups_id_seq OWNED BY public.question_groups.id;


--
-- Name: question_model_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.question_model_mappings (
    id integer NOT NULL,
    question_group_id integer,
    model_id integer,
    auto_deduction_rate numeric(4,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.question_model_mappings OWNER TO neondb_owner;

--
-- Name: question_model_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.question_model_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_model_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: question_model_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.question_model_mappings_id_seq OWNED BY public.question_model_mappings.id;


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO neondb_owner;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: regions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.regions OWNER TO neondb_owner;

--
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regions_id_seq OWNER TO neondb_owner;

--
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.regions_id_seq OWNED BY public.regions.id;


--
-- Name: route_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.route_rules (
    id integer NOT NULL,
    path text NOT NULL,
    pin_code text,
    partner_id integer,
    region_id integer,
    priority integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.route_rules OWNER TO neondb_owner;

--
-- Name: route_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.route_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_rules_id_seq OWNER TO neondb_owner;

--
-- Name: route_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.route_rules_id_seq OWNED BY public.route_rules.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO neondb_owner;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: store_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.store_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    thumbnail text,
    is_default boolean DEFAULT false NOT NULL,
    configuration jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.store_templates OWNER TO neondb_owner;

--
-- Name: store_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.store_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_templates_id_seq OWNER TO neondb_owner;

--
-- Name: store_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.store_templates_id_seq OWNED BY public.store_templates.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tags OWNER TO neondb_owner;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO neondb_owner;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.time_slots (
    id integer NOT NULL,
    date date NOT NULL,
    time_slot time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    max_bookings integer DEFAULT 4,
    current_bookings integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.time_slots OWNER TO neondb_owner;

--
-- Name: time_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.time_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_slots_id_seq OWNER TO neondb_owner;

--
-- Name: time_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.time_slots_id_seq OWNED BY public.time_slots.id;


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_feedback (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    message text,
    context jsonb,
    user_id character varying(100),
    url text,
    user_agent text,
    rating integer,
    category character varying(100),
    resolved boolean DEFAULT false,
    admin_response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT user_feedback_type_check CHECK (((type)::text = ANY ((ARRAY['positive'::character varying, 'negative'::character varying, 'suggestion'::character varying, 'bug'::character varying])::text[])))
);


ALTER TABLE public.user_feedback OWNER TO neondb_owner;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_feedback_id_seq OWNER TO neondb_owner;

--
-- Name: user_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_feedback_id_seq OWNED BY public.user_feedback.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    partner_id integer,
    region_id integer
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: valuations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.valuations (
    id integer NOT NULL,
    device_model_id integer NOT NULL,
    base_price numeric(10,2) NOT NULL,
    condition_excellent numeric(5,2) NOT NULL,
    condition_good numeric(5,2) NOT NULL,
    condition_fair numeric(5,2) NOT NULL,
    condition_poor numeric(5,2) NOT NULL,
    variant_multipliers json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.valuations OWNER TO neondb_owner;

--
-- Name: valuations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.valuations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.valuations_id_seq OWNER TO neondb_owner;

--
-- Name: valuations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.valuations_id_seq OWNED BY public.valuations.id;


--
-- Name: variant_pricing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.variant_pricing (
    id integer NOT NULL,
    variant_id integer,
    base_price numeric(10,2),
    deduction_rate numeric(4,2),
    pricing_tier_id integer,
    override_model_pricing boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.variant_pricing OWNER TO neondb_owner;

--
-- Name: variant_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.variant_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.variant_pricing_id_seq OWNER TO neondb_owner;

--
-- Name: variant_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.variant_pricing_id_seq OWNED BY public.variant_pricing.id;


--
-- Name: variant_question_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.variant_question_mappings (
    id integer NOT NULL,
    variant_id integer NOT NULL,
    group_id integer NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.variant_question_mappings OWNER TO neondb_owner;

--
-- Name: variant_question_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.variant_question_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.variant_question_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: variant_question_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.variant_question_mappings_id_seq OWNED BY public.variant_question_mappings.id;


--
-- Name: working_hours; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.working_hours (
    id integer NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    break_start_time time without time zone,
    break_end_time time without time zone,
    max_appointments_per_hour integer DEFAULT 4,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT working_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


ALTER TABLE public.working_hours OWNER TO neondb_owner;

--
-- Name: working_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.working_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.working_hours_id_seq OWNER TO neondb_owner;

--
-- Name: working_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.working_hours_id_seq OWNED BY public.working_hours.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: admin_configurations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_configurations ALTER COLUMN id SET DEFAULT nextval('public.admin_configurations_id_seq'::regclass);


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: answer_choices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_choices ALTER COLUMN id SET DEFAULT nextval('public.answer_choices_id_seq'::regclass);


--
-- Name: answer_model_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_model_mappings ALTER COLUMN id SET DEFAULT nextval('public.answer_model_mappings_id_seq'::regclass);


--
-- Name: brand_device_types id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_device_types ALTER COLUMN id SET DEFAULT nextval('public.brand_device_types_id_seq'::regclass);


--
-- Name: brand_group_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_group_mappings ALTER COLUMN id SET DEFAULT nextval('public.brand_group_mappings_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: buyback_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buyback_requests ALTER COLUMN id SET DEFAULT nextval('public.buyback_requests_id_seq'::regclass);


--
-- Name: checkouts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checkouts ALTER COLUMN id SET DEFAULT nextval('public.checkouts_id_seq'::regclass);


--
-- Name: condition_answers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_answers ALTER COLUMN id SET DEFAULT nextval('public.condition_answers_id_seq'::regclass);


--
-- Name: condition_questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_questions ALTER COLUMN id SET DEFAULT nextval('public.condition_questions_id_seq'::regclass);


--
-- Name: device_model_variants id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_model_variants ALTER COLUMN id SET DEFAULT nextval('public.device_model_variants_id_seq'::regclass);


--
-- Name: device_models id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_models ALTER COLUMN id SET DEFAULT nextval('public.device_models_id_seq'::regclass);


--
-- Name: device_question_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_question_mappings ALTER COLUMN id SET DEFAULT nextval('public.device_question_mappings_id_seq'::regclass);


--
-- Name: device_types id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_types ALTER COLUMN id SET DEFAULT nextval('public.device_types_id_seq'::regclass);


--
-- Name: diagnostic_answers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.diagnostic_answers ALTER COLUMN id SET DEFAULT nextval('public.diagnostic_answers_id_seq'::regclass);


--
-- Name: diagnostic_questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.diagnostic_questions ALTER COLUMN id SET DEFAULT nextval('public.diagnostic_questions_id_seq'::regclass);


--
-- Name: discounts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discounts ALTER COLUMN id SET DEFAULT nextval('public.discounts_id_seq'::regclass);


--
-- Name: error_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.error_reports ALTER COLUMN id SET DEFAULT nextval('public.error_reports_id_seq'::regclass);


--
-- Name: feature_toggles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feature_toggles ALTER COLUMN id SET DEFAULT nextval('public.feature_toggles_id_seq'::regclass);


--
-- Name: group_model_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_model_mappings ALTER COLUMN id SET DEFAULT nextval('public.group_model_mappings_id_seq'::regclass);


--
-- Name: invoice_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_templates ALTER COLUMN id SET DEFAULT nextval('public.invoice_templates_id_seq'::regclass);


--
-- Name: lead_completion_status id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_completion_status ALTER COLUMN id SET DEFAULT nextval('public.lead_completion_status_id_seq'::regclass);


--
-- Name: lead_kyc id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_kyc ALTER COLUMN id SET DEFAULT nextval('public.lead_kyc_id_seq'::regclass);


--
-- Name: lead_payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_payments ALTER COLUMN id SET DEFAULT nextval('public.lead_payments_id_seq'::regclass);


--
-- Name: lead_photos id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_photos ALTER COLUMN id SET DEFAULT nextval('public.lead_photos_id_seq'::regclass);


--
-- Name: model_pricing id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_pricing ALTER COLUMN id SET DEFAULT nextval('public.model_pricing_id_seq'::regclass);


--
-- Name: model_question_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_mappings ALTER COLUMN id SET DEFAULT nextval('public.model_question_mappings_id_seq'::regclass);


--
-- Name: model_question_modes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_modes ALTER COLUMN id SET DEFAULT nextval('public.model_question_modes_id_seq'::regclass);


--
-- Name: partner_staff id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partner_staff ALTER COLUMN id SET DEFAULT nextval('public.partner_staff_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: pricing_tiers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_tiers ALTER COLUMN id SET DEFAULT nextval('public.pricing_tiers_id_seq'::regclass);


--
-- Name: product_question_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_question_mappings ALTER COLUMN id SET DEFAULT nextval('public.product_question_mappings_id_seq'::regclass);


--
-- Name: question_groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_groups ALTER COLUMN id SET DEFAULT nextval('public.question_groups_id_seq'::regclass);


--
-- Name: question_model_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_model_mappings ALTER COLUMN id SET DEFAULT nextval('public.question_model_mappings_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: regions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regions ALTER COLUMN id SET DEFAULT nextval('public.regions_id_seq'::regclass);


--
-- Name: route_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.route_rules ALTER COLUMN id SET DEFAULT nextval('public.route_rules_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: store_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_templates ALTER COLUMN id SET DEFAULT nextval('public.store_templates_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: time_slots id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.time_slots ALTER COLUMN id SET DEFAULT nextval('public.time_slots_id_seq'::regclass);


--
-- Name: user_feedback id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_feedback ALTER COLUMN id SET DEFAULT nextval('public.user_feedback_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: valuations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.valuations ALTER COLUMN id SET DEFAULT nextval('public.valuations_id_seq'::regclass);


--
-- Name: variant_pricing id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_pricing ALTER COLUMN id SET DEFAULT nextval('public.variant_pricing_id_seq'::regclass);


--
-- Name: variant_question_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_question_mappings ALTER COLUMN id SET DEFAULT nextval('public.variant_question_mappings_id_seq'::regclass);


--
-- Name: working_hours id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.working_hours ALTER COLUMN id SET DEFAULT nextval('public.working_hours_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: neondb_owner
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: admin_configurations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_configurations (id, config_key, config_value, config_type, description, is_active, created_at, updated_at) FROM stdin;
1	platform_name	"Device Buyback Platform"	general	Platform display name	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
2	max_upload_size	5242880	general	Maximum file upload size in bytes	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
3	currency_symbol	"₹"	pricing	Default currency symbol	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
4	minimum_device_price	500	pricing	Minimum buyback price for any device	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
5	default_deduction_rate	10.0	pricing	Default deduction rate percentage	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
6	theme_primary_color	"#3B82F6"	ui	Primary theme color	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
7	theme_secondary_color	"#1F2937"	ui	Secondary theme color	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
8	supported_languages	["en", "hi"]	localization	Supported platform languages	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
9	default_language	"en"	localization	Default platform language	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
10	api_rate_limit	1000	api	API requests per hour limit	t	2025-06-13 18:51:28.434154	2025-06-13 18:51:28.434154
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admins (id, username, email, password_hash, role, active, created_at, updated_at) FROM stdin;
1	admin	admin@casholddevice.com	$2a$10$N9qo8uLOickgx2ZMRZoMye3/8VQ8S2VdHNDEhNkPTAO9TMcHLVmPG	super_admin	t	2025-08-10 05:45:58.48935	2025-08-10 05:45:58.48935
\.


--
-- Data for Name: answer_choices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.answer_choices (id, question_id, text, value, impact, is_default, "order", created_at, updated_at, answer_text, icon, weightage, repair_cost, follow_up_action, severity, icon_color, device_specific, percentage_impact, sort_order, description, model_specific_rates, brand_specific_rates, is_reusable, metadata) FROM stdin;
24	5	Yes	0	0.00	f	0	2025-05-16 14:23:20.47	2025-05-16 14:23:20.47	Yes	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
25	5	No	1	0.00	f	1	2025-05-16 14:23:20.537	2025-05-16 14:23:20.537	No	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
29	9	Yes	0	0.00	f	0	2025-05-16 14:29:18.062	2025-05-16 14:29:18.062	Yes	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
30	9	No	1	0.00	f	1	2025-05-16 14:29:18.169	2025-05-16 14:29:18.169	No	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
31	12	Yes	0	0.00	f	0	2025-05-16 14:30:56.567	2025-05-16 14:30:56.567	Yes	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
32	12	No	1	0.00	f	1	2025-05-16 14:30:56.65	2025-05-16 14:30:56.65	No	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
45	13	Screen cracked/ glass broken	0	0.00	f	0	2025-05-16 14:39:07.234	2025-05-16 14:39:07.234	Screen cracked/ glass broken	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
46	13	Chipped/cracked outside display area	1	0.00	f	1	2025-05-16 14:39:07.313	2025-05-16 14:39:07.313	Chipped/cracked outside display area	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
47	13	More than 2 scratches on screen	2	0.00	f	2	2025-05-16 14:39:07.371	2025-05-16 14:39:07.371	More than 2 scratches on screen	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
48	13	1-2 scratches on screen	3	0.00	f	3	2025-05-16 14:39:07.432	2025-05-16 14:39:07.432	1-2 scratches on screen	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
52	14	Spots on Screen 	0	0.00	f	0	2025-05-16 14:41:52.69	2025-05-16 14:41:52.69	Spots on Screen 	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
53	14	Display faded along edges	1	0.00	f	1	2025-05-16 14:41:52.754	2025-05-16 14:41:52.754	Display faded along edges	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
54	14	Discoloration	2	0.00	f	2	2025-05-16 14:41:52.836	2025-05-16 14:41:52.836	Discoloration	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
80	16	Flawless No Scratches, No dents	0	0.00	f	0	2025-05-16 14:56:49.213	2025-05-16 14:56:49.213	Flawless No Scratches, No dents	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
81	16	Good 1-3 minor scratches , No Dents no Cracks	1	0.00	f	1	2025-05-16 14:56:49.289	2025-05-16 14:56:49.289	Good 1-3 minor scratches , No Dents no Cracks	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
82	16	Major scratches/2-3 minor dents	2	0.00	f	2	2025-05-16 14:56:49.349	2025-05-16 14:56:49.349	Major scratches/2-3 minor dents	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
83	16	Average Heavy Scratches & Dents,	3	0.00	f	3	2025-05-16 14:56:49.41	2025-05-16 14:56:49.41	Average Heavy Scratches & Dents,	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
84	16	Below Average (Cracked, Spot,Patches,Lines)	4	0.00	f	4	2025-05-16 14:56:49.47	2025-05-16 14:56:49.47	Below Average (Cracked, Spot,Patches,Lines)	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
85	16	Body Bent	5	0.00	f	5	2025-05-16 14:56:49.529	2025-05-16 14:56:49.529	Body Bent	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
92	18	Original Charger of Device	0	0.00	f	0	2025-05-16 15:02:17.737	2025-05-16 15:02:17.737	Original Charger of Device	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
93	18	Original Box with same IMEI	1	0.00	f	1	2025-05-16 15:02:17.797	2025-05-16 15:02:17.797	Original Box with same IMEI	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
94	18	GST Valid Bill with the same IMEI	2	0.00	f	2	2025-05-16 15:02:17.864	2025-05-16 15:02:17.864	GST Valid Bill with the same IMEI	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
95	15	Front Camera not working	0	0.00	f	0	2025-05-16 15:03:01.594	2025-05-16 15:03:01.594	Front Camera not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
96	15	Back Camera not working	1	0.00	f	1	2025-05-16 15:03:01.655	2025-05-16 15:03:01.655	Back Camera not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
97	15	Volume Button not working	2	0.00	f	2	2025-05-16 15:03:01.725	2025-05-16 15:03:01.725	Volume Button not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
98	15	Finger Touch not working	3	0.00	f	3	2025-05-16 15:03:01.799	2025-05-16 15:03:01.799	Finger Touch not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
99	15	WiFi not working	4	0.00	f	4	2025-05-16 15:03:01.885	2025-05-16 15:03:01.885	WiFi not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
100	15	Speaker Faulty	5	0.00	f	5	2025-05-16 15:03:01.953	2025-05-16 15:03:01.953	Speaker Faulty	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
101	15	Silent Button not working	6	0.00	f	6	2025-05-16 15:03:02.014	2025-05-16 15:03:02.014	Silent Button not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
102	15	Face Sensor not working	7	0.00	f	7	2025-05-16 15:03:02.076	2025-05-16 15:03:02.076	Face Sensor not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
103	15	Power Button not working	8	0.00	f	8	2025-05-16 15:03:02.139	2025-05-16 15:03:02.139	Power Button not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
104	15	Charging Port not working	9	0.00	f	9	2025-05-16 15:03:02.208	2025-05-16 15:03:02.208	Charging Port not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
105	15	Audio Receiver not working	10	0.00	f	10	2025-05-16 15:03:02.284	2025-05-16 15:03:02.284	Audio Receiver not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
106	15	Camera Glass Broken	11	0.00	f	11	2025-05-16 15:03:02.354	2025-05-16 15:03:02.354	Camera Glass Broken	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
107	15	Microphone not working	12	0.00	f	12	2025-05-16 15:03:02.416	2025-05-16 15:03:02.416	Microphone not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
108	15	Bluetooth not working	13	0.00	f	13	2025-05-16 15:03:02.476	2025-05-16 15:03:02.476	Bluetooth not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
109	15	Proximity Sensor not working	14	0.00	f	14	2025-05-16 15:03:02.536	2025-05-16 15:03:02.536	Proximity Sensor not working	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
110	15	Battery in Service (Health is less than 80%)	15	0.00	f	15	2025-05-16 15:03:02.596	2025-05-16 15:03:02.596	Battery in Service (Health is less than 80%)	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
111	15	Battery Health 80-85%	16	0.00	f	16	2025-05-16 15:03:02.656	2025-05-16 15:03:02.656	Battery Health 80-85%	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
112	19	Below 3 months Valid bill mandatory	0	0.00	f	0	2025-05-16 15:05:41.789	2025-05-16 15:05:41.789	Below 3 months Valid bill mandatory	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
113	19	3 months - 6 months Valid bill mandatory	1	0.00	f	1	2025-05-16 15:05:41.864	2025-05-16 15:05:41.864	3 months - 6 months Valid bill mandatory	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
114	19	6 months - 10 months Valid bill mandatory	2	0.00	f	2	2025-05-16 15:05:41.924	2025-05-16 15:05:41.924	6 months - 10 months Valid bill mandatory	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
115	19	Above 10 months	3	0.00	f	3	2025-05-16 15:05:41.985	2025-05-16 15:05:41.985	Above 10 months	\N	0	0	\N	none	gray	f	0.00	0	\N	\N	\N	t	\N
131	20	No damage	no_damage	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	No damage	\N	0	0	\N	none	gray	f	0.00	1	Device is in excellent physical condition	\N	\N	t	\N
132	20	Minor scratches	minor_scratches	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Minor scratches	\N	0	0	\N	minor	gray	f	-5.00	2	Light surface scratches that do not affect functionality	\N	\N	t	\N
133	20	Visible scratches/dents	visible_damage	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Visible scratches/dents	\N	0	0	\N	major	gray	f	-15.00	3	Noticeable physical damage but device is functional	\N	\N	t	\N
134	20	Major damage/cracks	major_damage	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Major damage/cracks	\N	0	0	\N	critical	gray	f	-30.00	4	Significant physical damage affecting appearance	\N	\N	t	\N
135	21	Perfect condition	perfect	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Perfect condition	\N	0	0	\N	none	gray	f	0.00	1	Screen is flawless with no issues	\N	\N	t	\N
136	21	Minor scratches	minor_screen_scratches	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Minor scratches	\N	0	0	\N	minor	gray	f	-8.00	2	Light scratches not affecting visibility	\N	\N	t	\N
137	21	Visible scratches	visible_screen_scratches	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Visible scratches	\N	0	0	\N	major	gray	f	-18.00	3	Noticeable scratches on screen surface	\N	\N	t	\N
138	21	Cracked/damaged	screen_cracked	0.00	f	0	2025-08-10 05:12:34.822152	2025-08-10 05:12:34.822152	Cracked/damaged	\N	0	0	\N	critical	gray	f	-40.00	4	Screen has cracks or significant damage	\N	\N	t	\N
140	22	All features working perfectly	advanced_perfect	0.00	f	0	2025-08-10 05:31:08.043168	2025-08-10 05:31:08.043168	All features working perfectly	\N	0	0	\N	none	gray	f	0.00	1	\N	\N	\N	t	\N
141	22	Most features working	advanced_good	0.00	f	0	2025-08-10 05:31:08.043168	2025-08-10 05:31:08.043168	Most features working	\N	0	0	\N	none	gray	f	-5.00	2	\N	\N	\N	t	\N
142	22	Some advanced features not working	advanced_partial	0.00	f	0	2025-08-10 05:31:08.043168	2025-08-10 05:31:08.043168	Some advanced features not working	\N	0	0	\N	none	gray	f	-15.00	3	\N	\N	\N	t	\N
143	22	Multiple advanced features failed	advanced_failed	0.00	f	0	2025-08-10 05:31:08.043168	2025-08-10 05:31:08.043168	Multiple advanced features failed	\N	0	0	\N	none	gray	f	-25.00	4	\N	\N	\N	t	\N
144	24	Never serviced	never_serviced	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Never serviced	\N	0	0	\N	none	gray	f	0.00	1	\N	\N	\N	t	\N
145	25	Never serviced	never_serviced	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Never serviced	\N	0	0	\N	none	gray	f	0.00	1	\N	\N	\N	t	\N
146	24	Minor service/cleaning	minor_service	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Minor service/cleaning	\N	0	0	\N	none	gray	f	-2.00	2	\N	\N	\N	t	\N
147	25	Minor service/cleaning	minor_service	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Minor service/cleaning	\N	0	0	\N	none	gray	f	-2.00	2	\N	\N	\N	t	\N
148	24	Major repair done	major_repair	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Major repair done	\N	0	0	\N	none	gray	f	-12.00	3	\N	\N	\N	t	\N
149	25	Major repair done	major_repair	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Major repair done	\N	0	0	\N	none	gray	f	-12.00	3	\N	\N	\N	t	\N
150	24	Multiple repairs	multiple_repairs	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Multiple repairs	\N	0	0	\N	none	gray	f	-20.00	4	\N	\N	\N	t	\N
151	25	Multiple repairs	multiple_repairs	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Multiple repairs	\N	0	0	\N	none	gray	f	-20.00	4	\N	\N	\N	t	\N
152	23	Complete original packaging	complete_package	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Complete original packaging	\N	0	0	\N	none	gray	f	5.00	1	\N	\N	\N	t	\N
153	23	Box and main accessories	main_accessories	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Box and main accessories	\N	0	0	\N	none	gray	f	2.00	2	\N	\N	\N	t	\N
154	23	Some accessories missing	some_missing	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	Some accessories missing	\N	0	0	\N	none	gray	f	-2.00	3	\N	\N	\N	t	\N
155	23	No original accessories	no_accessories	0.00	f	0	2025-08-10 05:36:28.923119	2025-08-10 05:36:28.923119	No original accessories	\N	0	0	\N	none	gray	f	-8.00	4	\N	\N	\N	t	\N
\.


--
-- Data for Name: answer_model_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.answer_model_mappings (id, answer_id, model_id, weightage, repair_cost, is_active, answer_text, description, severity, custom_settings, created_at, updated_at, deduction_rate) FROM stdin;
\.


--
-- Data for Name: brand_device_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.brand_device_types (id, brand_id, device_type_id, created_at, updated_at) FROM stdin;
1	1	1	2025-05-11 15:41:29.083834	2025-05-11 15:41:29.083834
4	1	4	2025-05-11 15:41:29.083834	2025-05-11 15:41:29.083834
5	2	1	2025-05-11 15:41:29.083834	2025-05-11 15:41:29.083834
6	2	2	2025-05-11 15:41:29.083834	2025-05-11 15:41:29.083834
11	4	1	2025-05-11 15:41:29.083834	2025-05-11 15:41:29.083834
29	1	2	2025-05-16 11:05:45.257052	2025-05-16 11:05:45.257052
32	1	3	2025-06-11 04:36:18.116753	2025-06-11 04:36:18.116753
41	4	2	2025-06-20 09:07:44.141412	2025-06-20 09:07:44.141412
45	3	1	2025-06-20 09:21:16.658723	2025-06-20 09:21:16.658723
46	6	1	2025-06-20 09:21:25.646085	2025-06-20 09:21:25.646085
47	5	2	2025-06-20 09:21:32.193875	2025-06-20 09:21:32.193875
48	5	1	2025-06-20 09:21:32.193875	2025-06-20 09:21:32.193875
67	21	1	2025-06-20 10:43:54.733926	2025-06-20 10:43:54.733926
\.


--
-- Data for Name: brand_group_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.brand_group_mappings (id, group_id, brand_id, sort_order, active, custom_settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.brands (id, name, slug, logo, active, created_at, updated_at, logo_type, description, website, featured, priority) FROM stdin;
3	Google	google	https://cdn-icons-png.flaticon.com/128/300/300221.png	t	2025-05-11 15:41:15.631041	2025-06-20 09:21:16.512	url			f	70
6	Realme	realme	https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Realme_logo_SVG.svg/500px-Realme_logo_SVG.svg.png	t	2025-06-20 09:05:32.493995	2025-06-20 09:21:25.495	url			f	50
5	Xiaomi	xiaomi	https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/1024px-Xiaomi_logo_%282021-%29.svg.png	t	2025-06-11 04:21:49.565079	2025-06-20 09:21:32.044	url			f	60
1	Apple	apple	https://cdn-icons-png.flaticon.com/128/0/747.png	t	2025-05-11 15:41:15.631041	2025-05-11 15:41:15.631041	url	Premium technology and innovation leader	https://apple.com	t	100
2	Samsung	samsung	https://cdn-icons-png.flaticon.com/128/882/882747.png	t	2025-05-11 15:41:15.631041	2025-05-11 15:41:15.631041	url	Global leader in electronics and technology	https://samsung.com	t	90
4	OnePlus	oneplus	https://cdn.worldvectorlogo.com/logos/oneplus-2.svg	t	2025-05-11 15:41:15.631041	2025-05-11 15:41:15.631041	url	Never Settle - Premium Android devices	https://oneplus.com	t	80
21	Vivo	vivo	https://cdn.worldvectorlogo.com/logos/vivo-2.svg	t	2025-06-20 10:33:47.378019	2025-06-20 10:43:54.587	url	Vivo smartphones and devices		t	75
\.


--
-- Data for Name: buyback_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.buyback_requests (id, user_id, device_type, manufacturer, model, condition, offered_price, status, customer_name, customer_email, customer_phone, pickup_address, pickup_date, pickup_time, device_model_id, notes, order_id, condition_answers, pin_code, final_price, lead_source, lead_medium, lead_campaign, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer_url, landing_page, created_at, updated_at, device_age_months, market_demand, regional_adjustment, pickup_estimated_days, gst_amount, agent_id) FROM stdin;
2	\N	smartphones	Samsung	Galaxy S21	good	35000.00	pending	Jane Smith	jane@example.com	9876543211	Delhi, DL	\N	\N	\N	Minor scratches	BR-002	\N	\N	35000.00	facebook	social	\N	facebook	social	summer_sale	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	\N
3	\N	laptops	Apple	MacBook Air	excellent	65000.00	processing	Mike Johnson	mike@example.com	9876543212	Bangalore, KA	\N	\N	\N	Like new condition	BR-003	\N	\N	65000.00	google	cpc	\N	google	cpc	laptop_ads	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	\N
5	\N	smartphones	OnePlus	OnePlus 9	fair	25000.00	cancelled	David Brown	david@example.com	9876543214	Chennai, TN	\N	\N	\N	Battery issues	BR-005	\N	\N	25000.00	instagram	social	\N	instagram	social	mobile_campaign	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	\N
7	\N	smartphones	Xiaomi	Mi 11	good	20000.00	pending	Tom Anderson	tom@example.com	9876543216	Kolkata, WB	\N	\N	\N	Good working condition	BR-007	\N	\N	20000.00	youtube	social	\N	youtube	social	tech_review	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	\N
8	\N	laptops	Dell	XPS 13	excellent	55000.00	processing	Emma Taylor	emma@example.com	9876543217	Ahmedabad, GJ	\N	\N	\N	Excellent performance	BR-008	\N	\N	55000.00	google	cpc	\N	google	cpc	laptop_deals	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	\N
10	\N	tablets	Samsung	Galaxy Tab	excellent	30000.00	pending	Amy Chen	amy@example.com	9876543219	Lucknow, UP	\N	\N	\N	Perfect condition	BR-010	\N	\N	30000.00	referral	referral	\N	techmart.com	referral	\N	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	\N
11	1	smartphone	apple	iphone-12	Poor	1000.00	pending	akshay	akshay@gmail.comq	9711110527	k22, South Delhi, Delhi - 110044	\N	\N	\N	Device assessment completed. Condition: Poor. Pickup scheduled for undefined at undefined	242243387690	{"1":"poor","2":"cracks","3":"battery_good","4":"functions_perfect"}	\N	1000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-13 16:00:35.989	2025-07-13 16:00:35.989	0	normal_demand	1.00	3-5 days	0.00	\N
1	\N	smartphones	Apple	iPhone 13	excellent	45000.00	completed	John Doe	john@example.com	9876543210	Mumbai, MH	\N	\N	\N	Device in perfect condition	BR-001	\N	\N	45000.00	google	organic	\N	google	organic	\N	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	1
4	\N	tablets	iPad	iPad Pro	good	40000.00	completed	Sarah Wilson	sarah@example.com	9876543213	Pune, MH	\N	\N	\N	Working perfectly	BR-004	\N	\N	40000.00	direct	none	\N	direct	none	\N	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	1
6	\N	smartwatches	Apple	Apple Watch	excellent	15000.00	completed	Lisa Davis	lisa@example.com	9876543215	Hyderabad, TS	\N	\N	\N	Mint condition	BR-006	\N	\N	15000.00	google	organic	\N	google	organic	\N	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	1
9	\N	smartphones	Apple	iPhone 12	good	38000.00	completed	Chris Wilson	chris@example.com	9876543218	Jaipur, RJ	\N	\N	\N	Good condition	BR-009	\N	\N	38000.00	email	email	\N	newsletter	email	monthly_deals	\N	\N	\N	\N	2025-06-13 18:04:32.706915	2025-06-13 18:04:32.706915	0	normal_demand	1.00	3-5 days	0.00	1
\.


--
-- Data for Name: checkouts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.checkouts (id, user_id, email, shipping_address_id, billing_address_id, shipping_method, subtotal, shipping_cost, tax_amount, discount_amount, total, discount_code, payment_status, notes, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: condition_answers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.condition_answers (id, question_id, answer, impact, "order", created_at, updated_at, deduction_type, fixed_amount, applicable_brands, applicable_models, description) FROM stdin;
9	3	Perfect - Like new	1.00	1	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
10	3	Good - Minor wear, small scratches	0.90	2	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
11	3	Fair - Visible wear and tear	0.70	3	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
12	3	Poor - Significant damage, dents, or missing parts	0.50	4	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
13	4	Excellent - Holds charge like new	1.00	1	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
14	4	Good - Holds charge well, 80%+ capacity	0.90	2	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
15	4	Fair - Battery life reduced, 50-80% capacity	0.70	3	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
16	4	Poor - Needs frequent charging, below 50% capacity	0.50	4	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
17	4	Very Poor - Barely holds charge	0.30	5	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
18	5	Yes, all are working perfectly	1.00	1	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
19	5	Minor issues with some functions	0.80	2	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
20	5	Several functions not working	0.60	3	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
21	5	Many functions not working	0.40	4	2025-05-11 15:44:21.516826	2025-05-11 15:44:21.516826	percentage	\N	\N	\N	\N
7	2	1	1.00	1	2025-05-13 13:05:07.955	2025-05-13 13:05:07.955	percentage	\N	\N	\N	\N
8	2	0.9	0.90	1	2025-05-13 13:05:08.023	2025-05-13 13:05:08.023	percentage	\N	\N	\N	\N
\.


--
-- Data for Name: condition_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.condition_questions (id, device_type_id, question, "order", active, created_at, updated_at, brand_id, question_type, required, help_text) FROM stdin;
3	1	How would you describe the condition of the device's body/frame?	3	t	2025-05-11 15:44:00.04694	2025-05-11 15:44:00.04694	\N	multiple_choice	t	\N
4	1	What is the battery condition?	4	t	2025-05-11 15:44:00.04694	2025-05-11 15:44:00.04694	\N	multiple_choice	t	\N
5	1	Are all buttons, ports, and speakers functioning properly?	5	t	2025-05-11 15:44:00.04694	2025-05-11 15:44:00.04694	\N	multiple_choice	t	\N
1	1	Has the device ever been repaired with non-original parts?	1	t	2025-05-13 13:03:23.171	2025-05-13 13:03:23.171	\N	multiple_choice	t	\N
2	1	How would you describe the condition of the device's screen?	2	t	2025-05-11 15:44:00.04694	2025-05-13 13:05:07.616	\N	multiple_choice	t	\N
6	1	Has the device ever been repaired with non-original parts?	6	t	2025-05-11 15:44:00.04694	2025-05-13 11:07:55.527	\N	multiple_choice	t	\N
7	1	What is the overall physical condition of your device?	1	t	2025-06-11 04:22:52.384888	2025-06-11 04:22:52.384888	\N	single_choice	t	\N
8	1	Does the screen have any cracks or damage?	2	t	2025-06-11 04:22:52.384888	2025-06-11 04:22:52.384888	\N	single_choice	t	\N
9	1	How is the battery performance?	3	t	2025-06-11 04:22:52.384888	2025-06-11 04:22:52.384888	\N	single_choice	t	\N
10	2	What is the overall condition of your laptop?	1	t	2025-06-11 04:22:52.384888	2025-06-11 04:22:52.384888	\N	single_choice	t	\N
11	2	Are there any issues with the keyboard or trackpad?	2	t	2025-06-11 04:22:52.384888	2025-06-11 04:22:52.384888	\N	single_choice	t	\N
\.


--
-- Data for Name: device_model_variants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.device_model_variants (id, model_id, variant_name, storage, color, ram, processor, display_size, base_price, current_price, market_value, depreciation_rate, availability, sku, specifications, images, active, created_at, updated_at) FROM stdin;
4	3	256GB Titanium Gray	256GB	Titanium Gray	12GB	Snapdragon 8 Gen 3	6.8"	1199	1050	950	0	t	GS24U-256-TG	{"spen": true, "camera": "200MP", "battery": "5000mAh"}	["https://example.com/s24ultra-tg-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-06-11 04:25:47.614486
6	3	1TB Titanium Violet	1TB	Titanium Violet	12GB	Snapdragon 8 Gen 3	6.8"	1659	1450	1350	0	t	GS24U-1TB-TV	{"spen": true, "camera": "200MP", "battery": "5000mAh"}	["https://example.com/s24ultra-tv-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-06-11 04:25:47.614486
7	5	512GB Space Black	512GB SSD	Space Black	18GB	M3 Pro	16.2"	2499	2200	2000	0	t	MBP16-512-SB	{"ports": "3x Thunderbolt 4", "battery": "22hrs", "display": "Liquid Retina XDR"}	["https://example.com/mbp16-sb-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-06-11 04:25:47.614486
8	5	1TB Silver	1TB SSD	Silver	36GB	M3 Max	16.2"	3499	3200	3000	0	t	MBP16-1TB-SL	{"ports": "3x Thunderbolt 4", "battery": "22hrs", "display": "Liquid Retina XDR"}	["https://example.com/mbp16-sl-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-06-11 04:25:47.614486
12	4	128GB Silver WiFi	128GB	Silver	8GB	M2	12.9"	1099	999	950	0	t	IPD-PRO-128-SL	{"keyboard": "Magic Keyboard", "apple_pencil": true, "connectivity": "WiFi"}	\N	t	2025-06-11 04:38:15.94045	2025-06-11 04:38:15.94045
13	4	256GB Space Gray WiFi	256GB	Space Gray	8GB	M2	12.9"	1299	1199	1150	0	t	IPD-PRO-256-SG	{"keyboard": "Magic Keyboard", "apple_pencil": true, "connectivity": "WiFi"}	\N	t	2025-06-11 04:38:15.94045	2025-06-11 04:38:15.94045
14	20	128GB	128GB	\N	\N	\N	\N	25000	25000	\N	0	t	\N	\N	\N	t	2025-06-20 10:48:21.748063	2025-06-20 10:48:21.748063
15	20	256GB	256GB	\N	\N	\N	\N	30000	30000	\N	0	t	\N	\N	\N	t	2025-06-20 10:48:21.748063	2025-06-20 10:48:21.748063
16	10	128GB	128GB	\N	\N	\N	\N	22000	22000	\N	0	t	\N	\N	\N	t	2025-06-20 10:48:21.748063	2025-06-20 10:48:21.748063
17	10	256GB	256GB	\N	\N	\N	\N	27000	27000	\N	0	t	\N	\N	\N	t	2025-06-20 10:48:21.748063	2025-06-20 10:48:21.748063
18	22	128GB	128GB	\N	\N	\N	\N	18000	18000	\N	0	t	\N	\N	\N	t	2025-06-20 10:48:21.748063	2025-06-20 10:48:21.748063
19	22	256GB	256GB	\N	\N	\N	\N	22000	22000	\N	0	t	\N	\N	\N	t	2025-06-20 10:48:21.748063	2025-06-20 10:48:21.748063
20	11	256GB	256GB	\N	\N	\N	\N	35000	35000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
21	11	512GB	512GB	\N	\N	\N	\N	42000	42000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
22	23	128GB	128GB	\N	\N	\N	\N	28000	28000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
23	23	256GB	256GB	\N	\N	\N	\N	32000	32000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
24	21	64GB	64GB	\N	\N	\N	\N	12000	12000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
25	21	128GB	128GB	\N	\N	\N	\N	15000	15000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
26	24	128GB	128GB	\N	\N	\N	\N	25000	25000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
27	24	256GB	256GB	\N	\N	\N	\N	28000	28000	\N	0	t	\N	\N	\N	t	2025-06-20 10:49:15.054314	2025-06-20 10:49:15.054314
28	1	128GB				\N	\N	23000	23000	23000	0	t	\N	\N	\N	t	2025-06-20 11:02:03.239111	2025-06-20 11:02:03.239111
2	1	256GB Blue Titanium	256GB	Blue Titanium	8GB	A17 Pro	6.1"	23000	33000	25000	0	t	IPH15P-256-BT	{"5g": true, "camera": "48MP", "battery": "3274mAh"}	["https://example.com/iphone15pro-bt-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-07-11 12:07:24.560431
3	1	512GB White Titanium	512GB	White Titanium	8GB	A17 Pro	6.1"	25000	35000	26000	0	t	IPH15P-512-WT	{"5g": true, "camera": "48MP", "battery": "3274mAh"}	["https://example.com/iphone15pro-wt-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-07-11 12:08:03.893278
29	1	128gb				\N	\N	NaN	NaN	NaN	0	t	\N	\N	\N	f	2025-06-20 11:04:49.139193	2025-07-11 12:11:54.996124
5	3	512GB Titanium Black	512GB	Titanium Black	12GB	Snapdragon 8 Gen 3	6.8"	50000	1250	1150	0	t	GS24U-512-TB	{"spen": true, "camera": "200MP", "battery": "5000mAh"}	["https://example.com/s24ultra-tb-1.jpg"]	t	2025-06-11 04:25:47.614486	2025-08-10 05:14:56.378448
40	1	Direct SQL Test	256GB	Green	\N	\N	\N	26000	26000	\N	0	t	\N	\N	\N	t	2025-08-10 06:56:04.130286	2025-08-10 06:56:04.130286
1	1	128GB Natural Titanium	128GB	Natural Titanium	8GB	A17 Pro	6.1"	25000	25000	24000	0	t	IPH15P-128-NT	{"5g": true, "camera": "48MP", "battery": "3274mAh"}	["https://example.com/iphone15pro-nt-1.jpg"]	f	2025-06-11 04:25:47.614486	2025-08-10 07:18:10.546
39	2	128GB	128GB	\N	\N	\N	\N	5000	5000	550	0	t	\N	\N	\N	t	2025-07-11 12:33:53.466169	2025-08-10 07:13:43.45
10	2	256GB Blue	256GB	Blue	6GB	A15 Bionic	6.1"	10000	10000	650	0	t	IPH13-256-BL	{"5g": true, "camera": "12MP", "battery": "3240mAh"}	\N	t	2025-06-11 04:38:15.94045	2025-08-10 07:13:51.822
11	2	512GB Midnight	512GB	Midnight	6GB	A15 Bionic	6.1"	15000	15000	799	0	t	IPH13-512-MD	{"5g": true, "camera": "12MP", "battery": "3240mAh"}	\N	t	2025-06-11 04:38:15.94045	2025-08-10 07:14:01.289
\.


--
-- Data for Name: device_models; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.device_models (id, name, slug, image, brand_id, device_type_id, active, featured, variants, created_at, updated_at, base_price, specifications, release_year, year, description, priority) FROM stdin;
9	iPhone 15 Pro	iphone-15-pro	https://example.com/iphone15pro.jpg	1	1	t	t	\N	2025-06-20 09:39:16.042984	2025-06-20 09:39:16.042984	25000	\N	\N	2023	\N	0
10	iPhone 14	iphone-14	https://example.com/iphone14.jpg	1	1	t	f	\N	2025-06-20 09:39:19.620435	2025-06-20 09:39:19.620435	25000	\N	\N	2022	\N	0
11	Galaxy S24 Ultra	galaxy-s24-ultra	https://example.com/galaxys24ultra.jpg	2	1	t	t	\N	2025-06-20 09:39:20.775113	2025-06-20 09:39:20.775113	25000	\N	\N	2024	\N	0
3	Galaxy S23 Ultra	galaxy-s23-ultra	https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/t/0/g/-original-imah4zp7fvqp8wev.jpeg	2	1	t	t	["256GB","512GB","1TB"]	2025-05-11 15:43:01.41926	2025-06-20 09:48:14.480285	25000	\N	\N	2024	\N	0
4	iPad Pro 12.9"	ipad-pro-12-9	https://assets/models/ipad-pro-12-9.png	1	2	t	f	["128GB", "256GB", "512GB", "1TB", "2TB"]	2025-05-11 15:43:01.41926	2025-06-20 09:52:58.530019	25000	\N	\N	2024	\N	0
1	iPhone 12	iphone-12	https://uploads/image-1747397899611-322922667.webp	1	1	t	t	["64GB","128GB","256GB"]	2025-05-11 15:43:01.41926	2025-06-20 09:53:20.588377	25000	\N	\N	2024	\N	0
2	iPhone 13	iphone-13	https://assets/models/iphone-13.png	1	1	t	f	["128GB", "256GB", "512GB"]	2025-05-11 15:43:01.41926	2025-06-20 09:53:39.576732	45000	\N	\N	2024	\N	0
5	MacBook Pro 16"	macbook-pro-16	https://assets/models/macbook-pro-16.png	1	3	t	t	["512GB", "1TB", "2TB", "4TB", "8TB"]	2025-05-11 15:43:01.41926	2025-06-20 09:53:58.850886	25000	\N	\N	2024	\N	0
6	Samsung Galaxy S21	samsung-galaxy-s21	https://images/devices/samsung-s21.jpg	2	1	t	t	["128GB", "256GB"]	2025-05-16 19:05:04.160436	2025-06-20 09:54:30.170812	35000	\N	\N	2024	\N	0
16	MacBook Air M2	macbook-air-m2	\N	1	3	t	t	\N	2025-06-20 10:20:04.653306	2025-06-20 10:20:04.653306	25000	\N	\N	2023	\N	7
17	Galaxy S24	galaxy-s24	\N	2	1	t	t	\N	2025-06-20 10:20:04.653306	2025-06-20 10:20:04.653306	25000	\N	\N	2024	\N	6
18	OnePlus 12	oneplus-12	\N	3	1	t	f	\N	2025-06-20 10:20:04.653306	2025-06-20 10:20:04.653306	25000	\N	\N	2024	\N	5
20	iPhone 15	iphone-15	\N	1	1	t	f	\N	2025-06-20 10:37:55.595054	2025-06-20 10:37:55.595054	25000	\N	\N	2023	Latest iPhone with advanced features	0
21	Redmi Note 12	redmi-note-12	\N	5	1	t	f	\N	2025-06-20 10:38:03.098905	2025-06-20 10:38:03.098905	25000	\N	\N	2023	Value for money smartphone	0
22	Galaxy S23	galaxy-s23	\N	2	1	t	f	\N	2025-06-20 10:38:03.098905	2025-06-20 10:38:03.098905	25000	\N	\N	2023	Samsung flagship smartphone	0
23	OnePlus 11	oneplus-11	\N	4	1	t	f	\N	2025-06-20 10:38:03.098905	2025-06-20 10:38:03.098905	25000	\N	\N	2023	Never Settle flagship phone	0
24	Vivo V27	vivo-v27	\N	21	1	t	f	\N	2025-06-20 10:38:03.098905	2025-06-20 10:38:03.098905	25000	\N	\N	2023	Camera focused smartphone	0
\.


--
-- Data for Name: device_question_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.device_question_mappings (id, model_id, question_id, active, created_at, updated_at) FROM stdin;
1	2	5	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
2	3	5	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
3	1	5	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
4	6	5	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
5	2	9	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
6	3	9	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
7	1	9	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
8	6	9	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
9	2	12	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
10	3	12	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
11	1	12	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
12	6	12	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
13	2	13	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
14	3	13	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
15	1	13	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
16	6	13	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
17	2	14	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
18	3	14	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
19	1	14	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
20	6	14	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
21	2	16	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
22	3	16	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
23	1	16	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
24	6	16	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
25	2	18	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
26	3	18	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
27	1	18	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
28	6	18	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
29	2	15	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
30	3	15	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
31	1	15	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
32	6	15	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
33	2	19	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
34	3	19	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
35	1	19	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
36	6	19	t	2025-06-11 01:44:38.187166	2025-06-11 01:44:38.187166
\.


--
-- Data for Name: device_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.device_types (id, name, slug, icon, active, created_at, updated_at, description, icon_type, custom_icon, icon_color, background_color, priority) FROM stdin;
1	Smartphone	smartphone	watch	t	2025-05-11 15:40:57.015204	2025-07-11 11:23:30.247		emoji	📱	#3B82F6	#EFF6FF	1
3	Laptop	laptops	laptop	t	2025-05-11 15:40:57.015204	2025-07-11 11:23:40.365		emoji	💻	#3B82F6	#EFF6FF	2
2	Tablet	tablet	tablet	t	2025-05-11 15:40:57.015204	2025-07-11 11:23:48.783		custom	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <!-- Tablet body -->\n  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" fill="#2C2C2C" stroke="#000" stroke-width="1"/>\n\n  <!-- Screen -->\n  <rect x="5" y="3" width="14" height="17" rx="1" ry="1" fill="#FFFFFF" stroke="#CCCCCC" stroke-width="0.5"/>\n\n  <!-- Camera -->\n  <circle cx="12" cy="2.8" r="0.6" fill="#888888"/>\n\n  <!-- Home button -->\n  <circle cx="12" cy="21" r="1" fill="#444444"/>\n</svg>\n	#3B82F6	#EFF6FF	3
4	Watchs	watchs	watch	t	2025-05-11 15:40:57.015204	2025-07-11 11:23:54.236		emoji	⌚	#3B82F6	#EFF6FF	4
\.


--
-- Data for Name: diagnostic_answers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.diagnostic_answers (id, question_id, answer, is_pass, "order", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: diagnostic_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.diagnostic_questions (id, device_type_id, question, "order", active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.discounts (id, code, title, description, discount_type, value, status, min_order_amount, max_discount_amount, usage_limit, usage_count, starts_at, ends_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: error_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.error_reports (id, error_id, message, type, status_code, stack, component_stack, user_agent, url, user_id, context, "timestamp", resolved, resolution_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: feature_toggles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.feature_toggles (id, feature_key, display_name, description, is_enabled, category, scope, scope_id, required_permission, last_modified_by, last_modified_at, created_at, updated_at) FROM stdin;
1	email_marketplace	Email Marketplace	Enable email notifications for marketplace activity and listings	f	notifications	global	\N	\N	1	2025-05-16 09:00:36.041	2025-05-16 09:00:36.075347	2025-05-16 09:00:36.075347
3	partner_wallet	Partner Wallet	Enable partner wallet functionality for managing commissions and payments	t	partners	global	\N	\N	1	2025-05-16 09:00:36.472	2025-05-16 09:00:36.505113	2025-05-16 09:00:36.505113
4	buyback_valuation	Buyback Valuation System	Enable the dynamic device valuation system for the buyback process	t	buyback	global	\N	\N	1	2025-05-16 09:00:36.66	2025-05-16 09:00:36.692093	2025-05-16 09:00:36.692093
5	marketplace_listing	Marketplace Listing	Allow users to create marketplace listings for devices	t	marketplace	global	\N	\N	1	2025-05-16 09:00:36.851	2025-05-16 09:00:36.885548	2025-05-16 09:00:36.885548
6	regional_pricing	Regional Pricing	Enable region-specific pricing for devices and products	f	marketplace	global	\N	\N	1	2025-05-16 09:00:37.053	2025-05-16 09:00:37.09086	2025-05-16 09:00:37.09086
2	shop_now_button	Shop Now Button	Show the 'Shop Now' button on homepage and product listings	f	ui	global	\N	\N	1	2025-05-16 18:32:58.01	2025-05-16 09:00:36.316278	2025-05-16 18:32:58.01
\.


--
-- Data for Name: group_model_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.group_model_mappings (id, group_id, model_id, sort_order, active, group_name, group_statement, custom_settings, created_at, updated_at) FROM stdin;
1	17	2	0	t	\N	\N	\N	2025-08-10 05:19:03.768473	2025-08-10 05:19:03.768473
2	18	2	0	t	\N	\N	\N	2025-08-10 05:19:03.768473	2025-08-10 05:19:03.768473
3	22	2	0	t	\N	\N	\N	2025-08-10 05:31:12.42754	2025-08-10 05:31:12.42754
4	23	2	0	t	\N	\N	\N	2025-08-10 05:31:12.42754	2025-08-10 05:31:12.42754
5	24	2	0	t	\N	\N	\N	2025-08-10 05:31:12.42754	2025-08-10 05:31:12.42754
6	21	22	0	t	\N	\N	{}	2025-08-10 05:33:23.998519	2025-08-10 05:33:23.998519
\.


--
-- Data for Name: invoice_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_templates (id, name, description, is_default, html_template, css_styles, configuration, created_at, updated_at, partner_id) FROM stdin;
1	Standard Invoice	Default invoice template	t	<div class="invoice"><h1>INVOICE</h1>{{invoiceContent}}</div>	\N	\N	2025-05-12 18:36:06.031341	2025-05-12 18:36:06.031341	\N
2	Standard Invoice	Default invoice template	t	<div class="invoice"><h1>INVOICE</h1>{{invoiceContent}}</div>	\N	\N	2025-05-13 14:09:09.079963	2025-05-13 14:09:09.079963	\N
3	Standard Invoice	Default invoice template	t	<div class="invoice"><h1>INVOICE</h1>{{invoiceContent}}</div>	\N	\N	2025-05-15 19:23:43.1985	2025-05-15 19:23:43.1985	\N
4	Standard Invoice	Default invoice template	t	<div class="invoice"><h1>INVOICE</h1>{{invoiceContent}}</div>	\N	\N	2025-05-15 19:34:33.926837	2025-05-15 19:34:33.926837	\N
5	Standard Invoice	Default invoice template	t	<div class="invoice"><h1>INVOICE</h1>{{invoiceContent}}</div>	\N	\N	2025-05-15 19:42:17.389529	2025-05-15 19:42:17.389529	\N
\.


--
-- Data for Name: lead_completion_status; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lead_completion_status (id, lead_id, revaluation_completed, photos_uploaded, kyc_completed, payment_confirmed, device_completed, completed_at, agent_id, created_at, updated_at) FROM stdin;
1	1001	t	f	f	f	f	\N	AGENT001	2025-08-10 09:05:58.323435	2025-08-10 09:05:58.323435
2	1002	t	f	f	f	f	\N	AGENT001	2025-08-10 09:05:58.323435	2025-08-10 09:05:58.323435
3	1003	t	f	f	f	f	\N	AGENT001	2025-08-10 09:05:58.323435	2025-08-10 09:05:58.323435
\.


--
-- Data for Name: lead_kyc; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lead_kyc (id, lead_id, customer_name, id_type, id_number, id_photo_front, id_photo_back, customer_selfie, verification_status, verified_at, created_at, agent_id, imei_number, phone_photo_url) FROM stdin;
\.


--
-- Data for Name: lead_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lead_payments (id, lead_id, payment_method, amount, account_details, transfer_proof, payment_status, confirmed_at, created_at, agent_id) FROM stdin;
\.


--
-- Data for Name: lead_photos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lead_photos (id, lead_id, photo_type, photo_url, file_name, file_size, uploaded_at, agent_id) FROM stdin;
\.


--
-- Data for Name: model_pricing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.model_pricing (id, model_id, base_price, deduction_rate, pricing_tier_id, market_price, is_active, created_at, updated_at) FROM stdin;
1	2	50000.00	8.00	\N	\N	t	2025-06-13 18:50:39.410994	2025-06-13 18:50:39.410994
2	5	50000.00	8.00	\N	\N	t	2025-06-13 18:50:39.410994	2025-06-13 18:50:39.410994
3	6	35000.00	10.00	\N	\N	t	2025-06-13 18:50:39.410994	2025-06-13 18:50:39.410994
4	4	50000.00	8.00	\N	\N	t	2025-06-13 18:50:39.410994	2025-06-13 18:50:39.410994
5	1	50000.00	8.00	\N	\N	t	2025-06-13 18:50:39.410994	2025-06-13 18:50:39.410994
6	3	35000.00	10.00	\N	\N	t	2025-06-13 18:50:39.410994	2025-06-13 18:50:39.410994
\.


--
-- Data for Name: model_question_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.model_question_mappings (id, model_id, question_id, question_group_id, required, active, created_at, updated_at) FROM stdin;
1	2	5	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
2	2	9	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
3	2	12	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
4	2	13	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
5	2	14	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
6	2	16	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
7	2	18	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
8	2	15	4	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
9	2	19	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
10	4	5	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
11	4	9	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
12	4	12	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
13	4	13	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
14	4	14	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
15	4	16	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
16	4	18	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
17	4	15	4	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
18	4	19	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
19	5	5	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
20	5	9	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
21	5	12	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
22	5	13	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
23	5	14	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
24	5	16	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
25	5	18	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
26	5	15	4	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
27	5	19	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
28	3	5	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
29	3	9	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
30	3	12	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
31	3	13	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
32	3	14	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
33	3	16	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
34	3	18	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
35	3	15	4	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
36	3	19	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
37	1	5	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
38	1	9	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
39	1	12	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
40	1	13	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
41	1	14	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
42	1	16	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
43	1	18	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
44	1	15	4	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
45	1	19	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
46	6	5	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
47	6	9	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
48	6	12	2	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
49	6	13	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
50	6	14	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
51	6	16	3	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
52	6	18	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
53	6	15	4	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
54	6	19	5	t	t	2025-05-17 14:56:45.633039	2025-05-17 14:56:45.633039
\.


--
-- Data for Name: model_question_modes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.model_question_modes (id, model_id, question_mode, enable_advanced, created_at, updated_at) FROM stdin;
1	2	both	t	2025-08-10 05:31:10.043899	2025-08-10 05:31:10.043899
\.


--
-- Data for Name: partner_staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.partner_staff (id, user_id, partner_id, role, assigned_regions, assigned_pincodes, custom_permissions, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.partners (id, name, email, phone, address, logo, status, specialization, regions, device_types, pin_codes, commission_rate, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payments (id, checkout_id, amount, currency, payment_method, payment_method_details, payment_intent_id, charge_id, status, error_message, refunded, refunded_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pricing_tiers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pricing_tiers (id, name, description, base_multiplier, deduction_rate, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_question_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_question_mappings (id, product_id, question_id, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: question_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.question_groups (id, name, statement, device_type_id, icon, active, created_at, updated_at, category, description, sort_order, color, is_reusable, device_types, question_level) FROM stdin;
3	Select screen/body defects that are applicable	 Screen's Physical Condition?	1		t	2025-05-16 13:10:23.437	2025-05-17 15:20:59.947092	general	\N	0	#3B82F6	t	\N	standard
4	Functional or Physical Problems	Please choose appropriate condition to get accurate quote	1		t	2025-05-16 13:10:50.04	2025-05-17 15:21:04.483146	general	\N	0	#3B82F6	t	\N	standard
5	Do you have the following?	Please select accessories which are available	1		t	2025-05-16 13:11:21.101	2025-05-17 15:21:08.31522	general	\N	0	#3B82F6	t	\N	standard
2	Tell us more about your device?	lease provide correct details	1		t	2025-05-16 13:09:25.099	2025-05-18 09:26:56.989838	general	\N	0	#3B82F6	t	\N	standard
17	Body & Physical Condition	Tell us about the physical condition of your device	\N	\N	t	2025-08-10 05:11:01.161614	2025-08-10 05:11:01.161614	body	Assessment of physical damage, scratches, and overall body condition	1	#EF4444	t	["smartphone", "tablet", "laptop"]	standard
18	Screen & Display Assessment	How is your device screen performing?	\N	\N	t	2025-08-10 05:11:01.161614	2025-08-10 05:11:01.161614	screen	Detailed evaluation of screen quality, touch response, and display issues	2	#3B82F6	t	["smartphone", "tablet", "laptop"]	standard
19	Functional Issues Check	Are there any functional problems with your device?	\N	\N	t	2025-08-10 05:11:01.161614	2025-08-10 05:11:01.161614	functional	Testing of core functionality including camera, speakers, buttons, etc.	3	#8B5CF6	t	["smartphone", "tablet", "smartwatch"]	standard
20	One Month Warranty Coverage	Select warranty-related concerns	\N	\N	t	2025-08-10 05:11:01.161614	2025-08-10 05:11:01.161614	warranty	Items covered under one-month warranty for refurbished devices	4	#10B981	t	["smartphone", "laptop", "tablet"]	standard
21	Accessories & Box Contents	What accessories do you have?	\N	\N	t	2025-08-10 05:11:01.161614	2025-08-10 05:11:01.161614	accessories	Verification of original accessories, charger, box, and documentation	5	#F59E0B	t	["smartphone", "laptop", "smartwatch"]	standard
22	Advanced Functional Testing	Detailed functionality assessment for advanced evaluation	\N	\N	t	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	functionality	\N	6	#8B5CF6	t	["smartphone"]	advanced
23	One Month Warranty Coverage	Warranty and service history evaluation	\N	\N	t	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	warranty	\N	7	#F59E0B	t	["smartphone"]	advanced
24	Accessories & Original Box	Assessment of included accessories and packaging	\N	\N	t	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	accessories	\N	8	#10B981	t	["smartphone"]	advanced
\.


--
-- Data for Name: question_model_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.question_model_mappings (id, question_group_id, model_id, auto_deduction_rate, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.questions (id, question_text, question_type, group_id, "order", active, tooltip, required, created_at, updated_at, device_model_ids, brand_ids, applicable_models, question_group_id, help_text, sort_order, is_reusable, exclude_model_ids, metadata) FROM stdin;
5	Are you able to make and receive calls?	single_choice	2	1	t	Check your device for cellular network connectivity issues.	t	2025-05-16 14:11:21.383	2025-05-16 14:23:19.947	\N	\N	\N	\N	\N	0	t	\N	\N
9	Is your device's touch screen working properly?	single_choice	2	2	t	Check the touch screen functionality of your phone.	t	2025-05-16 14:24:16.721	2025-05-16 14:29:17.58	\N	\N	\N	\N	\N	0	t	\N	\N
12	Is your phone's screen original?	single_choice	2	3	t	Pick "No" if screen was changed at local shop.	t	2025-05-16 14:30:53.56	2025-05-16 14:30:53.56	\N	\N	\N	\N	\N	0	t	\N	\N
13	Broken/scratch on device screen	single_choice	3	1	t	Because you selected screen defect	f	2025-05-16 14:34:19.119	2025-05-16 14:39:06.147	\N	\N	\N	\N	\N	0	t	\N	\N
14	Dead Spot/Visible line and Discoloration on screen	single_choice	3	2	t	because you selected defective screen	f	2025-05-16 14:41:40.897	2025-05-16 14:41:52.511	\N	\N	\N	\N	\N	0	t	\N	\N
16	How is the Body's Physical Condition?	single_choice	3	3	t	Because you selected device's body defect	t	2025-05-16 14:49:51.108	2025-05-16 14:56:47.304	\N	\N	\N	\N	\N	0	t	\N	\N
18	What is accessories are available with the Device?	multiple_choice	5	1	t	Please select accessories which are available	f	2025-05-16 15:02:08.87	2025-05-16 15:02:17.614	\N	\N	\N	\N	\N	0	t	\N	\N
15	Functional or Physical Problems	multiple_choice	4	1	t	Please choose appropriate condition to get accurate quote	f	2025-05-16 14:46:25.732	2025-05-16 15:03:00.991	\N	\N	\N	\N	\N	0	t	\N	\N
19	What is your mobile age?	single_choice	5	2	t	(Because you chose your device is under brand's warranty)	t	2025-05-16 15:05:40.67	2025-05-16 15:05:40.67	\N	\N	\N	\N	\N	0	t	\N	\N
20	Is there any physical damage to the device body?	single_choice	17	0	t	Check for cracks, scratches, or dents on the body	t	2025-08-10 05:11:25.80859	2025-08-10 05:11:25.80859	\N	\N	\N	\N	Examine the device for any visible physical damage	1	t	\N	\N
21	How is the screen condition?	single_choice	18	0	t	Check screen for cracks, dead pixels, or display issues	t	2025-08-10 05:11:25.80859	2025-08-10 05:11:25.80859	\N	\N	\N	\N	Assess the overall screen quality and functionality	1	t	\N	\N
22	Are all advanced features working (Face ID, wireless charging, camera AI)?	single_choice	22	0	t	Test advanced smartphone features	t	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	\N	\N	\N	\N	Check Face ID recognition, wireless charging, and AI camera features	1	t	\N	\N
23	Do you have the original box and accessories?	single_choice	24	0	t	Original packaging and accessories	f	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	\N	\N	\N	\N	Includes charger, earphones, and original box	1	t	\N	\N
24	Has the device been serviced or repaired?	single_choice	20	0	t	Service and repair history	t	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	\N	\N	\N	\N	Any previous repairs or warranty claims	1	t	\N	\N
25	Has the device been serviced or repaired?	single_choice	23	0	t	Service and repair history	t	2025-08-10 05:30:43.875176	2025-08-10 05:30:43.875176	\N	\N	\N	\N	Any previous repairs or warranty claims	1	t	\N	\N
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.regions (id, name, code, active, created_at, updated_at) FROM stdin;
4	Chennai	IN-TN	t	2025-05-12 18:36:05.801423	2025-05-12 18:36:05.801423
5	Bengaluru	IN-KA	t	2025-05-12 18:36:05.801423	2025-05-12 18:36:05.801423
1	Delhi	IN-DL	t	2025-05-12 18:36:05.801423	2025-05-12 18:36:05.801423
3	Kolkata	IN-WB	t	2025-05-12 18:36:05.801423	2025-05-12 18:36:05.801423
2	Mumbai	IN-MH	t	2025-05-12 18:36:05.801423	2025-05-12 18:36:05.801423
\.


--
-- Data for Name: route_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.route_rules (id, path, pin_code, partner_id, region_id, priority, is_active, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
2	general.site_tagline	"Your Trusted Source for Device Buyback and Refurbished Gadgets"	2025-05-13 09:59:03.022571+00	2025-05-13 09:59:03.022571+00
3	general.contact_email	"info@gadgetswap.com"	2025-05-13 09:59:03.087045+00	2025-05-13 09:59:03.087045+00
4	general.support_phone	"+1 (555) 123-4567"	2025-05-13 09:59:03.149697+00	2025-05-13 09:59:03.149697+00
5	buyback.min_offer_amount	5	2025-05-13 09:59:03.257212+00	2025-05-13 09:59:03.257212+00
6	buyback.max_processing_days	3	2025-05-13 09:59:03.317939+00	2025-05-13 09:59:03.317939+00
7	buyback.payment_methods	["PayPal", "Bank Transfer", "Store Credit"]	2025-05-13 09:59:03.377337+00	2025-05-13 09:59:03.377337+00
8	marketplace.enable_marketplace	true	2025-05-13 09:59:03.44065+00	2025-05-13 09:59:03.44065+00
9	marketplace.featured_products_count	8	2025-05-13 09:59:03.501753+00	2025-05-13 09:59:03.501753+00
10	marketplace.product_pricing_strategy	"cost_plus_margin"	2025-05-13 09:59:03.565673+00	2025-05-13 09:59:03.565673+00
11	shipping.default_shipping_country	"US"	2025-05-13 09:59:03.625791+00	2025-05-13 09:59:03.625791+00
12	shipping.free_shipping_min_order	50	2025-05-13 09:59:03.694658+00	2025-05-13 09:59:03.694658+00
1	general.site_name	"TechRecycle"	2025-05-13 09:59:02.955336+00	2025-05-13 09:59:07.841+00
14	category	"general"	2025-05-13 10:01:22.868531+00	2025-05-13 10:01:22.868531+00
15	settings.site_name	"ram"	2025-05-13 10:01:22.995898+00	2025-05-13 10:01:22.995898+00
16	settings.site_tagline	"Your Trusted Source for Device Buyback and Refurbished Gadgets"	2025-05-13 10:01:23.116112+00	2025-05-13 10:01:23.116112+00
17	settings.admin_email	"admi@gadgetswap.com"	2025-05-13 10:01:23.238861+00	2025-05-13 10:01:23.238861+00
18	settings.contact_phone	"9811111178"	2025-05-13 10:01:23.358235+00	2025-05-13 10:01:23.358235+00
19	settings.currency	"INR"	2025-05-13 10:01:23.47409+00	2025-05-13 10:01:23.47409+00
20	settings.currency_symbol	" ₹"	2025-05-13 10:01:23.589472+00	2025-05-13 10:01:23.589472+00
21	site_name	""	2025-05-13 10:59:30.403721+00	2025-05-13 10:59:30.403721+00
22	site_url	""	2025-05-13 10:59:30.524216+00	2025-05-13 10:59:30.524216+00
23	site_description	""	2025-05-13 10:59:30.641477+00	2025-05-13 10:59:30.641477+00
24	primary_color	"#3b82f6"	2025-05-13 10:59:30.758552+00	2025-05-13 10:59:30.758552+00
25	secondary_color	"#10b981"	2025-05-13 10:59:30.875184+00	2025-05-13 10:59:30.875184+00
26	enable_marketplace	true	2025-05-13 10:59:30.992865+00	2025-05-13 10:59:30.992865+00
27	enable_reviews	true	2025-05-13 10:59:31.110671+00	2025-05-13 10:59:31.110671+00
28	default_currency	"USD"	2025-05-13 10:59:31.228645+00	2025-05-13 10:59:31.228645+00
29	tax_rate	0	2025-05-13 10:59:31.347952+00	2025-05-13 10:59:31.347952+00
30	shipping.enable_shipping	true	2025-05-13 10:59:31.462392+00	2025-05-13 10:59:31.462392+00
31	shipping.default_shipping_fee	0	2025-05-13 10:59:31.578113+00	2025-05-13 10:59:31.578113+00
32	shipping.free_shipping_threshold	0	2025-05-13 10:59:31.698664+00	2025-05-13 10:59:31.698664+00
33	shipping.shipping_providers	[]	2025-05-13 10:59:31.814377+00	2025-05-13 10:59:31.814377+00
13	shipping.shipping_zones	[]	2025-05-13 09:59:03.756179+00	2025-05-13 10:59:31.899+00
34	payment.providers.stripe.enabled	true	2025-05-13 10:59:32.060577+00	2025-05-13 10:59:32.060577+00
35	payment.providers.stripe.test_mode	true	2025-05-13 10:59:32.178714+00	2025-05-13 10:59:32.178714+00
36	payment.providers.paypal.enabled	false	2025-05-13 10:59:32.303728+00	2025-05-13 10:59:32.303728+00
37	payment.providers.paypal.test_mode	true	2025-05-13 10:59:32.421659+00	2025-05-13 10:59:32.421659+00
38	payment.providers.bank_transfer.enabled	false	2025-05-13 10:59:32.54023+00	2025-05-13 10:59:32.54023+00
39	payment.providers.bank_transfer.account_details	""	2025-05-13 10:59:32.657153+00	2025-05-13 10:59:32.657153+00
40	payment.order_prefix	"ORD"	2025-05-13 10:59:32.772884+00	2025-05-13 10:59:32.772884+00
41	payment.invoice_prefix	"INV"	2025-05-13 10:59:32.889378+00	2025-05-13 10:59:32.889378+00
42	email.sender_name	""	2025-05-13 10:59:33.004915+00	2025-05-13 10:59:33.004915+00
43	email.sender_email	""	2025-05-13 10:59:33.121422+00	2025-05-13 10:59:33.121422+00
44	email.enable_notifications	true	2025-05-13 10:59:33.237723+00	2025-05-13 10:59:33.237723+00
45	email.notification_templates.order_confirmation	true	2025-05-13 10:59:33.352725+00	2025-05-13 10:59:33.352725+00
46	email.notification_templates.order_shipped	true	2025-05-13 10:59:33.470318+00	2025-05-13 10:59:33.470318+00
47	email.notification_templates.order_delivered	true	2025-05-13 10:59:33.587379+00	2025-05-13 10:59:33.587379+00
48	email.notification_templates.order_cancelled	true	2025-05-13 10:59:33.746665+00	2025-05-13 10:59:33.746665+00
49	seo.meta_title	""	2025-05-13 10:59:33.878354+00	2025-05-13 10:59:33.878354+00
50	seo.meta_description	""	2025-05-13 10:59:34.017943+00	2025-05-13 10:59:34.017943+00
51	seo.keywords	""	2025-05-13 10:59:34.155716+00	2025-05-13 10:59:34.155716+00
52	seo.enable_sitemap	true	2025-05-13 10:59:34.392986+00	2025-05-13 10:59:34.392986+00
53	seo.enable_robots	true	2025-05-13 10:59:34.620869+00	2025-05-13 10:59:34.620869+00
\.


--
-- Data for Name: store_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.store_templates (id, name, description, type, thumbnail, is_default, configuration, created_at, updated_at) FROM stdin;
1	Standard Product Page	Default product page layout	product	\N	t	\N	2025-05-12 18:36:05.876031	2025-05-12 18:36:05.876031
2	Grid Category Page	Grid layout for category pages	category	\N	t	\N	2025-05-12 18:36:05.876031	2025-05-12 18:36:05.876031
3	Standard Cart	Default cart page layout	cart	\N	t	\N	2025-05-12 18:36:05.876031	2025-05-12 18:36:05.876031
4	Standard Checkout	Default checkout page layout	checkout	\N	t	\N	2025-05-12 18:36:05.876031	2025-05-12 18:36:05.876031
5	Standard Product Page	Default product page layout	product	\N	t	\N	2025-05-13 14:09:09.079963	2025-05-13 14:09:09.079963
6	Grid Category Page	Grid layout for category pages	category	\N	t	\N	2025-05-13 14:09:09.079963	2025-05-13 14:09:09.079963
7	Standard Cart	Default cart page layout	cart	\N	t	\N	2025-05-13 14:09:09.079963	2025-05-13 14:09:09.079963
8	Standard Checkout	Default checkout page layout	checkout	\N	t	\N	2025-05-13 14:09:09.079963	2025-05-13 14:09:09.079963
9	Standard Product Page	Default product page layout	product	\N	t	\N	2025-05-15 19:23:43.1985	2025-05-15 19:23:43.1985
10	Grid Category Page	Grid layout for category pages	category	\N	t	\N	2025-05-15 19:23:43.1985	2025-05-15 19:23:43.1985
11	Standard Cart	Default cart page layout	cart	\N	t	\N	2025-05-15 19:23:43.1985	2025-05-15 19:23:43.1985
12	Standard Checkout	Default checkout page layout	checkout	\N	t	\N	2025-05-15 19:23:43.1985	2025-05-15 19:23:43.1985
13	Standard Product Page	Default product page layout	product	\N	t	\N	2025-05-15 19:34:33.926837	2025-05-15 19:34:33.926837
14	Grid Category Page	Grid layout for category pages	category	\N	t	\N	2025-05-15 19:34:33.926837	2025-05-15 19:34:33.926837
15	Standard Cart	Default cart page layout	cart	\N	t	\N	2025-05-15 19:34:33.926837	2025-05-15 19:34:33.926837
16	Standard Checkout	Default checkout page layout	checkout	\N	t	\N	2025-05-15 19:34:33.926837	2025-05-15 19:34:33.926837
17	Standard Product Page	Default product page layout	product	\N	t	\N	2025-05-15 19:42:17.389529	2025-05-15 19:42:17.389529
18	Grid Category Page	Grid layout for category pages	category	\N	t	\N	2025-05-15 19:42:17.389529	2025-05-15 19:42:17.389529
19	Standard Cart	Default cart page layout	cart	\N	t	\N	2025-05-15 19:42:17.389529	2025-05-15 19:42:17.389529
20	Standard Checkout	Default checkout page layout	checkout	\N	t	\N	2025-05-15 19:42:17.389529	2025-05-15 19:42:17.389529
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tags (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.time_slots (id, date, time_slot, is_available, max_bookings, current_bookings, created_at, updated_at) FROM stdin;
1	2025-08-10	10:00:00	t	4	2	2025-08-10 08:09:08.188576	2025-08-10 08:09:09.335025
\.


--
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_feedback (id, type, message, context, user_id, url, user_agent, rating, category, resolved, admin_response, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password_hash, first_name, last_name, role, created_at, updated_at, stripe_customer_id, stripe_subscription_id, partner_id, region_id) FROM stdin;
2	admin@gadgetswap.com	admin123	Admin	User	admin	2025-05-11 15:29:47.094222	2025-05-11 15:29:47.094222	\N	\N	\N	\N
1	test@example.com	hashed_password	Test	User	admin	2025-05-11 14:44:25.288569	2025-05-13 11:00:00.098	\N	\N	\N	\N
\.


--
-- Data for Name: valuations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.valuations (id, device_model_id, base_price, condition_excellent, condition_good, condition_fair, condition_poor, variant_multipliers, created_at, updated_at) FROM stdin;
1	1	2000.00	1.00	1.00	2.00	3.00	"{\\"128GB\\":1,\\"256GB\\":1,\\"512GB\\":1.1,\\"1TB\\":1.3}"	2025-05-11 15:45:20.155189	2025-05-13 10:16:46.831
2	2	600.00	1.00	1.00	80.00	40.00	"{\\"128GB\\":1,\\"256GB\\":1.2,\\"512GB\\":1.4}"	2025-05-11 15:45:20.155189	2025-05-13 10:18:19.896
3	5	6000.00	100.00	80.00	60.00	40.00	{"512GB":1,"1TB":1,"2TB":1,"4TB":1,"8TB":1}	2025-05-13 11:10:17.098	2025-05-13 11:10:17.098
4	4	7000.00	100.00	80.00	60.00	40.00	{"128GB":1,"256GB":1,"512GB":1,"1TB":1,"2TB":1}	2025-05-13 11:10:27.204	2025-05-13 11:10:27.204
5	3	600000.00	100.00	80.00	60.00	40.00	{"256GB":1,"512GB":1,"1TB":1}	2025-05-13 11:10:38.847	2025-05-13 11:10:38.847
\.


--
-- Data for Name: variant_pricing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.variant_pricing (id, variant_id, base_price, deduction_rate, pricing_tier_id, override_model_pricing, is_active, created_at, updated_at) FROM stdin;
1	4	1050.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
2	5	1250.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
3	6	1450.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
4	7	2200.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
5	8	3200.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
7	10	699.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
8	11	849.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
9	12	999.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
10	13	1199.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
11	14	25000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
12	15	30000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
13	16	22000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
14	17	27000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
15	18	18000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
16	19	22000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
17	20	35000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
18	21	42000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
19	22	28000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
20	23	32000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
21	24	12000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
22	25	15000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
23	26	25000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
24	27	28000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
25	28	23000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
26	2	33000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
27	3	35000.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
28	1	31999.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
29	29	NaN	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
30	39	599.00	0.00	\N	f	t	2025-08-10 04:55:52.706475	2025-08-10 04:55:52.706475
\.


--
-- Data for Name: variant_question_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.variant_question_mappings (id, variant_id, group_id, active, created_at) FROM stdin;
\.


--
-- Data for Name: working_hours; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.working_hours (id, day_of_week, start_time, end_time, is_active, break_start_time, break_end_time, max_appointments_per_hour, created_at, updated_at) FROM stdin;
1	1	09:00:00	18:00:00	t	13:00:00	14:00:00	4	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
2	2	09:00:00	18:00:00	t	13:00:00	14:00:00	4	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
3	3	09:00:00	18:00:00	t	13:00:00	14:00:00	4	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
4	4	09:00:00	18:00:00	t	13:00:00	14:00:00	4	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
5	5	09:00:00	18:00:00	t	13:00:00	14:00:00	4	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
6	6	09:00:00	17:00:00	t	13:00:00	14:00:00	3	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
7	0	10:00:00	16:00:00	t	\N	\N	2	2025-06-20 08:29:26.235545	2025-06-20 08:29:26.235545
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: neondb_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: admin_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_configurations_id_seq', 10, true);


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: answer_choices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.answer_choices_id_seq', 155, true);


--
-- Name: answer_model_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.answer_model_mappings_id_seq', 1, false);


--
-- Name: brand_device_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.brand_device_types_id_seq', 67, true);


--
-- Name: brand_group_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.brand_group_mappings_id_seq', 1, false);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.brands_id_seq', 21, true);


--
-- Name: buyback_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.buyback_requests_id_seq', 11, true);


--
-- Name: checkouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.checkouts_id_seq', 1, false);


--
-- Name: condition_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.condition_answers_id_seq', 10, true);


--
-- Name: condition_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.condition_questions_id_seq', 11, true);


--
-- Name: device_model_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.device_model_variants_id_seq', 40, true);


--
-- Name: device_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.device_models_id_seq', 24, true);


--
-- Name: device_question_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.device_question_mappings_id_seq', 46, true);


--
-- Name: device_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.device_types_id_seq', 10, true);


--
-- Name: diagnostic_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.diagnostic_answers_id_seq', 1, false);


--
-- Name: diagnostic_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.diagnostic_questions_id_seq', 1, false);


--
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.discounts_id_seq', 1, false);


--
-- Name: error_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.error_reports_id_seq', 1, false);


--
-- Name: feature_toggles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.feature_toggles_id_seq', 6, true);


--
-- Name: group_model_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.group_model_mappings_id_seq', 6, true);


--
-- Name: invoice_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.invoice_templates_id_seq', 5, true);


--
-- Name: lead_completion_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.lead_completion_status_id_seq', 3, true);


--
-- Name: lead_kyc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.lead_kyc_id_seq', 1, false);


--
-- Name: lead_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.lead_payments_id_seq', 1, false);


--
-- Name: lead_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.lead_photos_id_seq', 1, false);


--
-- Name: model_pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.model_pricing_id_seq', 6, true);


--
-- Name: model_question_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.model_question_mappings_id_seq', 54, true);


--
-- Name: model_question_modes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.model_question_modes_id_seq', 1, true);


--
-- Name: partner_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.partner_staff_id_seq', 1, false);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.partners_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: pricing_tiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pricing_tiers_id_seq', 4, true);


--
-- Name: product_question_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_question_mappings_id_seq', 1, false);


--
-- Name: question_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.question_groups_id_seq', 24, true);


--
-- Name: question_model_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.question_model_mappings_id_seq', 1, false);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.questions_id_seq', 25, true);


--
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.regions_id_seq', 25, true);


--
-- Name: route_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.route_rules_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.settings_id_seq', 53, true);


--
-- Name: store_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.store_templates_id_seq', 20, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: time_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.time_slots_id_seq', 1, true);


--
-- Name: user_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_feedback_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: valuations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.valuations_id_seq', 5, true);


--
-- Name: variant_pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.variant_pricing_id_seq', 30, true);


--
-- Name: variant_question_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.variant_question_mappings_id_seq', 1, false);


--
-- Name: working_hours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.working_hours_id_seq', 7, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_configurations admin_configurations_config_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_configurations
    ADD CONSTRAINT admin_configurations_config_key_key UNIQUE (config_key);


--
-- Name: admin_configurations admin_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_configurations
    ADD CONSTRAINT admin_configurations_pkey PRIMARY KEY (id);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: answer_choices answer_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_choices
    ADD CONSTRAINT answer_choices_pkey PRIMARY KEY (id);


--
-- Name: answer_model_mappings answer_model_mappings_answer_id_model_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_model_mappings
    ADD CONSTRAINT answer_model_mappings_answer_id_model_id_key UNIQUE (answer_id, model_id);


--
-- Name: answer_model_mappings answer_model_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_model_mappings
    ADD CONSTRAINT answer_model_mappings_pkey PRIMARY KEY (id);


--
-- Name: brand_device_types brand_device_types_brand_id_device_type_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_device_types
    ADD CONSTRAINT brand_device_types_brand_id_device_type_id_unique UNIQUE (brand_id, device_type_id);


--
-- Name: brand_device_types brand_device_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_device_types
    ADD CONSTRAINT brand_device_types_pkey PRIMARY KEY (id);


--
-- Name: brand_group_mappings brand_group_mappings_group_id_brand_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_group_mappings
    ADD CONSTRAINT brand_group_mappings_group_id_brand_id_key UNIQUE (group_id, brand_id);


--
-- Name: brand_group_mappings brand_group_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_group_mappings
    ADD CONSTRAINT brand_group_mappings_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: brands brands_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_unique UNIQUE (slug);


--
-- Name: buyback_requests buyback_requests_order_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buyback_requests
    ADD CONSTRAINT buyback_requests_order_id_key UNIQUE (order_id);


--
-- Name: buyback_requests buyback_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buyback_requests
    ADD CONSTRAINT buyback_requests_pkey PRIMARY KEY (id);


--
-- Name: checkouts checkouts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checkouts
    ADD CONSTRAINT checkouts_pkey PRIMARY KEY (id);


--
-- Name: condition_answers condition_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_answers
    ADD CONSTRAINT condition_answers_pkey PRIMARY KEY (id);


--
-- Name: condition_questions condition_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_questions
    ADD CONSTRAINT condition_questions_pkey PRIMARY KEY (id);


--
-- Name: device_model_variants device_model_variants_model_id_variant_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_model_variants
    ADD CONSTRAINT device_model_variants_model_id_variant_name_key UNIQUE (model_id, variant_name);


--
-- Name: device_model_variants device_model_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_model_variants
    ADD CONSTRAINT device_model_variants_pkey PRIMARY KEY (id);


--
-- Name: device_model_variants device_model_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_model_variants
    ADD CONSTRAINT device_model_variants_sku_key UNIQUE (sku);


--
-- Name: device_models device_models_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_models
    ADD CONSTRAINT device_models_pkey PRIMARY KEY (id);


--
-- Name: device_models device_models_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_models
    ADD CONSTRAINT device_models_slug_unique UNIQUE (slug);


--
-- Name: device_question_mappings device_question_mappings_model_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_question_mappings
    ADD CONSTRAINT device_question_mappings_model_id_question_id_key UNIQUE (model_id, question_id);


--
-- Name: device_question_mappings device_question_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_question_mappings
    ADD CONSTRAINT device_question_mappings_pkey PRIMARY KEY (id);


--
-- Name: device_types device_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_types
    ADD CONSTRAINT device_types_pkey PRIMARY KEY (id);


--
-- Name: device_types device_types_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_types
    ADD CONSTRAINT device_types_slug_unique UNIQUE (slug);


--
-- Name: diagnostic_answers diagnostic_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.diagnostic_answers
    ADD CONSTRAINT diagnostic_answers_pkey PRIMARY KEY (id);


--
-- Name: diagnostic_questions diagnostic_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.diagnostic_questions
    ADD CONSTRAINT diagnostic_questions_pkey PRIMARY KEY (id);


--
-- Name: discounts discounts_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_code_unique UNIQUE (code);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: error_reports error_reports_error_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.error_reports
    ADD CONSTRAINT error_reports_error_id_key UNIQUE (error_id);


--
-- Name: error_reports error_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.error_reports
    ADD CONSTRAINT error_reports_pkey PRIMARY KEY (id);


--
-- Name: feature_toggles feature_toggles_feature_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feature_toggles
    ADD CONSTRAINT feature_toggles_feature_key_key UNIQUE (feature_key);


--
-- Name: feature_toggles feature_toggles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feature_toggles
    ADD CONSTRAINT feature_toggles_pkey PRIMARY KEY (id);


--
-- Name: group_model_mappings group_model_mappings_group_id_model_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_model_mappings
    ADD CONSTRAINT group_model_mappings_group_id_model_id_key UNIQUE (group_id, model_id);


--
-- Name: group_model_mappings group_model_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_model_mappings
    ADD CONSTRAINT group_model_mappings_pkey PRIMARY KEY (id);


--
-- Name: invoice_templates invoice_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_templates
    ADD CONSTRAINT invoice_templates_pkey PRIMARY KEY (id);


--
-- Name: lead_completion_status lead_completion_status_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_completion_status
    ADD CONSTRAINT lead_completion_status_lead_id_key UNIQUE (lead_id);


--
-- Name: lead_completion_status lead_completion_status_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_completion_status
    ADD CONSTRAINT lead_completion_status_pkey PRIMARY KEY (id);


--
-- Name: lead_kyc lead_kyc_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_kyc
    ADD CONSTRAINT lead_kyc_lead_id_key UNIQUE (lead_id);


--
-- Name: lead_kyc lead_kyc_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_kyc
    ADD CONSTRAINT lead_kyc_pkey PRIMARY KEY (id);


--
-- Name: lead_payments lead_payments_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_payments
    ADD CONSTRAINT lead_payments_lead_id_key UNIQUE (lead_id);


--
-- Name: lead_payments lead_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_payments
    ADD CONSTRAINT lead_payments_pkey PRIMARY KEY (id);


--
-- Name: lead_photos lead_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lead_photos
    ADD CONSTRAINT lead_photos_pkey PRIMARY KEY (id);


--
-- Name: model_pricing model_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_pkey PRIMARY KEY (id);


--
-- Name: model_question_mappings model_question_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_mappings
    ADD CONSTRAINT model_question_mappings_pkey PRIMARY KEY (id);


--
-- Name: model_question_modes model_question_modes_model_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_modes
    ADD CONSTRAINT model_question_modes_model_id_key UNIQUE (model_id);


--
-- Name: model_question_modes model_question_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_modes
    ADD CONSTRAINT model_question_modes_pkey PRIMARY KEY (id);


--
-- Name: model_question_mappings model_question_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_mappings
    ADD CONSTRAINT model_question_unique UNIQUE (model_id, question_id);


--
-- Name: partner_staff partner_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partner_staff
    ADD CONSTRAINT partner_staff_pkey PRIMARY KEY (id);


--
-- Name: partners partners_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_email_key UNIQUE (email);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: partners partners_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_tenant_id_key UNIQUE (tenant_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pricing_tiers pricing_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pricing_tiers
    ADD CONSTRAINT pricing_tiers_pkey PRIMARY KEY (id);


--
-- Name: product_question_mappings product_question_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_question_mappings
    ADD CONSTRAINT product_question_mappings_pkey PRIMARY KEY (id);


--
-- Name: product_question_mappings product_question_mappings_product_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_question_mappings
    ADD CONSTRAINT product_question_mappings_product_id_question_id_key UNIQUE (product_id, question_id);


--
-- Name: question_groups question_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_groups
    ADD CONSTRAINT question_groups_pkey PRIMARY KEY (id);


--
-- Name: question_model_mappings question_model_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_model_mappings
    ADD CONSTRAINT question_model_mappings_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: regions regions_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_code_key UNIQUE (code);


--
-- Name: regions regions_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_name_key UNIQUE (name);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: route_rules route_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.route_rules
    ADD CONSTRAINT route_rules_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: store_templates store_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_templates
    ADD CONSTRAINT store_templates_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_unique UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_date_time_slot_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_date_time_slot_key UNIQUE (date, time_slot);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: admin_configurations unique_config_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_configurations
    ADD CONSTRAINT unique_config_key UNIQUE (config_key);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: valuations valuations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.valuations
    ADD CONSTRAINT valuations_pkey PRIMARY KEY (id);


--
-- Name: variant_pricing variant_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_pricing
    ADD CONSTRAINT variant_pricing_pkey PRIMARY KEY (id);


--
-- Name: variant_question_mappings variant_question_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_question_mappings
    ADD CONSTRAINT variant_question_mappings_pkey PRIMARY KEY (id);


--
-- Name: variant_question_mappings variant_question_mappings_variant_id_group_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_question_mappings
    ADD CONSTRAINT variant_question_mappings_variant_id_group_id_key UNIQUE (variant_id, group_id);


--
-- Name: working_hours working_hours_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_day_of_week_key UNIQUE (day_of_week);


--
-- Name: working_hours working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_pkey PRIMARY KEY (id);


--
-- Name: idx_answer_choices_question_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_answer_choices_question_id ON public.answer_choices USING btree (question_id);


--
-- Name: idx_device_question_mappings_model; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_device_question_mappings_model ON public.device_question_mappings USING btree (model_id);


--
-- Name: idx_device_question_mappings_question; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_device_question_mappings_question ON public.device_question_mappings USING btree (question_id);


--
-- Name: idx_error_reports_resolved; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_error_reports_resolved ON public.error_reports USING btree (resolved);


--
-- Name: idx_error_reports_timestamp; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_error_reports_timestamp ON public.error_reports USING btree ("timestamp");


--
-- Name: idx_error_reports_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_error_reports_type ON public.error_reports USING btree (type);


--
-- Name: idx_lead_completion_lead_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_lead_completion_lead_id ON public.lead_completion_status USING btree (lead_id);


--
-- Name: idx_lead_kyc_lead_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_lead_kyc_lead_id ON public.lead_kyc USING btree (lead_id);


--
-- Name: idx_lead_payments_lead_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_lead_payments_lead_id ON public.lead_payments USING btree (lead_id);


--
-- Name: idx_lead_photos_lead_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_lead_photos_lead_id ON public.lead_photos USING btree (lead_id);


--
-- Name: idx_model_question_mappings_group_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_model_question_mappings_group_id ON public.model_question_mappings USING btree (question_group_id);


--
-- Name: idx_model_question_mappings_model_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_model_question_mappings_model_id ON public.model_question_mappings USING btree (model_id);


--
-- Name: idx_model_question_mappings_question_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_model_question_mappings_question_id ON public.model_question_mappings USING btree (question_id);


--
-- Name: idx_product_question_mappings_product; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_product_question_mappings_product ON public.product_question_mappings USING btree (product_id);


--
-- Name: idx_product_question_mappings_question; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_product_question_mappings_question ON public.product_question_mappings USING btree (question_id);


--
-- Name: idx_questions_group_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_questions_group_id ON public.questions USING btree (group_id);


--
-- Name: idx_user_feedback_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_user_feedback_created_at ON public.user_feedback USING btree (created_at);


--
-- Name: idx_user_feedback_resolved; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_user_feedback_resolved ON public.user_feedback USING btree (resolved);


--
-- Name: idx_user_feedback_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_user_feedback_type ON public.user_feedback USING btree (type);


--
-- Name: answer_choices answer_choices_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_choices
    ADD CONSTRAINT answer_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: answer_model_mappings answer_model_mappings_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_model_mappings
    ADD CONSTRAINT answer_model_mappings_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answer_choices(id);


--
-- Name: answer_model_mappings answer_model_mappings_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.answer_model_mappings
    ADD CONSTRAINT answer_model_mappings_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id);


--
-- Name: brand_device_types brand_device_types_brand_id_brands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_device_types
    ADD CONSTRAINT brand_device_types_brand_id_brands_id_fk FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: brand_device_types brand_device_types_device_type_id_device_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_device_types
    ADD CONSTRAINT brand_device_types_device_type_id_device_types_id_fk FOREIGN KEY (device_type_id) REFERENCES public.device_types(id);


--
-- Name: brand_group_mappings brand_group_mappings_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_group_mappings
    ADD CONSTRAINT brand_group_mappings_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: brand_group_mappings brand_group_mappings_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brand_group_mappings
    ADD CONSTRAINT brand_group_mappings_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.question_groups(id);


--
-- Name: buyback_requests buyback_requests_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buyback_requests
    ADD CONSTRAINT buyback_requests_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- Name: checkouts checkouts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checkouts
    ADD CONSTRAINT checkouts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: condition_answers condition_answers_question_id_condition_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_answers
    ADD CONSTRAINT condition_answers_question_id_condition_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.condition_questions(id);


--
-- Name: condition_questions condition_questions_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_questions
    ADD CONSTRAINT condition_questions_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: condition_questions condition_questions_device_type_id_device_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.condition_questions
    ADD CONSTRAINT condition_questions_device_type_id_device_types_id_fk FOREIGN KEY (device_type_id) REFERENCES public.device_types(id);


--
-- Name: device_model_variants device_model_variants_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_model_variants
    ADD CONSTRAINT device_model_variants_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id);


--
-- Name: device_models device_models_brand_id_brands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_models
    ADD CONSTRAINT device_models_brand_id_brands_id_fk FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: device_models device_models_device_type_id_device_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_models
    ADD CONSTRAINT device_models_device_type_id_device_types_id_fk FOREIGN KEY (device_type_id) REFERENCES public.device_types(id);


--
-- Name: device_question_mappings device_question_mappings_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_question_mappings
    ADD CONSTRAINT device_question_mappings_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id) ON DELETE CASCADE;


--
-- Name: device_question_mappings device_question_mappings_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_question_mappings
    ADD CONSTRAINT device_question_mappings_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: diagnostic_answers diagnostic_answers_question_id_diagnostic_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.diagnostic_answers
    ADD CONSTRAINT diagnostic_answers_question_id_diagnostic_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.diagnostic_questions(id);


--
-- Name: diagnostic_questions diagnostic_questions_device_type_id_device_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.diagnostic_questions
    ADD CONSTRAINT diagnostic_questions_device_type_id_device_types_id_fk FOREIGN KEY (device_type_id) REFERENCES public.device_types(id);


--
-- Name: feature_toggles feature_toggles_last_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feature_toggles
    ADD CONSTRAINT feature_toggles_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES public.users(id);


--
-- Name: group_model_mappings group_model_mappings_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_model_mappings
    ADD CONSTRAINT group_model_mappings_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.question_groups(id);


--
-- Name: group_model_mappings group_model_mappings_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_model_mappings
    ADD CONSTRAINT group_model_mappings_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id);


--
-- Name: invoice_templates invoice_templates_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_templates
    ADD CONSTRAINT invoice_templates_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: model_pricing model_pricing_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id) ON DELETE CASCADE;


--
-- Name: model_pricing model_pricing_pricing_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_pricing
    ADD CONSTRAINT model_pricing_pricing_tier_id_fkey FOREIGN KEY (pricing_tier_id) REFERENCES public.pricing_tiers(id);


--
-- Name: model_question_mappings model_question_mappings_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_mappings
    ADD CONSTRAINT model_question_mappings_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id) ON DELETE CASCADE;


--
-- Name: model_question_mappings model_question_mappings_question_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_mappings
    ADD CONSTRAINT model_question_mappings_question_group_id_fkey FOREIGN KEY (question_group_id) REFERENCES public.question_groups(id) ON DELETE CASCADE;


--
-- Name: model_question_mappings model_question_mappings_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_mappings
    ADD CONSTRAINT model_question_mappings_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: model_question_modes model_question_modes_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_question_modes
    ADD CONSTRAINT model_question_modes_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id) ON DELETE CASCADE;


--
-- Name: partner_staff partner_staff_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partner_staff
    ADD CONSTRAINT partner_staff_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: partner_staff partner_staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partner_staff
    ADD CONSTRAINT partner_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payments payments_checkout_id_checkouts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_checkout_id_checkouts_id_fk FOREIGN KEY (checkout_id) REFERENCES public.checkouts(id);


--
-- Name: product_question_mappings product_question_mappings_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_question_mappings
    ADD CONSTRAINT product_question_mappings_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.device_models(id) ON DELETE CASCADE;


--
-- Name: product_question_mappings product_question_mappings_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_question_mappings
    ADD CONSTRAINT product_question_mappings_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: question_groups question_groups_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_groups
    ADD CONSTRAINT question_groups_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_types(id);


--
-- Name: question_model_mappings question_model_mappings_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_model_mappings
    ADD CONSTRAINT question_model_mappings_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.device_models(id) ON DELETE CASCADE;


--
-- Name: question_model_mappings question_model_mappings_question_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_model_mappings
    ADD CONSTRAINT question_model_mappings_question_group_id_fkey FOREIGN KEY (question_group_id) REFERENCES public.question_groups(id) ON DELETE CASCADE;


--
-- Name: questions questions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.question_groups(id) ON DELETE CASCADE;


--
-- Name: questions questions_question_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_question_group_id_fkey FOREIGN KEY (question_group_id) REFERENCES public.question_groups(id);


--
-- Name: route_rules route_rules_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.route_rules
    ADD CONSTRAINT route_rules_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: route_rules route_rules_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.route_rules
    ADD CONSTRAINT route_rules_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: users users_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: users users_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: valuations valuations_device_model_id_device_models_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.valuations
    ADD CONSTRAINT valuations_device_model_id_device_models_id_fk FOREIGN KEY (device_model_id) REFERENCES public.device_models(id);


--
-- Name: variant_pricing variant_pricing_pricing_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_pricing
    ADD CONSTRAINT variant_pricing_pricing_tier_id_fkey FOREIGN KEY (pricing_tier_id) REFERENCES public.pricing_tiers(id);


--
-- Name: variant_pricing variant_pricing_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_pricing
    ADD CONSTRAINT variant_pricing_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.device_model_variants(id) ON DELETE CASCADE;


--
-- Name: variant_question_mappings variant_question_mappings_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_question_mappings
    ADD CONSTRAINT variant_question_mappings_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.question_groups(id) ON DELETE CASCADE;


--
-- Name: variant_question_mappings variant_question_mappings_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.variant_question_mappings
    ADD CONSTRAINT variant_question_mappings_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.device_model_variants(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

