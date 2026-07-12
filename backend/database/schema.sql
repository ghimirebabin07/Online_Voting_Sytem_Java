CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    mobile VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(160),
    voter_id VARCHAR(80) UNIQUE,
    province VARCHAR(80),
    district VARCHAR(80),
    municipality VARCHAR(120),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VOTER',
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_mobile_format CHECK (mobile ~ '^9[876][0-9]{8}$')
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(160);
ALTER TABLE users ADD COLUMN IF NOT EXISTS voter_id VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS province VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS municipality VARCHAR(120);
CREATE UNIQUE INDEX IF NOT EXISTS users_voter_id_unique ON users(voter_id) WHERE voter_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    party VARCHAR(120) NOT NULL,
    image_path TEXT,
    symbol_path TEXT,
    description TEXT,
    province VARCHAR(80),
    district VARCHAR(80),
    municipality VARCHAR(120),
    vote_count INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0)
);

ALTER TABLE candidates ALTER COLUMN image_path TYPE TEXT;
ALTER TABLE candidates ALTER COLUMN symbol_path TYPE TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS province VARCHAR(80);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS district VARCHAR(80);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS municipality VARCHAR(120);

CREATE TABLE IF NOT EXISTS election_locations (
    id SERIAL PRIMARY KEY,
    province VARCHAR(80) NOT NULL,
    district VARCHAR(80) NOT NULL,
    municipality VARCHAR(120) NOT NULL,
    UNIQUE (province, district, municipality)
);

CREATE TABLE IF NOT EXISTS developers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    role_title VARCHAR(120) NOT NULL,
    bio TEXT,
    skills VARCHAR(180),
    image_path TEXT,
    linkedin_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE developers ALTER COLUMN image_path TYPE TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
