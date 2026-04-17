CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    username    TEXT            UNIQUE NOT NULL,
    passhash    VARCHAR(255)    NOT NULL,
    role_id     CHAR(1)         CHECK(role_id IN ('P', 'D', 'A'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token_hash  TEXT            NOT NULL,
	created_at  TIMESTAMP       DEFAULT NOW(),
	expires_at  TIMESTAMP       NOT NULL,
	revoked     BOOLEAN         DEFAULT false,
    user_agent  TEXT,
    user_ip     INET
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

INSERT INTO users (id, username, passhash, role_id) VALUES
('08e2b7d9-f1d2-4b07-8328-c3e9c870e2fd', 'dr.novikova',  '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('0e5650f7-7eed-40a8-8745-3234db5dddaf', 'dr.volkova',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('294ef29c-6422-48d2-b5dc-d3292c8fc707', 'p.stepanova',  '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('395bc65d-234c-4361-9879-77746193d3af', 'p.fedorov',    '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('39f82c20-9518-440b-b2ec-1cb549f98070', 'p.egorova',    '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('3cb6e7a1-bfa2-4575-bc08-9606cac8c7ec', 'dr.ivanov',    '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('500cf761-f6e5-474d-8a88-62648afd20ea', 'dr.sokolova',  '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('59edb842-9298-4bce-8938-ea1fffddc06e', 'dr.sidorov',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('5f54b94f-5b02-4e44-8153-003a13f06eb1', 'p.zakharov',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('684aeecf-6240-4bde-a0f6-a8b203ad63c1', 'p.tikhonova',  '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('6a382f85-9c61-4b23-bff4-e0c9bdd894ce', 'dr.kuznetsov', '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('83287d9c-5387-4b82-9119-97b687859a43', 'p.nikolaev',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('9a956bf2-def8-43f3-9903-e6f8568d95fb', 'p.nikiforova', '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('af8fc80c-dbf4-4c0d-805e-9a58a40cd66b', 'dr.kozlova',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('b22b321f-ee09-4974-a6dd-14a3a3852a64', 'dr.lebedeva',  '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('b2e60245-de8f-4064-b967-6fdee3c724b4', 'dr.morozov',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D'),
('bbf44d03-e9d5-43e6-8bd1-4a9ffcfde94c', 'admin',        '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'A'),
('d4cdd21e-d52c-42d2-99b8-351930121ff6', 'p.alekseev',   '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('fb53faac-344d-426f-930f-3ca792eaa6c8', 'p.mikhailov',  '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('fc2b8cec-1a4b-4037-aa16-9034728eb07a', 'p.pavlova',    '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'P'),
('fd1dab24-a90d-4e8e-b05c-92bcc1cb12e5', 'dr.petrov',    '3a2acf7624dcf458ba556bf5ddc51ca8d5caa6077eda19f6cb080343b4ff30c5398abf2295349a3e82b9a74ec2b0790ef69e685ff08fcfe19ff8f13122043a43.40c7ece3fe02addb93f80e1b120a5fd4', 'D')
ON CONFLICT DO NOTHING;