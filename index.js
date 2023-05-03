//this is the web server!
const express = require("express");
const server = express();

//all the fun cors stuff!
//enable cross-origin resource  sharing to proxy api requests
const cors = require("cors");
server.use(cors());

//create logs for everything:
const morgan = require("morgan");
server.use(morgan("dev"));

//handle application/json requests:
server.use(express.json());

//here's our api:
server.use("/api", require("./api"));

//error handler:
server.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message,
    });
});

//404 handler:
server.use("*", (req, res, next) => {
    res.send(
        `<div>
            <h1>404, this page doesn't exist</h1>
        </div>`
    );
});

//bring in db connection:
const client = require("./db/client");

//connect to the server:
const PORT = process.env.PORT || 4000;

//define a server handle to close open tcp connection after unit tests have run
server.listen(PORT, async() => {
    console.log(`Server is running on port ${PORT}!`);
    try{
        await client.connect();
        console.log("Database is open for business!");
    }catch(error){
        console.error("Database is closed for repairs! \n", error);
    }
})

