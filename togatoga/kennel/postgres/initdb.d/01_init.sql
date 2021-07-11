DROP TABLE IF EXISTS solutions;
CREATE TABLE solutions (
    id serial NOT NULL PRIMARY KEY,
    problem_id INT NOT NULL,
    user_name TEXT,
    solution JSON NOT NULL,
    dislike INT NOT NULL,
    created_at TIMESTAMP with time zone NOT NULL
);

DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id INT NOT NULL PRIMARY KEY,
    problem JSON NOT NULL
);

DROP TYPE IF EXISTS bonus_type;
CREATE TYPE bonus_type AS ENUM('GLOBALIST', 'BREAK_A_LEG', 'WALLHACK');

DROP TABLE IF EXISTS bonuses;
CREATE TABLE bonuses (
    id serial NOT NULL PRIMARY KEY,
    source INT NOT NULL,
    source_index INT NOT NULL,
    destination INT NOT NULL,
    bonus bonus_type NOT NULL,
    position JSON NOT NULL
);

DROP TABLE IF EXISTS used_bonuses;
CREATE TABLE used_bonuses (
    solution_id INT NOT NULL,
    bonus_id INT NOT NULL,
    PRIMARY KEY (solution_id, bonus_id)
);

DROP TABLE IF EXISTS got_bonuses;
CREATE TABLE got_bonuses (
    solution_id INT NOT NULL,
    bonus_id INT NOT NULL,
    PRIMARY KEY (solution_id, bonus_id)
);

DROP TABLE IF EXISTS minimal_dislikes;
CREATE TABLE minimal_dislikes (
    id serial NOT NULL PRIMARY KEY,
    problem_id INT NOT NULL,
    dislike INT NOT NULL,
    created_at TIMESTAMP with time zone NOT NULL
);
