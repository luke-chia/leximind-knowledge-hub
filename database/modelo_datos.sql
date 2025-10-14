
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------
-- Tabla para la gestión de documentos
-- -----------------------------------------------
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT NOT NULL,
    alias TEXT,
    user_id UUID NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    storage_path TEXT NOT NULL,
    signed_url TEXT,
    signed_url_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by_doc FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_doc FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);

COMMENT ON TABLE documents IS 'Metadata for uploaded documents stored in Supabase Storage';
COMMENT ON COLUMN documents.original_name IS 'Original file name as uploaded';
COMMENT ON COLUMN documents.alias IS 'Short or friendly alias for the document';
COMMENT ON COLUMN documents.user_id IS 'Reference to the user who uploaded the document';
COMMENT ON COLUMN documents.uploaded_at IS 'Timestamp when the document was uploaded';
COMMENT ON COLUMN documents.storage_path IS 'Supabase storage path';
COMMENT ON COLUMN documents.signed_url IS 'Temporary signed URL for accessing the document';
COMMENT ON COLUMN documents.signed_url_expires_at IS 'Expiration timestamp for the signed URL';

ALTER TABLE public.documents
  ADD COLUMN file_size numeric NOT NULL DEFAULT 0 CHECK (file_size >= 0);

COMMENT ON COLUMN documents.file_size IS 'Tamaño del Documento en Bytes';

ALTER TABLE public.documents
  ADD COLUMN content_type varchar(255);

COMMENT ON COLUMN documents.content_type IS 'Tipo de Contenido del Documento';

ALTER TABLE public.documents ADD COLUMN description text;
UPDATE public.documents SET description = '' WHERE description IS NULL; ALTER TABLE public.documents
ALTER COLUMN description SET NOT NULL;

ALTER TABLE public.documents ADD COLUMN "URL_Reference" text;


-- -----------------------------------------------
-- Tabla para áreas o departamentos funcionales
-- -----------------------------------------------
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_created_by_area FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_area FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

COMMENT ON TABLE areas IS 'Catalog of functional areas';
COMMENT ON COLUMN areas.name IS 'Area name';

-- -----------------------------------------------
-- Tabla para categorias de documentos
-- -----------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_created_by_cat FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_cat FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

COMMENT ON TABLE categories IS 'Catalog of document categories';
COMMENT ON COLUMN categories.name IS 'Category name';

-- -----------------------------------------------
-- Tabla para fuentes o sources de los documentos
-- -----------------------------------------------
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_created_by_source FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_source FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

COMMENT ON TABLE sources IS 'Catalog of document sources';
COMMENT ON COLUMN sources.name IS 'Source name';

-- -----------------------------------------------
-- Tabla para tags o etiquetas de los documentos
-- -----------------------------------------------
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_created_by_tag FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_tag FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

COMMENT ON TABLE tags IS 'Catalog of tags for documents';
COMMENT ON COLUMN tags.name IS 'Tag name';

