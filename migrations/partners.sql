--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-01-05 19:01:10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16604)
-- Name: partners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_name character varying(255),
    user_name character varying(255),
    phone_number character varying(255),
    address character varying(255),
    fixed_price numeric,
    fixed_price_description character varying,
    manager_message text
);


ALTER TABLE public.partners OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16603)
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partners_id_seq OWNER TO postgres;

--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 219
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- TOC entry 4676 (class 2604 OID 16607)
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- TOC entry 4826 (class 0 OID 16604)
-- Dependencies: 220
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, name, created_at, company_name, user_name, phone_number, address, fixed_price, fixed_price_description, manager_message) FROM stdin;
3	Nuovo Partner	2025-01-01 21:40:53.223822	\N	\N	\N	\N	\N	\N	\N
4	Partner Senza Token	2025-01-01 21:47:07.149109	\N	\N	\N	\N	\N	\N	\N
7	PartnerDemo	2025-01-02 20:50:42.597324	\N	\N	\N	\N	\N	\N	\N
5	Partner Non Manager	2025-01-01 21:52:14.140042	\N	\N	\N	\N	\N	\N	\N
8	prova	2025-01-03 15:09:18.705587	\N	\N	\N	torino	12	un buon prezzo	\N
13	1	2025-01-03 21:58:02.034906	1	1	1	1	\N	\N	\N
12	partner	2025-01-03 21:56:01.692265	Partner	partner	1234	torino	\N	\N	\N
15	3	2025-01-04 16:34:42.591097	3	3	3	3	\N	\N	\N
17	6	2025-01-04 17:43:59.791561	6	6	6	6111111111111	11111111111	111111111	234214214
18	8	2025-01-04 18:22:28.568733	8	8	8	8	\N	\N	\N
16	4	2025-01-04 17:18:13.912176	4	4	4	4	1	1	ciao444
14	2	2025-01-04 13:52:57.713624	2	2	2	2	4	4	1234333
19	12	2025-01-05 10:29:38.786546	12	12	12	12	12	12	32
20	partner@example.com	2025-01-05 11:36:41.002328	partner@example.com	partner@example.com	partner@example.com	partner@example.com	\N	\N	1234
\.


--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 219
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partners_id_seq', 20, true);


--
-- TOC entry 4679 (class 2606 OID 16612)
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


-- Completed on 2025-01-05 19:01:12

--
-- PostgreSQL database dump complete
--

