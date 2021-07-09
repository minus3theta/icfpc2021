package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/jackc/pgx/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

type Solution struct {
	Vertices [][]int `json:"vertices" form:"vertices"`
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
	fmt.Println(db)
	defer db.Close(context.Background())

	e.POST("/api/problems/:id/solutions/:user_name", postSolutions)

	// Start server
	e.Logger.Fatal(e.Start(":1323"))
}

// Handler
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
	INSERT INTO submissions(problem_id, user_name, submission, created_at)
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
