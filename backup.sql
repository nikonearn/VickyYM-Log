--
-- PostgreSQL database dump
--

\restrict x9TakzbvCeOBmW9H7eYuDp8YBIcV91qrQR7DhwaaRojBggwtgWajcIGfgwLziWz

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    color text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: deposits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deposits (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    reference text NOT NULL,
    gateway text DEFAULT 'paystack'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.deposits OWNER TO postgres;

--
-- Name: deposits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deposits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deposits_id_seq OWNER TO postgres;

--
-- Name: deposits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deposits_id_seq OWNED BY public.deposits.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    product_name text NOT NULL,
    product_price numeric(12,2) NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    delivered_logs text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    original_price numeric(12,2),
    quality text DEFAULT 'fresh'::text NOT NULL,
    stock_logs text,
    stock_count integer DEFAULT 0 NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    preview_info text,
    image_url text,
    total_sold integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    token text NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    site_name text DEFAULT 'AcctMarket'::text NOT NULL,
    site_tagline text DEFAULT 'Premium Social Media Accounts'::text NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    currency_symbol text DEFAULT '₦'::text NOT NULL,
    logo_url text,
    favicon_url text,
    paystack_public_key text DEFAULT ''::text NOT NULL,
    paystack_secret_key text DEFAULT ''::text NOT NULL,
    about_text text,
    faq_text text,
    terms_text text,
    contact_email text,
    maintenance_mode boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_messages (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    is_admin text DEFAULT 'false'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_messages OWNER TO postgres;

--
-- Name: ticket_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_messages_id_seq OWNER TO postgres;

--
-- Name: ticket_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_messages_id_seq OWNED BY public.ticket_messages.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    subject text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO postgres;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    balance_before numeric(12,2) NOT NULL,
    balance_after numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    avatar text,
    bio text,
    balance numeric(12,2) DEFAULT 0.00 NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    is_banned boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: deposits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits ALTER COLUMN id SET DEFAULT nextval('public.deposits_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: ticket_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages ALTER COLUMN id SET DEFAULT nextval('public.ticket_messages_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, icon, color, is_active, created_at, updated_at) FROM stdin;
1	Instagram Logs	instagram-logs	Fresh and aged Instagram account credentials	Instagram	#E1306C	t	2026-04-07 13:14:41.39353+00	2026-04-07 13:14:41.39353+00
2	Facebook Logs	facebook-logs	Facebook account logs with full access	Facebook	#1877F2	t	2026-04-07 13:14:41.39353+00	2026-04-07 13:14:41.39353+00
3	Gmail PVA	gmail-pva	Phone-verified Gmail accounts	Mail	#EA4335	t	2026-04-07 13:14:41.39353+00	2026-04-07 13:14:41.39353+00
4	Twitter / X Logs	twitter-x-logs	Twitter/X verified account credentials	Twitter	#1DA1F2	t	2026-04-07 13:14:41.39353+00	2026-04-07 13:14:41.39353+00
5	TikTok Logs	tiktok-logs	TikTok account logs with followers	Music2	#69C9D0	t	2026-04-07 13:14:41.39353+00	2026-04-07 13:14:41.39353+00
6	Snapchat Logs	snapchat-logs	Snapchat account credentials	Camera	#FFFC00	t	2026-04-07 13:14:41.39353+00	2026-04-07 13:14:41.39353+00
\.


--
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deposits (id, user_id, amount, reference, gateway, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, product_id, product_name, product_price, status, delivered_logs, created_at, updated_at) FROM stdin;
1	1	1	Instagram Fresh Accounts x10	2500.00	completed	instauser1@gmail.com:Pass123!	2026-04-07 13:27:51.056589+00	2026-04-07 13:27:51.056589+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, category_id, name, slug, description, price, original_price, quality, stock_logs, stock_count, is_available, is_featured, preview_info, image_url, total_sold, created_at, updated_at) FROM stdin;
2	1	Instagram Aged 1-Year Verified	instagram-aged-1yr	Aged 1+ year Instagram accounts with phone verification. High trust score. Ready for business use.	5000.00	7000.00	aged	ageduser1@gmail.com:AgedIG@1\n  ageduser2@gmail.com:Aged#Pass2\n  ageduser3@gmail.com:VeryOld@Acc3	3	t	t	Format: email:password | 1+ year | Phone verified	\N	23	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
3	1	Instagram Premium Verified Business	instagram-premium-biz	Premium Instagram business accounts with 500+ followers. Phone verified with 2FA backup codes included.	12000.00	15000.00	premium	bizaccount1:BizPass@1\n  bizaccount2:BizPass@2	2	t	t	Includes 2FA backup codes | 500+ followers | Business profile	\N	8	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
4	2	Facebook Personal Accounts x5	facebook-personal-x5	Real Facebook personal accounts with friends and activity history. Includes email and password access.	3500.00	5000.00	fresh	fbuser1@gmail.com:FbP@ss1\n  fbuser2@gmail.com:FbP@ss2\n  fbuser3@gmail.com:FbP@ss3	3	t	t	Format: email:password | With friend history	\N	31	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
5	2	Facebook Aged 2FA Accounts	facebook-aged-2fa	Facebook accounts aged 2+ years with 2FA enabled. Comes with email recovery access.	7500.00	\N	aged	fbaged1@gmail.com:FbAgedP@ss1\n  fbaged2@gmail.com:FbAgedP@ss2	2	t	t	Format: email:password:2fa_code | 2+ year aged	\N	12	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
6	3	Gmail PVA Accounts x20	gmail-pva-x20	Phone-verified Gmail accounts. Each account comes with full access details. Never used for spam.	4000.00	6000.00	verified	gmailpva1@gmail.com:GmailP@ss1\n  gmailpva2@gmail.com:GmailP@ss2\n  gmailpva3@gmail.com:GmailP@ss3\n  gmailpva4@gmail.com:GmailP@ss4\n  gmailpva5@gmail.com:GmailP@ss5	5	t	t	Format: email:password | Phone verified | Fresh	\N	67	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
7	4	Twitter X Verified Accounts	twitter-x-verified	Twitter/X accounts with blue checkmark verification (legacy). Aged accounts with tweet history.	15000.00	\N	premium	twitterblue1:TwP@ss1\n  twitterblue2:TwP@ss2	2	t	f	Includes email recovery | Blue checkmark | 1000+ tweets	\N	5	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
8	5	TikTok Creator Accounts 10k+	tiktok-creator-10k	TikTok accounts with 10,000+ followers. Includes full login credentials and email access.	8500.00	10000.00	aged	tiktokstar1@gmail.com:TikP@ss1\n  tiktokstar2@gmail.com:TikP@ss2	2	t	t	Format: email:password | 10k+ followers | Creator badge	\N	19	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
9	6	Snapchat Streaks Accounts	snapchat-streaks	Snapchat accounts with long streaks and friends. Ready to use with email and password access.	2000.00	2500.00	fresh	snapuser1@gmail.com:SnapP@ss1\n  snapuser2@gmail.com:SnapP@ss2\n  snapuser3@gmail.com:SnapP@ss3	3	t	f	Format: email:password | 100+ day streaks | Friends included	\N	28	2026-04-07 13:15:15.215333+00	2026-04-07 13:15:15.215333+00
1	1	Instagram Fresh Accounts x10	instagram-fresh-x10	Fresh Instagram accounts, registered within the last 30 days. Includes email:password combo. Great for bulk automation.	2500.00	3500.00	fresh	  instauser2@gmail.com:SecureP@ss2\n  instauser3@gmail.com:Ig#Pass3\n  instauser4@gmail.com:MyIg@Pass4\n  instauser5@gmail.com:FreshAcc5!	4	t	t	Format: email:password | 30-day aged | USA region	\N	46	2026-04-07 13:15:15.215333+00	2026-04-07 13:27:51.043+00
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (token, user_id, expires_at, created_at) FROM stdin;
3420154093f735a11a68689d7c316a73624ac4e76b823335407c1a7b9027330d	1	2026-06-10 00:18:24.304+00	2026-05-11 00:18:24.305792+00
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, site_name, site_tagline, currency, currency_symbol, logo_url, favicon_url, paystack_public_key, paystack_secret_key, about_text, faq_text, terms_text, contact_email, maintenance_mode, updated_at) FROM stdin;
1	VickyYM Log Store	Your #1 Source for Premium Social Media Accounts	NGN	₦	https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png		rud5y7dfguoo		AcctMarket is the leading marketplace for premium social media account credentials. We specialize in providing fresh, aged, and verified accounts for Instagram, Facebook, Gmail, Twitter/X, TikTok, and Snapchat.	Q: How does delivery work?\nA: After purchase, your account logs are instantly delivered to your order page.\n\nQ: What is your refund policy?\nA: All sales are final. Please ensure you have sufficient balance before purchasing.	By using AcctMarket, you agree to our terms of service. These accounts are sold for educational and research purposes only.	support@acctmarket.com	f	2026-05-08 07:25:42.28+00
\.


