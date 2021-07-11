package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

const (
	BonusKindGlobalist = "GLOBALIST"
	BonusKindBreadALeg = "BREAK_A_LEG"
	BonusKindWallHack  = "WALLHACK"
)

type Vertex = []int
type BonusInSolution struct {
	Bonus   string `json:"bonus"`
	Problem int    `json:"problem"`        // source problem ID
	Edge    Vertex `json:"edge,omitempty"` // for specifying a edge by BREAK_A_LEG
}
type Solution struct {
	Vertices []Vertex          `json:"vertices" form:"vertices"`
	Bonuses  []BonusInSolution `json:"bonuses"`
}

type UserSolution struct {
	Id         int       `json:"id" db:"id"`
	Problem_id int       `json:"problem_id" db:"problem_id"`
	User_name  string    `json:"user_name" db:"user_name"`
	Solution   Solution  `json:"solution" db:"solution"`
	Created_at time.Time `json:"created_at" db:"created_at"`
}

type Figure struct {
	Edges    []Vertex `json:"edges"`
	Vertices []Vertex `json:"vertices"`
}

type Bonus struct {
	Bonus       string `json:"bonus"`
	Problem     int    `json:"problem"`
	Position    Vertex `json:"position"`
	SourceIndex int
	Destination int
	Id          int
}

type Problem struct {
	Hole    []Vertex `json:"hole"`
	Figure  Figure   `json:"figure"`
	Epsilon int      `json:"epsilon"`
	Bonuses []Bonus  `json:"bonuses"`
}

type MinimalPosted struct {
	Dislike int `json:"minimal_dislike"`
}

type MinimalRecord struct {
	Problem    int       `json:"problem_id"`
	Dislike    int       `json:"minimal_dislike"`
	Created_at time.Time `json:"created_at"`
}

type GotBonus struct {
	SolutionId int
	BonusId    int
}

type Score struct {
	Dislike int   `json:"dislike"`
	Bonuses []int `json:"bonuses"` // index of bonuses array in problem
}

type ErrorResponse struct {
	Message string `json:"message"`
}

var db *pgxpool.Pool

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
	db, err = pgxpool.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	if err := loadProblems(e.Logger); err != nil {
		fmt.Fprintf(os.Stderr, "Unable to load problems: %v\n", err)
		os.Exit(1)
	}

	defer db.Close()

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

