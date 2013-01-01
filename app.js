var express = require("express");

var server = express();
server.use(express.cookieParser());
server.use(express.bodyParser());
server.use(express.static('public'));

var serverPort = process.env.PORT || 8899;
var serverHost = process.env.IP || "localhost";

server.get("/", function (req, res) {
    res.render("./index.jade", { layout: false });
});

server.listen(serverPort);
console.log("Running server at: " + serverHost + ":" + serverPort);