--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_messages (id, ticket_id, user_id, message, is_admin, created_at) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, user_id, subject, status, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, type, amount, description, balance_before, balance_after, created_at) FROM stdin;
1	1	purchase	2500.00	Purchased: Instagram Fresh Accounts x10	5000.00	2500.00	2026-04-07 13:27:51.048563+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, full_name, avatar, bio, balance, is_admin, is_banned, created_at, updated_at) FROM stdin;
2	testuser	test@acctmarket.com	93dbf03fba2bfb2f7cd53d7bd3e1d680:811aaed6c2eab80ef53853acfa52c290f0a922d3d0a0928931fa1c799467bb60e9e1181ac9ab99efe393cf8820156d996a8fb5b2b5ee4199d093d5e481a434de	Test User	\N	\N	1500.00	f	f	2026-04-07 13:14:37.49894+00	2026-04-07 13:14:37.49894+00
1	admin	admin@acctmarket.com	77db59e69831dfa95d7c5c22495efad7:aebe4091987cde4bb6c27753d43c26e38c93aa1ae583ea8329042811ae5bba7ec6cc49c036d978921bea173917f7551402a3238e865490a19d47a4411ef5f45d	Admin User	\N	\N	2500.00	t	f	2026-04-07 13:14:37.49894+00	2026-04-07 13:27:50.801+00
3	Fredolawale	erinfolamiqoyyum16@gmail.com	cf373c84f1abd4edd4276bf6fbea0348:b51376c634c69034ad653311ce7b6d634998fbea62b58b48e07c7e2d76fb22b401f0a6a0687df5d8df951f4c3574a543fc5cc4b432a004cdadfc97ed9d9257bd	Fred Olawale	\N	\N	0.00	f	f	2026-04-07 14:56:18.24743+00	2026-04-07 14:56:18.24743+00
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: deposits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deposits_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, true);


--
-- Name: ticket_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_messages_id_seq', 1, false);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: deposits deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_pkey PRIMARY KEY (id);


--
-- Name: deposits deposits_reference_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_reference_unique UNIQUE (reference);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: deposits deposits_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: orders orders_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ticket_messages ticket_messages_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_messages ticket_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tickets tickets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict x9TakzbvCeOBmW9H7eYuDp8YBIcV91qrQR7DhwaaRojBggwtgWajcIGfgwLziWz

