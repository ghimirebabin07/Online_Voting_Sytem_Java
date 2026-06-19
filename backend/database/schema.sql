CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    mobile VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(160),
    voter_id VARCHAR(80) UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VOTER',
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_mobile_format CHECK (mobile ~ '^9[876][0-9]{8}$')
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(160);
ALTER TABLE users ADD COLUMN IF NOT EXISTS voter_id VARCHAR(80);
CREATE UNIQUE INDEX IF NOT EXISTS users_voter_id_unique ON users(voter_id) WHERE voter_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    party VARCHAR(120) NOT NULL,
    image_path VARCHAR(255),
    symbol_path VARCHAR(255),
    description TEXT,
    vote_count INTEGER NOT NULL DEFAULT 0 CHECK (vote_count >= 0)
);

CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO candidates (id, name, party, image_path, symbol_path, description)
VALUES
    (1, 'Balen Shah', 'Rastriya Swatantra Party', '../Images/Balen_.jpg', '../Images/RSP.jpg', 'Strong Engineering Background focused on development and transparency.'),
    (2, 'Rabi Lamichhane', 'Rastriya Swatantra Party', '../Images/Rabi.jpg', '../Images/RSP.jpg', 'Advocates anti-corruption reforms and governance transparency.'),
    (3, 'Sobita Gautam', 'Rastriya Swatantra Party', '../Images/Sobita.jpg', '../Images/RSP.jpg', 'Focused on women empowerment and policy reform.'),
    (4, 'KP Sharma Oli', 'UML', '../Images/Kp.jpg', '../Images/UML.jpg', 'Focused on infrastructure and national development.'),
    (5, 'Pushpa Kamal Dahal', 'Maoist Center', '../Images/Puspa.jpg', '../Images/Maoist.jpg', 'Promotes social justice and democratic reforms.'),
    (6, 'Sher Bahadur Deuba', 'Congress', '../Images/Sher.jpg', '../Images/Congress.jpg', 'Experienced politician focused on governance reforms.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    party = EXCLUDED.party,
    image_path = EXCLUDED.image_path,
    symbol_path = EXCLUDED.symbol_path,
    description = EXCLUDED.description;

SELECT setval('candidates_id_seq', (SELECT MAX(id) FROM candidates));

INSERT INTO users (full_name, mobile, email, voter_id, password_hash, role)
VALUES (
    'System Administrator',
    '9800000000',
    'admin@voting.local',
    'admin',
    '120000:TWf+EgpcF9msR1jVsWTjCQ==:dgKtZqyenZ46UX1JOk8yHb7aZZMhJyLSS9hD5eYV300=',
    'ADMIN'
)
ON CONFLICT (mobile) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    voter_id = EXCLUDED.voter_id,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
