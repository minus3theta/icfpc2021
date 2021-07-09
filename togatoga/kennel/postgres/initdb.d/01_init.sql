DROP TABLE IF EXISTS solutions;
CREATE TABLE solutions (
    id serial NOT NULL PRIMARY KEY,
    problem_id INT NOT NULL,
    user_name TEXT,
    solution JSON NOT NULL,
    created_at  TIMESTAMP with time zone NOT NULL
);
-- INSERT INTO submissions(problem_id, user_name, user_email, submission, created_at)
-- VALUES(
--         1,
--         'hitoshi',
--         'togatoga',
--         '{"vertices": [[20, 0],[0, 20],[40, 20],[20, 40]]}',
--         current_timestamp
--     );