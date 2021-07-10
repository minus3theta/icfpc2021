package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"
	"path/filepath"
	"io/ioutil"
	"encoding/json"

	"github.com/jackc/pgx/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

type Vertex = []int
type Solution struct {
	Vertices []Vertex `json:"vertices" form:"vertices"`
}

type UserSolution struct {
	Id         int       `json:"id" db:"id"`
	Problem_id int       `json:"problem_id" db:"problem_id"`
	User_name  string    `json:"user_name" db:"user_name"`
	Solution   Solution  `json:"solution" db:"solution"`
	Created_at time.Time `json:"created_at" db:"created_at"`
}

type Figure struct {
	Edges []Vertex `json:"edges"`
	Vertices []Vertex `json:"vertices"`
}

type Bonus struct {
	Bonus string `json:"bonus"`
	Problem int `json:"problem"`
	Position Vertex `json:"position"`
}

type Problem struct {
	Hole []Vertex `json:"hole"`
	Figure Figure `json:"figure"`
	Epsilon int `json:"epsilon"`
	Bonuses []Bonus `json:"bonuses"`
}

type MinimalPosted struct {
	Dislike int `json:"minimal_dislike"`
}

type MinimalRecord struct {
	Problem int `json:"problem_id"`
	Dislike int `json:"minimal_dislike"`
	Created_at time.Time `json:"created_at"`
}

var db *pgx.Conn

func main() {
	// Echo instance
	e := echo.New()
	e.Debug = true
	e.Logger.SetLevel(log.DEBUG)

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	//"postgres://root:root@localhost:5432/root"
	var err error
	db, err = pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	if err := loadProblems(e.Logger); err != nil {
		fmt.Fprintf(os.Stderr, "Unable to load problems: %v\n", err)
		os.Exit(1)
	}

	defer db.Close(context.Background())

	e.POST("/api/problems/:id/solutions/:user_name", postSolutions)
	e.GET("/api/problems/:id/solutions", getSolutionsOfProblem)
	e.GET("/api/solutions", getSolutions)
	e.GET("/api/problems/:id", getProblems)
	e.POST("/api/minimal/:id", postMinimal)
	e.GET("/api/minimal/:id", getMinimal)
	e.GET("/api/minimal", getMinimalAll)

	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}

func loadProblems(l echo.Logger) error {
	files, err := filepath.Glob("problems/*.json")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to list problem files: %v\n", err)
		return err
	}

	for _, file := range files {
		var problemId int
		fmt.Sscanf(file, "problems/%d.json", &problemId)

		problemFile, err := ioutil.ReadFile(file)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to read problem file: %v\n", err)
			return err
		}
		var problem Problem
		json.Unmarshal(problemFile, &problem)

		if err := insertProblem(problemId, problem, l); err != nil {
			fmt.Fprintf(os.Stderr, "Unable to insert problem to DB: %v\n", err)
			return err
		}
	}

	return nil
}

func insertProblem(problemId int, problem Problem, l echo.Logger) error {
	problemSql := `INSERT INTO problems(id, problem) VALUES ($1, $2)
	ON CONFLICT(id) DO UPDATE SET id = $1`
	bonusUpdateSql := `UPDATE bonuses SET destination = $1, bonus = $2, position = $3
	WHERE source = $4 and source_index = $5`
	bonusInsertSql := `INSERT INTO bonuses(source, source_index, destination, bonus, position)
	VALUES ($1, $2, $3, $4, $5)`

	tx, err := db.Begin(context.Background())

	if err != nil {
		return err
	}

	defer tx.Rollback(context.Background())

	if _, err := tx.Exec(context.Background(), problemSql, problemId, problem); err != nil {
		fmt.Fprintf(os.Stderr, "Unable to insert problem to DB: %v\n", err)
		return err
	}

	for index, bonus := range problem.Bonuses {
		count, err := tx.Exec(context.Background(), bonusUpdateSql, bonus.Problem, bonus.Bonus, bonus.Position, problemId, index)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to update bonuses in DB: %v\n", err)
			return err
		}
		if count.RowsAffected() == 0 {
			if _, err := tx.Exec(context.Background(), bonusInsertSql, problemId, index, bonus.Problem, bonus.Bonus, bonus.Position); err != nil {
				fmt.Fprintf(os.Stderr, "Unable to insert bonus to DB: %v\n", err)
				return err
			}
		}
	}

	l.Debug("Inserted problem: ", problemId)

	return tx.Commit(context.Background())
}