-- -----------------------------------------------------------------------------
-- Tabla para indicar las relaciones muchos a muchos entre documentos y áreas
-- -----------------------------------------------------------------------------
CREATE TABLE document_areas (
    document_id UUID NOT NULL,
    area_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (document_id, area_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by_doc_area FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_doc_area FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_document_document_id ON document_areas(document_id);
CREATE INDEX idx_document_area ON document_areas(document_id, area_id);

COMMENT ON TABLE document_areas IS 'Join table: documents ↔ areas';

-- --------------------------------------------------------------------------------
-- Tabla para indicar las relaciones muchos a muchos entre documentos y categorías
-- --------------------------------------------------------------------------------
CREATE TABLE document_categories (
    document_id UUID NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (document_id, category_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by_doc_cat FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_doc_cat FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_document_document_id ON document_categories(document_id);
CREATE INDEX idx_document_category ON document_categories(document_id, category_id);

COMMENT ON TABLE document_categories IS 'Join table: documents ↔ categories';

-- --------------------------------------------------------------------------------
-- Tabla para indicar las relaciones muchos a muchos entre documentos y fuentes
-- --------------------------------------------------------------------------------
CREATE TABLE document_sources (
    document_id UUID NOT NULL,
    source_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (document_id, source_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by_doc_source FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_doc_source FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_document_document_id ON document_sources(document_id);
CREATE INDEX idx_document_source ON document_sources(document_id, source_id);

COMMENT ON TABLE document_sources IS 'Join table: documents ↔ sources';

-- --------------------------------------------------------------------------------
-- Tabla para indicar las relaciones muchos a muchos entre documentos y tags
-- --------------------------------------------------------------------------------
CREATE TABLE document_tags (
    document_id UUID NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (document_id, tag_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by_doc_tag FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_doc_tag FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_document_tag ON document_tags(document_id, tag_id);

COMMENT ON TABLE document_tags IS 'Join table: documents ↔ tags';

-- --------------------------------------------------------------------------------
-- Tabla para perfiles de usuario extendidos (Extiende a auth.users)
-- --------------------------------------------------------------------------------

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  nickname text,
  rol text,
  status text,
  img_url text,
  created_at timestamp with time zone default now()
);

-- --------------------------------------------------------------------------------
-- Tabla para conversaciones de usuario (Chats con el LLM)
-- --------------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz default now()
);

CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);

-- --------------------------------------------------------------------------------
-- Tabla para mensajes dentro de una conversación (Preguntas y respuestas del LLM)
-- --------------------------------------------------------------------------------

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,                    -- pregunta o respuesta LLM
  tokens int,                               -- opcional: conteo
  created_at timestamptz default now()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);

-- --------------------------------------------------------------------------------
-- Tabla para opiniones de expertos sobre mensajes específicos
-- --------------------------------------------------------------------------------

create table public.expert_opinions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  expert_user_id uuid not null references auth.users(id) on delete restrict,
  opinion text not null,                    -- la opinión redactada
  document_url TEXT
);

ALTER TABLE public.expert_opinions
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

create index if not exists expert_opinions_id_idx1 on public.expert_opinions(message_id);
create index if not exists expert_opinions_id_idx2 on public.expert_opinions(expert_user_id);
-- ------------------------------------------------------------------------------------------

-- ==========================================================================================
-- Policies de seguridad a nivel de fila (RLS)
-- ==========================================================================================

-- ==============================================
-- Enable RLS on all tables
-- ==============================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;


-- ============================x==================
-- GRANTS
-- ==============================================

-- Catalog tables (read + insert only)
GRANT SELECT, INSERT ON areas TO authenticated;
GRANT SELECT, INSERT ON categories TO authenticated;
GRANT SELECT, INSERT ON sources TO authenticated;
GRANT SELECT, INSERT ON tags TO authenticated;

-- Metadata tables (full privileges, filtered by RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_areas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_sources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_tags TO authenticated;

-- ==============================================
-- POLICIES FOR CATALOGS
-- ==============================================

-- areas
CREATE POLICY "Allow authenticated to read areas"
ON areas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to insert areas"
ON areas FOR INSERT TO authenticated WITH CHECK (true);

-- categories
CREATE POLICY "Allow authenticated to read categories"
ON categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to insert categories"
ON categories FOR INSERT TO authenticated WITH CHECK (true);

-- sources
CREATE POLICY "Allow authenticated to read sources"
ON sources FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to insert sources"
ON sources FOR INSERT TO authenticated WITH CHECK (true);

-- tags
CREATE POLICY "Allow authenticated to read tags"
ON tags FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to insert tags"
ON tags FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================
-- POLICIES FOR DOCUMENTS
-- ==============================================

-- SELECT: any authenticated user can read all
CREATE POLICY "Allow authenticated to read documents"
ON documents FOR SELECT TO authenticated USING (true);

-- INSERT: must insert with their own user_id
CREATE POLICY "Users can insert their own documents"
ON documents FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: only owner can update
CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: only owner can delete
CREATE POLICY "Users can delete their own documents"
ON documents FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ==============================================
-- POLICIES FOR RELATION TABLES
-- ==============================================

-- document_areas
CREATE POLICY "Allow authenticated to read document_areas"
ON document_areas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own document_areas"
ON document_areas FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_areas.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can update their own document_areas"
ON document_areas FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_areas.document_id AND d.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_areas.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can delete their own document_areas"
ON document_areas FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_areas.document_id AND d.user_id = auth.uid())
);

-- document_categories
CREATE POLICY "Allow authenticated to read document_categories"
ON document_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own document_categories"
ON document_categories FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_categories.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can update their own document_categories"
ON document_categories FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_categories.document_id AND d.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_categories.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can delete their own document_categories"
ON document_categories FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_categories.document_id AND d.user_id = auth.uid())
);

-- document_sources
CREATE POLICY "Allow authenticated to read document_sources"
ON document_sources FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own document_sources"
ON document_sources FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_sources.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can update their own document_sources"
ON document_sources FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_sources.document_id AND d.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_sources.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can delete their own document_sources"
ON document_sources FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_sources.document_id AND d.user_id = auth.uid())
);