func getAvailableBonuses(problemId int) ([]Bonus, error) {
	sql := `
		SELECT
			id, source, source_index, destination, bonus, position
		FROM bonuses
		WHERE destination = $1`
	rows, err := db.Query(context.Background(), sql, problemId)
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	bonuses := make([]Bonus, 0)
	for rows.Next() {
		var bonus Bonus
		err = rows.Scan(&bonus.Id, &bonus.Problem, &bonus.SourceIndex, &bonus.Destination, &bonus.Bonus, &bonus.Position)
		if err != nil {
			return nil, err
		}
		bonuses = append(bonuses, bonus)
	}
	return bonuses, nil
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
	solution := new(Solution)
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}
	user_name := c.Param("user_name")
	if err := c.Bind(&solution); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}
	// bytes, err := json.Marshal(&s)
	// fmt.Println("togatoga")
	// if err != nil {
	// 	return c.JSON(http.StatusInternalServerError, err)
	// }
	// ss := string(bytes)

	problem, err := getProblemById(int(id))
	if err != nil {
		c.Echo().Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}
	availableBonuses, err := getAvailableBonuses(int(id))
	if err != nil {
		c.Echo().Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}
	usedBonusIds := make([]int, 0)
	for _, usedBonus := range solution.Bonuses {
		for _, availableBonus := range availableBonuses {
			if usedBonus.Problem == availableBonus.Problem && usedBonus.Bonus == availableBonus.Bonus {
				usedBonusIds = append(usedBonusIds, availableBonus.Id)
				break
			}
		}
	}
	if len(usedBonusIds) != len(solution.Bonuses) {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid bonuses"})
	}
	score, err := getScore(*problem, *solution)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}
	sql := `
	INSERT INTO solutions(problem_id, user_name, solution, dislike, created_at)
	VALUES ($1, $2, $3, $4, current_timestamp)
	RETURNING id`
	// fmt.Println(db)
	tx, err := db.Begin(context.Background())

	if err != nil {
		c.Echo().Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}

	defer tx.Rollback(context.Background())
	solutionId := 0
	err = tx.QueryRow(context.Background(), sql, id, user_name, solution, score.Dislike).Scan(&solutionId)

	c.Echo().Logger.Info(solutionId)
	if err != nil {
		c.Echo().Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}

	if len(score.Bonuses) > 0 {
		sql := `
			SELECT
				id, source, source_index, destination, bonus, position
			FROM bonuses
			WHERE source = $1`
		rows, err := tx.Query(context.Background(), sql, id)
		defer rows.Close()
		if err != nil {
			c.Echo().Logger.Error(err)
			return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
		}
		bonuses := make([]Bonus, 0)
		for rows.Next() {
			var bonus Bonus
			err := rows.Scan(&bonus.Id, &bonus.Problem, &bonus.SourceIndex, &bonus.Destination, &bonus.Bonus, &bonus.Position)
			if err != nil {
				c.Echo().Logger.Error(err)
				return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
			}
			bonuses = append(bonuses, bonus)
		}
		sort.Slice(bonuses, func(i, j int) bool { return bonuses[i].SourceIndex < bonuses[j].SourceIndex })
		obtainedBonuses := make([]GotBonus, 0)
		for _, bonusIndex := range score.Bonuses {
			obtainedBonuses = append(obtainedBonuses, GotBonus{solutionId, bonuses[bonusIndex].Id})
		}
		sql = `
			INSERT INTO got_bonuses
				(solution_id, bonus_id)
			VALUES
				($1, $2)`
		//		TODO: use papared statement
		//		const stmtKey = "insert_got_bonuses_statement"
		//		_, err := tx.Prepare(context.Background(), stmtKey, sql)
		//		if err != nil {
		//			c.Echo().Logger.Error(err)
		//			return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
		//		}
		for _, b := range obtainedBonuses {
			_, err = tx.Exec(context.Background(), sql, b.SolutionId, b.BonusId)
			if err != nil {
				c.Echo().Logger.Error(err)
				return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
			}
		}
	}

	if len(solution.Bonuses) > 0 {
		sql := `
			INSERT INTO used_bonuses
				(solution_id, bonus_id)
			VALUES
				($1, $2)`
		// TODO: use prepared statement
		for _, bonusId := range usedBonusIds {
			_, err = tx.Exec(context.Background(), sql, solutionId, bonusId)
			if err != nil {
				c.Echo().Logger.Error(err)
				return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
			}
		}
	}

	err = tx.Commit(context.Background())
	if err != nil {
		c.Echo().Logger.Error(err)
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}
	return c.JSON(http.StatusOK, &score)
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

func getProblemById(id int) (*Problem, error) {
	sql := `SELECT problem FROM problems WHERE id = $1`
	problem := new(Problem)
	if err := db.QueryRow(context.Background(), sql, id).Scan(&problem); err != nil {
		return nil, err
	}
	return problem, nil
}