// Handler
func getSolutions(c echo.Context) error {
	sql := "SELECT id, problem_id, user_name, solution, created_at FROM solutions"

	rows, err := db.Query(context.Background(), sql)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	uss := []UserSolution{}
	for rows.Next() {
		var us UserSolution
		err = rows.Scan(&us.Id, &us.Problem_id, &us.User_name, &us.Solution, &us.Created_at)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		uss = append(uss, us)
	}

	return c.JSON(http.StatusOK, uss)
}
func postSolutions(c echo.Context) error {
	s := new(Solution)
	id := c.Param("id")
	user_name := c.Param("user_name")
	if err := c.Bind(&s); err != nil {
		return err
	}
	// bytes, err := json.Marshal(&s)
	// fmt.Println("togatoga")
	// if err != nil {
	// 	return c.JSON(http.StatusInternalServerError, err)
	// }
	// ss := string(bytes)

	sql := `
	INSERT INTO solutions(problem_id, user_name, solution, created_at)
	VALUES ($1, $2, $3, current_timestamp)`
	// fmt.Println(db)
	tx, err := db.Begin(context.Background())

	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	defer tx.Rollback(context.Background())
	_, err = tx.Exec(context.Background(), sql, id, user_name, s)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	err = tx.Commit(context.Background())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, s)
}

func getSolutionsOfProblem(c echo.Context) error {
	// TODO

	// sql := "SELECT id, problem_id, user_name, solution, created_at FROM solutions WHERE problem_id = $1"
	// id := c.Param("id")

	// rows, err := db.Query(context.Background(), sql, id)
	// if err != nil {
	// 	return c.JSON(http.StatusInternalServerError, err)
	// }
	// uss := []UserSolution{}
	// for rows.Next() {
	// 	var us UserSolution
	// 	err = rows.Scan(&us.Id, &us.Problem_id, &us.User_name, &us.Solution, &us.Created_at)

	// 	if err != nil {
	// 		return c.JSON(http.StatusInternalServerError, err)
	// 	}
	// 	uss = append(uss, us)
	// }

	// return c.JSON(http.StatusOK, uss)
	return c.JSON(http.StatusOK, []Solution{})
}

func getProblems(c echo.Context) error {
	sql := `SELECT problem FROM problems WHERE id = $1`

	id := c.Param("id")

	problem := new(Problem)
	if err := db.QueryRow(context.Background(), sql, id).Scan(&problem); err != nil {
		if err == pgx.ErrNoRows {
			return c.JSON(http.StatusNotFound, err)
		}
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, problem)
}

func postMinimal(c echo.Context) error {
	sql := `INSERT INTO minimal_dislikes(problem_id, dislike, created_at) VALUES ($1, $2, current_timestamp)`

	r := new(MinimalPosted)
	id := c.Param("id")
	if err := c.Bind(&r); err != nil {
		return err
	}
	tx, err := db.Begin(context.Background())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	defer tx.Rollback(context.Background())

	if _, err = tx.Exec(context.Background(), sql, id, r.Dislike); err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	if err = tx.Commit(context.Background()); err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, r)
}

func getMinimal(c echo.Context) error {
	sql := `SELECT problem_id, dislike, created_at FROM minimal_dislikes
	WHERE problem_id = $1
	ORDER BY created_at DESC
	LIMIT 1`

	minimal := new(MinimalRecord)
	id := c.Param("id")
	if err := db.QueryRow(context.Background(), sql, id).Scan(&minimal.Problem, &minimal.Dislike, &minimal.Created_at); err != nil {
		if err == pgx.ErrNoRows {
			return c.JSON(http.StatusNotFound, err)
		}
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, minimal)
}

func getMinimalAll(c echo.Context) error {
	sql := `SELECT problem_id, dislike, created_at FROM
	(SELECT problem_id, dislike, created_at,
	rank() OVER (PARTITION BY problem_id ORDER BY created_at DESC) as pos
	FROM minimal_dislikes) as sub
	WHERE pos = 1 ORDER BY problem_id`

	rows, err := db.Query(context.Background(), sql)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	mins := []MinimalRecord{}
	for rows.Next() {
		var min MinimalRecord
		err = rows.Scan(&min.Problem, &min.Dislike, &min.Created_at)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		mins = append(mins, min)
	}
	return c.JSON(http.StatusOK, mins)
}