-- document_tags
CREATE POLICY "Allow authenticated to read document_tags"
ON document_tags FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own document_tags"
ON document_tags FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can update their own document_tags"
ON document_tags FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
);

CREATE POLICY "Users can delete their own document_tags"
ON document_tags FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
);

-- ------------------------------------------------------------------------------------------
-- Tabla de perfiles de usuarios extendidos
-- ------------------------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Permitir que los usuarios autenticados vean su propio perfil
create policy "Allow user to manage own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- ------------------------------------------------------------------------------------------
-- Tabla de perfiles de conversaciones
-- ------------------------------------------------------------------------------------------
alter table public.conversations enable row level security;

-- Permitir que los usuarios autenticados vean sus propias conversaciones
create policy "Authenticated users can view theirs Conversations"
  on public.conversations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Permitir que los usuarios autenticados creen conversaciones
create policy "Authenticated users can create conversations"
  on public.conversations
  for insert
  to authenticated
  with check (auth.uid() = user_id);


-- ------------------------------------------------------------------------------------------
-- Tabla de perfiles de mensajes
-- ------------------------------------------------------------------------------------------

alter table public.messages enable row level security;

-- Permitir que los usuarios autenticados vean mensajes
create policy "Authenticated users can view theirs Messages"
  on public.messages
  for select
  to authenticated
  using (true);

-- Permitir que los usuarios autenticados creen mensajes
create policy "Authenticated users can create Messages"
  on public.messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);
-- ----------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------------------
-- Tabla de opiniones de expertos
-- ------------------------------------------------------------------------------------------

alter table public.expert_opinions enable row level security;

-- Permitir que los usuarios autenticados vean opiniones
create policy "Authenticated users can view Opinions"
  on public.expert_opinions
  for select
  to authenticated
  using (true);

-- Permitir que los usuarios autenticados creen opiniones
create policy "Authenticated users can create Messages"
  on public.expert_opinions
  for insert
  to authenticated
  with check (auth.uid() = expert_user_id);

-- ----------------------------------------------------------------------------------
-- ==========================================================================================
-- File: Scripts_Poblado_Catalogos_Extendida.sql
-- Description: Extended catalog population data for LexiMind project (Supabase + Postgres)
-- ==========================================================================================

-- ===================== AREAS =====================
INSERT INTO areas (name) VALUES
('Innovation_Technology'),
('Cybersecurity'),
('Loans'),
('Credit_Cards'),
('Deposits_Investments'),
('Fraud_Prevention'),
('Compliance_AML'),
('Internal_Audit'),
('Treasury'),
('Legal'),
('Human_Resources'),
('Customer_Service'),
('Risk_and_Internal_Control'),
('Digital_Banking'),
('Retail_Banking'),
('Corporate_Banking'),
('Private_Banking'),
('Wealth_Management');

-- ===================== CATEGORIES =====================
INSERT INTO categories (name) VALUES
('Technical'),
('Normative'),
('Operational'),
('Internal_Policies'),
('Procedures'),
('User_Manuals'),
('Quick_Guides'),
('Presentations'),
('Contracts_and_Agreements'),
('Risk_Models'),
('Training_Materials');

-- ===================== SOURCES =====================
INSERT INTO sources (name) VALUES
('CNBV'),
('Banco_de_México'),
('CONDUSEF'),
('SAT'),
('IFRS9'),
('Basel'),
('Internal_Manual'),
('Supplier_Manual'),
('Risk_Committee'),
('External_Audit'),
('Internal_Audit'),
('Legal_Department'),
('SHCP'),
('PCI_DSS'),
('Open_Banking_Standard');

INSERT INTO sources (name) VALUES
('Credit_Bureau');


-- ===================== TAGS =====================
INSERT INTO tags (name) VALUES
('Software_Development'),
('SPEI'),
('QA'),
('Onboarding'),
('SME Loans'),
('Classic_Credit_Cards'),
('BNPL Credit Cards'),
('Digital Wallets'),
('AML_PLD'),
('KYC'),
('Phishing_Awareness'),
('Banking_APIs'),
('Core_Banking'),
('Migrations'),
('Cloud Computing'),
('Data_Lake'),
('Best_Practices'),
('FAQ'),
('Open_Banking'),
('Fintech'),
('Digital_Identity');
-- ----------------------------------------------------------------------------------

