-- ==========================================================================================
-- File: inicializacion_tablas.sql
-- Description: Database initialization script for LexiMind project (Supabase + PostgreSQL)
-- Author: Francisco Javier Chía Moctezuma
-- Project: LexiMind - Knowledge Hub for Banking
-- ==========================================================================================

-- ==============================================
-- 1. EXTENSIONES NECESARIAS
-- ==============================================
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- 2. TABLAS CATÁLOGO (Sin dependencias)
-- ==============================================

-- -----------------------------------------------
-- Tabla para áreas o departamentos funcionales
-- -----------------------------------------------
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
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
    updated_by UUID
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
    updated_by UUID
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
    updated_by UUID
);

COMMENT ON TABLE tags IS 'Catalog of tags for documents';
COMMENT ON COLUMN tags.name IS 'Tag name';

-- ==============================================
-- 3. TABLAS PRINCIPALES (Con Foreign Keys)
-- ==============================================

-- -----------------------------------------------
-- Tabla para perfiles de usuario extendidos
-- -----------------------------------------------
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    nickname TEXT,
    rol TEXT,
    status TEXT,
    img_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    file_size NUMERIC NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    content_type VARCHAR(255),
    description TEXT NOT NULL DEFAULT '',
    "URL_Reference" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by_doc FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT fk_updated_by_doc FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

COMMENT ON TABLE documents IS 'Metadata for uploaded documents stored in Supabase Storage';
COMMENT ON COLUMN documents.original_name IS 'Original file name as uploaded';
COMMENT ON COLUMN documents.alias IS 'Short or friendly alias for the document';
COMMENT ON COLUMN documents.user_id IS 'Reference to the user who uploaded the document';
COMMENT ON COLUMN documents.uploaded_at IS 'Timestamp when the document was uploaded';
COMMENT ON COLUMN documents.storage_path IS 'Supabase storage path';
COMMENT ON COLUMN documents.signed_url IS 'Temporary signed URL for accessing the document';
COMMENT ON COLUMN documents.signed_url_expires_at IS 'Expiration timestamp for the signed URL';
COMMENT ON COLUMN documents.file_size IS 'Tamaño del Documento en Bytes';
COMMENT ON COLUMN documents.content_type IS 'Tipo de Contenido del Documento';

-- -----------------------------------------------
-- Tabla para conversaciones de usuario
-- -----------------------------------------------
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- Tabla para mensajes dentro de una conversación
-- -----------------------------------------------
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content TEXT NOT NULL,
    tokens INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- Tabla para opiniones de expertos
-- -----------------------------------------------
CREATE TABLE public.expert_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    expert_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    opinion TEXT NOT NULL,
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 4. TABLAS DE RELACIÓN (Muchos a Muchos)
-- ==============================================

-- Relación documentos ↔ áreas
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

-- Relación documentos ↔ categorías
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

-- Relación documentos ↔ fuentes
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

-- Relación documentos ↔ tags
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

-- ==============================================
-- 5. ÍNDICES PARA OPTIMIZACIÓN
-- ==============================================

-- Índices para documents
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);

-- Índices para conversations
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);

-- Índices para expert_opinions
CREATE INDEX IF NOT EXISTS expert_opinions_id_idx1 ON public.expert_opinions(message_id);
CREATE INDEX IF NOT EXISTS expert_opinions_id_idx2 ON public.expert_opinions(expert_user_id);

-- Índices para tablas de relación
CREATE INDEX idx_document_areas_document_id ON document_areas(document_id);
CREATE INDEX idx_document_areas_area ON document_areas(document_id, area_id);

CREATE INDEX idx_document_categories_document_id ON document_categories(document_id);
CREATE INDEX idx_document_categories_category ON document_categories(document_id, category_id);

CREATE INDEX idx_document_sources_document_id ON document_sources(document_id);
CREATE INDEX idx_document_sources_source ON document_sources(document_id, source_id);

CREATE INDEX idx_document_tags_tag ON document_tags(document_id, tag_id);
CREATE INDEX idx_document_tags_document_id ON document_tags(document_id);

-- ==============================================
-- 6. AGREGAR FOREIGN KEYS A TABLAS CATÁLOGO
-- ==============================================

-- Agregar foreign keys que dependen de auth.users
ALTER TABLE areas ADD CONSTRAINT fk_created_by_area FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE areas ADD CONSTRAINT fk_updated_by_area FOREIGN KEY (updated_by) REFERENCES auth.users(id);

ALTER TABLE categories ADD CONSTRAINT fk_created_by_cat FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE categories ADD CONSTRAINT fk_updated_by_cat FOREIGN KEY (updated_by) REFERENCES auth.users(id);

ALTER TABLE sources ADD CONSTRAINT fk_created_by_source FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE sources ADD CONSTRAINT fk_updated_by_source FOREIGN KEY (updated_by) REFERENCES auth.users(id);

ALTER TABLE tags ADD CONSTRAINT fk_created_by_tag FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE tags ADD CONSTRAINT fk_updated_by_tag FOREIGN KEY (updated_by) REFERENCES auth.users(id);

-- ==============================================
-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_opinions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 8. GRANTS (PERMISOS)
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
-- 9. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==============================================

-- ============== CATÁLOGOS ==============
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

-- ============== DOCUMENTOS ==============
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

-- ============== TABLAS DE RELACIÓN ==============
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

-- ============== PERFILES DE USUARIO ==============
CREATE POLICY "Allow user to manage own profile"
ON public.profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============== CONVERSACIONES ==============
CREATE POLICY "Authenticated users can view theirs Conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============== MENSAJES ==============
CREATE POLICY "Authenticated users can view theirs Messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create Messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============== OPINIONES DE EXPERTOS ==============
CREATE POLICY "Authenticated users can view Opinions"
ON public.expert_opinions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create Expert Opinions"
ON public.expert_opinions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = expert_user_id);

-- ==============================================
-- Description: Grants and RLS Policies for Supabase Storage Buckets (LexiMind)
-- Las tablas de storage no hay que crearlas, ya las crea Supabase
-- Solo hay que configurar los buckets, permisos y políticas
-- ==============================================

-- ==============================================
-- BUCKET: documents (private)
-- ==============================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- POLICIES for documents bucket

-- Read: any authenticated user can read documents
CREATE POLICY "Authenticated users can read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING ( bucket_id = 'documents' );

-- Insert: any authenticated user can upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'documents' );

-- Update: only owner can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING ( bucket_id = 'documents' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'documents' AND owner = auth.uid() );

-- Delete: only owner can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'documents' AND owner = auth.uid() );

-- ==============================================
-- BUCKET: public-assets (public)
-- ==============================================

-- Ensure bucket exists (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;



-- ==============================================
-- 10. DATOS INICIALES (CATÁLOGOS)
-- ==============================================

-- ============== ÁREAS ==============
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

-- ============== CATEGORÍAS ==============
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

-- ============== FUENTES ==============
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
('Open_Banking_Standard'),
('Credit_Bureau');

-- ============== TAGS ==============
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

-- ==============================================
-- FIN DEL SCRIPT DE INICIALIZACIÓN
-- ==============================================
