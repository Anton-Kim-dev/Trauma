CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS patients (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL UNIQUE,
    email       TEXT            UNIQUE NOT NULL,
    phone       VARCHAR(20)     UNIQUE,
    first_name  TEXT            NOT NULL,
    last_name   TEXT            NOT NULL,
    patronymic  TEXT,
    birth_date  DATE            NOT NULL,
    gender      CHAR(1)         CHECK(gender IN ('M', 'F')),
    created_at  TIMESTAMP       DEFAULT NOW(),
    updated_at  TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL UNIQUE,
    specialty       TEXT        NOT NULL,
    first_name      TEXT        NOT NULL,
    last_name       TEXT        NOT NULL,
    patronymic      TEXT,
    notes           TEXT,
    is_active       BOOLEAN     DEFAULT FALSE,
    work_days       INTEGER     NOT NULL,
    shift_start     TIME        NOT NULL,
    shift_end       TIME        NOT NULL,
    slot_minutes    INTEGER     NOT NULL DEFAULT 30
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

WITH patient_data (user_id, email, phone, first_name, last_name, patronymic, birth_date, gender) AS (
    VALUES
        ('d4cdd21e-d52c-42d2-99b8-351930121ff6'::UUID, 'alekseev.v@mail.ru',   '+79161234501', 'Владимир',   'Алексеев',  'Тарасович',    DATE '1985-03-14', CHAR(1) 'M'),
        ('395bc65d-234c-4361-9879-77746193d3af'::UUID, 'fedorov.k@mail.ru',    '+79161234502', 'Константин', 'Федоров',   'Романович',    DATE '1990-07-22', 'M'),
        ('fb53faac-344d-426f-930f-3ca792eaa6c8'::UUID, 'mikhailov.p@mail.ru',  '+79161234503', 'Павел',      'Михайлов',  'Степанович',   DATE '1978-11-05', 'M'),
        ('83287d9c-5387-4b82-9119-97b687859a43'::UUID, 'nikolaev.a@mail.ru',   '+79161234504', 'Антон',      'Николаев',  'Викторович',   DATE '2001-01-30', 'M'),
        ('5f54b94f-5b02-4e44-8153-003a13f06eb1'::UUID, 'zakharov.m@mail.ru',   '+79161234505', 'Максим',     'Захаров',   'Леонидович',   DATE '1995-09-18', 'M'),
        ('39f82c20-9518-440b-b2ec-1cb549f98070'::UUID, 'egorova.t@mail.ru',    '+79161234506', 'Татьяна',    'Егорова',   'Андреевна',    DATE '1988-06-02', 'F'),
        ('684aeecf-6240-4bde-a0f6-a8b203ad63c1'::UUID, 'tikhonova.a@mail.ru',  '+79161234507', 'Анна',       'Тихонова',  'Михайловна',   DATE '1972-12-25', 'F'),
        ('9a956bf2-def8-43f3-9903-e6f8568d95fb'::UUID, 'nikiforova.e@mail.ru', '+79161234508', 'Екатерина',  'Никифорова','Сергеевна',    DATE '2000-04-10', 'F'),
        ('294ef29c-6422-48d2-b5dc-d3292c8fc707'::UUID, 'stepanova.o@mail.ru',  '+79161234509', 'Оксана',     'Степанова', 'Николаевна',   DATE '1993-08-17', 'F'),
        ('fc2b8cec-1a4b-4037-aa16-9034728eb07a'::UUID, 'pavlova.yu@mail.ru',   '+79161234510', 'Юлия',       'Павлова',   'Владимировна', DATE '1982-02-28', 'F')
)
INSERT INTO patients (user_id, email, phone, first_name, last_name, patronymic, birth_date, gender)
SELECT user_id, email, phone, first_name, last_name, patronymic, birth_date, gender
FROM patient_data
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    patronymic = EXCLUDED.patronymic,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    updated_at = NOW();

WITH doctor_data (user_id, specialty, first_name, last_name, patronymic, notes, is_active, work_days, shift_start, shift_end, slot_minutes) AS (
    VALUES
        ('3cb6e7a1-bfa2-4575-bc08-9606cac8c7ec'::UUID, 'Кардиология',       'Дмитрий', 'Иванов',    'Сергеевич',     'Опытный кардиолог, ведет пациентов с нарушениями ритма и гипертонией', TRUE,  124, TIME '08:00', TIME '16:00', 30),
        ('fd1dab24-a90d-4e8e-b05c-92bcc1cb12e5'::UUID, 'Неврология',        'Алексей', 'Петров',    'Владимирович',  'Специализируется на мигрени и восстановлении после травм',             TRUE,  124, TIME '09:00', TIME '17:00', 30),
        ('59edb842-9298-4bce-8938-ea1fffddc06e'::UUID, 'Травматология',     'Игорь',   'Сидоров',   'Николаевич',    'Консультирует по травмам суставов, переломам и реабилитации',          TRUE,  124, TIME '07:00', TIME '13:00', 45),
        ('6a382f85-9c61-4b23-bff4-e0c9bdd894ce'::UUID, 'Дерматология',      'Сергей',  'Кузнецов',  'Иванович',      'Ведет пациентов с кожными проявлениями аллергии и воспалениями',       FALSE, 124, TIME '10:00', TIME '16:00', 20),
        ('b2e60245-de8f-4064-b967-6fdee3c724b4'::UUID, 'Педиатрия',         'Андрей',  'Морозов',   'Павлович',      'Работает с детьми до 12 лет, ведет профилактические осмотры',          TRUE,  124, TIME '08:00', TIME '14:00', 20),
        ('0e5650f7-7eed-40a8-8745-3234db5dddaf'::UUID, 'Офтальмология',     'Ольга',   'Волкова',   'Дмитриевна',    'Проводит диагностику зрения и консультирует по лазерной коррекции',    TRUE,  124, TIME '09:00', TIME '17:00', 30),
        ('08e2b7d9-f1d2-4b07-8328-c3e9c870e2fd'::UUID, 'Эндокринология',    'Наталья', 'Новикова',  'Алексеевна',    'Ведет пациентов с сахарным диабетом и нарушениями обмена веществ',     TRUE,  124, TIME '11:00', TIME '17:00', 30),
        ('500cf761-f6e5-474d-8a88-62648afd20ea'::UUID, 'Психиатрия',        'Елена',   'Соколова',  'Геннадьевна',   'Помогает при тревожных расстройствах и стрессовых состояниях',         FALSE, 124, TIME '13:00', TIME '19:00', 60),
        ('b22b321f-ee09-4974-a6dd-14a3a3852a64'::UUID, 'Гастроэнтерология', 'Ирина',   'Лебедева',  'Олеговна',      'Консультирует по заболеваниям ЖКТ, имеет опыт эндоскопической практики', TRUE,  124, TIME '08:00', TIME '14:00', 30),
        ('af8fc80c-dbf4-4c0d-805e-9a58a40cd66b'::UUID, 'Терапия',           'Мария',   'Козлова',   'Юрьевна',       'Врач первичного приема, помогает выбрать маршрут обследования',        TRUE,  124, TIME '08:00', TIME '16:00', 15)
)
INSERT INTO doctors (user_id, specialty, first_name, last_name, patronymic, notes, is_active, work_days, shift_start, shift_end, slot_minutes)
SELECT user_id, specialty, first_name, last_name, patronymic, notes, is_active, work_days, shift_start, shift_end, slot_minutes
FROM doctor_data
ON CONFLICT (user_id) DO UPDATE SET
    specialty = EXCLUDED.specialty,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    patronymic = EXCLUDED.patronymic,
    notes = EXCLUDED.notes,
    is_active = EXCLUDED.is_active,
    work_days = EXCLUDED.work_days,
    shift_start = EXCLUDED.shift_start,
    shift_end = EXCLUDED.shift_end,
    slot_minutes = EXCLUDED.slot_minutes;
