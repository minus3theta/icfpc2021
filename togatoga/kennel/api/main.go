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

type Problem struct {
	Hole []Vertex `json:"hole"`
	Figure Figure `json:"figure"`
	Epsilon int `json:"epsilon"`
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

	loadProblems(e.Logger)

	defer db.Close(context.Background())

	e.POST("/api/problems/:id/solutions/:user_name", postSolutions)
	e.GET("/api/solutions", getSolutions)

	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}

func loadProblems(l echo.Logger) {
	select_sql := "SELECT id FROM problems WHERE id = $1"
	problem_sql := "INSERT INTO problems(id, problem) VALUES ($1, $2)"

	files, err := filepath.Glob("problems/*.json")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to list problem files: %v\n", err)
		os.Exit(1)
	}

	for _, file := range files {
		var problemId int
		fmt.Sscanf(file, "problems/%d.json", &problemId)

		problemFile, err := ioutil.ReadFile(file)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to read problem file: %v\n", err)
			os.Exit(1)
		}
		var problem Problem
		json.Unmarshal(problemFile, &problem)

		tx, err := db.Begin(context.Background())

		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to begin transaction: %v\n", err)
			os.Exit(1)
		}
		defer tx.Rollback(context.Background())

		rows, err := tx.Query(context.Background(), select_sql, problemId)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to select problems from DB: %v\n", err)
			os.Exit(1)
		}
		if rows.Next() {
			continue
		}
		if _, err := tx.Exec(context.Background(), problem_sql, problemId, problem); err != nil {
			fmt.Fprintf(os.Stderr, "Unable to insert problem to DB: %v\n", err)
			tx.Rollback(context.Background())
			os.Exit(1)
		}
		if err := tx.Commit(context.Background()); err != nil {
			fmt.Fprintf(os.Stderr, "Unable to commit: %v\n", err)
			tx.Rollback(context.Background())
			os.Exit(1)
}
	}
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