func getProblems(c echo.Context) error {
	sql := `SELECT problem FROM problems WHERE id = $1`

	id := c.Param("id")

	problem := new(Problem)
	if err := db.QueryRow(context.Background(), sql, id).Scan(&problem); err != nil {
		if err == pgx.ErrNoRows {
			return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
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

type Position struct {
	x, y int
}

func (this Position) Add(other Position) Position {
	return Position{x: this.x + other.x, y: this.y + other.y}
}
func (this Position) Sub(other Position) Position {
	return Position{x: this.x - other.x, y: this.y - other.y}
}
func (this Position) InnerProduct(other Position) int {
	return this.x*other.x + this.y*other.y
}
func (this Position) CrossProduct(other Position) int {
	return this.x*other.y - this.y*other.x
}
func (this *Position) SquareDistance(other Position) int {
	x := this.x - other.x
	y := this.y - other.y
	return x*x + y*y
}
func (this *Position) IsOnLine(v1 Position, v2 Position) bool {
	cross := (v2.Sub(v1)).CrossProduct(v1.Sub(*this))
	inner1 := (v2.Sub(v1)).InnerProduct(v1.Sub(*this))
	inner2 := (v2.Sub(v1)).InnerProduct(v2.Sub(*this))
	return cross == 0 && (inner1*inner2 <= 0)
}
func (this *Position) IsInHole(hole []Position) bool {
	cnt := 0
	for i := range hole {
		j := (i + 1) % len(hole)
		if ((hole[i].y <= this.y) && (hole[j].y > this.y)) ||
			((hole[i].y > this.y) && (hole[j].y <= this.y)) {
			vt := float64(this.y-hole[i].y) / float64(hole[j].y-hole[i].y)
			if float64(this.x) < (float64(hole[i].x) + (vt * float64(hole[j].x-hole[i].x))) {
				cnt += 1
			}
		}
	}
	if cnt%2 != 0 {
		return true
	}
	for i := range hole {
		j := (i + 1) % len(hole)
		if this.IsOnLine(hole[i], hole[j]) {
			return true
		}
	}
	return false
}
func intersectImpl(v1, v2, u1, u2 Position) bool {
	if v1.x == v2.x {
		return (u1.x < v1.x && v1.x < u2.x) || (u2.x < v1.x && v1.x < u1.x)
	} else {
		val1 := (v1.x-v2.x)*u1.y - (v1.y-v2.y)*u1.x - v1.CrossProduct(v2)
		val2 := (v1.x-v2.x)*u2.y - (v1.y-v2.y)*u2.x - v1.CrossProduct(v2)
		return val1*val2 < 0
	}
}
func intersect(v1, v2, u1, u2 Position) bool {
	if (v1.Sub(v2)).CrossProduct(u1.Sub(u2)) == 0 {
		return false
	}
	return intersectImpl(v1, v2, u1, u2) && intersectImpl(u1, u2, v1, v2)
}
func intersectHole(p1 Position, p2 Position, hole []Position) bool {
	for i := range hole {
		j := (i + 1) % len(hole)
		u1 := hole[i]
		u2 := hole[j]
		if intersect(u1, u2, p1, p2) {
			return true
		}
	}
	return false
}

func dislikes(hole []Position, vertices []Position) int {
	ans := 0
	for _, p := range hole {
		val := int(math.MaxInt32)
		for _, q := range vertices {
			d := p.SquareDistance(q)
			if d < val {
				val = d
			}
		}
		ans += val
	}
	return ans
}
func checkLengthConstraint(problem Problem, distance, originalDistance int, bonus string) bool {
	expansion := math.Abs(float64(distance)/float64(originalDistance) - 1.0)
	expansionLimit := float64(problem.Epsilon) / 1000000.0
	if bonus == BonusKindGlobalist {
		expansionLimit *= float64(len(problem.Figure.Edges))
	}
	return expansion > expansionLimit
}
func getScore(problem Problem, solution Solution) (Score, error) {
	bonus := BonusInSolution{}
	if len(solution.Bonuses) > 0 {
		bonus = solution.Bonuses[0]
	}
	if bonus.Bonus == BonusKindBreadALeg {
		if len(problem.Figure.Vertices)+1 != len(solution.Vertices) {
			return Score{Dislike: -1}, errors.New(fmt.Sprintf("invalid number of vertices: expected %v but %v", len(problem.Figure.Vertices)+1, len(solution.Vertices)))
		}
	} else {
		if len(problem.Figure.Vertices) != len(solution.Vertices) {
			return Score{Dislike: -1}, errors.New(fmt.Sprintf("invalid number of vertices: expected %v but %v", len(problem.Figure.Vertices), len(solution.Vertices)))
		}
	}
	hole := make([]Position, 0, len(problem.Hole))
	obtainedBonuses := make(map[int]struct{}, 0)
	for _, v := range problem.Hole {
		hole = append(hole, Position{x: v[0], y: v[1]})
	}
	vertices := make([]Position, 0, len(solution.Vertices))
	for _, v := range solution.Vertices {
		vertices = append(vertices, Position{x: v[0], y: v[1]})
		for bonusIndex, bonus := range problem.Bonuses {
			if v[0] == bonus.Position[0] && v[1] == bonus.Position[1] {
				obtainedBonuses[bonusIndex] = struct{}{}
			}
		}
	}
	cntOutOfHole := 0
	var outOfHoleVertexIndex *int = nil
	for i, p := range vertices {
		if !p.IsInHole(hole) {
			if bonus.Bonus == BonusKindWallHack {
				cntOutOfHole += 1
				outOfHoleVertexIndex = new(int)
				*outOfHoleVertexIndex = i
			} else {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("(%v, %v) is not in the hole", p.x, p.y))
			}
		}
	}
	if cntOutOfHole > 1 {
		return Score{Dislike: -1}, errors.New("The number of vertices of out the hole exceeds the limit 1")
	}
	for _, e := range problem.Figure.Edges {
		i := e[0]
		j := e[1]
		v1 := vertices[i]
		v2 := vertices[j]

		// calculate distance between v1 and v2
		d := v1.SquareDistance(v2)
		originalVertex1 := problem.Figure.Vertices[i]
		originalVertex2 := problem.Figure.Vertices[j]
		u1 := Position{x: originalVertex1[0], y: originalVertex1[1]}
		u2 := Position{x: originalVertex2[0], y: originalVertex2[1]}
		originalDist := u1.SquareDistance(u2)
		if bonus.Bonus == BonusKindBreadALeg &&
			((i == bonus.Edge[0] && j == bonus.Edge[1]) ||
				(i == bonus.Edge[1] && j == bonus.Edge[0])) {
			lastIndex := len(solution.Vertices) - 1
			v3 := vertices[lastIndex]
			d1 := v1.SquareDistance(v3)
			d2 := v2.SquareDistance(v3)
			if checkLengthConstraint(problem, 4*d1, originalDist, bonus.Bonus) {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("the length of edge between (%v, %v) and (%v, %v) exceeds the constraint", v1.x, v1.y, v3.x, v3.y))
			}
			if checkLengthConstraint(problem, 4*d2, originalDist, bonus.Bonus) {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("the length of edge between (%v, %v) and (%v, %v) exceeds the constraint", v2.x, v2.y, v3.x, v3.y))
			}
			// check if the edge does not intersect with the hole
			if intersectHole(v1, v3, hole) {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("edge between (%v, %v) and (%v, %v) intersect with hole", v1.x, v1.y, v3.x, v3.y))
			}
			if intersectHole(v2, v3, hole) {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("edge between (%v, %v) and (%v, %v) intersect with hole", v2.x, v2.y, v3.x, v3.y))
			}
		} else {
			if checkLengthConstraint(problem, d, originalDist, bonus.Bonus) {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("the length of edge between (%v, %v) and (%v, %v) exceeds the constraint", v1.x, v1.y, v2.x, v2.y))
			}
			if outOfHoleVertexIndex != nil && (i == *outOfHoleVertexIndex || j == *outOfHoleVertexIndex) {
				continue
			}
			// check if the edge does not intersect with the hole
			if intersectHole(v1, v2, hole) {
				return Score{Dislike: -1}, errors.New(fmt.Sprintf("edge between (%v, %v) and (%v, %v) intersect with hole", v1.x, v1.y, v2.x, v2.y))
			}
		}
	}
	bonuses := make([]int, 0, len(obtainedBonuses))
	for key := range obtainedBonuses {
		bonuses = append(bonuses, key)
	}
	return Score{Dislike: dislikes(hole, vertices), Bonuses: bonuses}, nil
}
