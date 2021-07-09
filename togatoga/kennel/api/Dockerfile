FROM golang:latest

WORKDIR /go/src/app

ENV GO111MODULE=on
COPY ./go.mod ./go.sum /go/src/app/
RUN go mod download

EXPOSE 1323

CMD ["go", "run", "main.go"]