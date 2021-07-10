DROP TABLE IF EXISTS solutions;
CREATE TABLE solutions (
    id serial NOT NULL PRIMARY KEY,
    problem_id INT NOT NULL,
    user_name TEXT,
    solution JSON NOT NULL,
    use_globalist BOOLEAN NOT NULL,
    use_break_a_leg BOOLEAN NOT NULL,
    created_at TIMESTAMP with time zone NOT NULL
);

DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id INT NOT NULL PRIMARY KEY,
    problem JSON NOT NULL
);

CREATE TYPE bonus_type AS ENUM('GLOBALIST', 'BREAK_A_LEG');
DROP TABLE IF EXISTS bonuses;
CREATE TABLE bonuses (
    id serial NOT NULL PRIMARY KEY,
    source INT NOT NULL,
    destination INT NOT NULL,
    bonus bonus_type NOT NULL
);
