package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"net/http"
)

type Result struct {
	ColumnNames []string        `json:"columnNames"`
	Rows        [][]interface{} `json:"rows"`
}

func main() {
	// Args
	flag.Usage = func() {
		fmt.Printf("TODO")
	}
	flag.Parse()

	// Db
	db, err := sql.Open("postgres", "")
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	// Server
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("app/"))))
	http.HandleFunc("/query", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query().Get("query")
		log.Printf("Query received: %s", query)

		rows, err := db.Query(query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		colNames, err := rows.Columns()
		newRows := make([][]interface{}, 0)
		for rows.Next() {
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			vals := make([]interface{}, len(colNames))
			for v, _ := range vals {
				vals[v] = new(interface{})
			}
			err = rows.Scan(vals...)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			newVals := make([]interface{}, len(vals))
			for v, val := range vals {
				if val, ok := val.(*interface{}); ok {
					switch val := (*val).(type) {
					case []uint8:
						newVals[v] = string(val)
					default:
						newVals[v] = val
					}
				}
			}
			newRows = append(newRows, newVals)
		}

		// Marshal to JSON
		result := Result{
			ColumnNames: colNames,
			Rows:        newRows,
		}

		resp, err := json.Marshal(result)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Write(resp)
	})
	log.Println("Serving on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
