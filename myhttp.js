// Name: Madisyn McFarlane
// https://nodejs.org/api/http.html
//
// This example uses a named function incoming() for the callback function
// sent to the createServer() method.

var http = require("http");
var fs = require('fs');

// YOU BETTER AT LEAST CHANGE THIS MANUALLY BEFORE TESTING!!!!!!!!
var port = 5555;
const MINPORT = 5000;
const MAXPORT = 35000;
const REPART1 = /^\/UNLINK\/[A-Z\/]*[a-zA-Z0-9_]*\.(txt|html|mp3|jpg)$/;
const REPART2 = /^\/SIZE\/[A-Z\/]*[a-zA-Z0-9_]*\.(txt|html|mp3|jpg)$/; 
const REPART3 = /^\/FETCH\/[A-Z\/]*[a-zA-Z0-9_]*\.(txt|html|mp3|jpg)$/; 
const WORKDIRECTORY = "WEBSERVER/";
const VALIDEXT = [
	["txt", "text/plain"],
	["html", "text/html"],
	["mp3", "audio/mps"],
	["jpg", "image/jpeg"]
];
const VLENGTH = 4;

function randomPort(min, max){
	var rand = Math.round(Math.random()*(max-min)) + min;
	console.log("Listening on http://localhost:" + rand + "\n");
	return rand;
}

function doRemove(url, response){
	response.setHeader('Content-Type', 'text/plain');
	fs.unlink(url, (err) => {
		if (err){
			response.statusCode = 403;
			response.write("ERROR: could not unlink file " + url + "\n");
			response.end();
		}
		else{
			response.write("UNLINK: the URL " + url + " was removed. \n");
			response.end();
		}
	});
}

function doSize(url, response){
	response.setHeader('Content-Type', 'text/plain');
	fs.stat(url, function(err, stats){
		if (err){
			response.statusCode = 403;
			response.write("ERROR: could not stat file " + url + "\n");
			response.end();
		}
		else{
			response.write("STAT: the URL " + url+ " size is " + stats.size + "\n");
			response.end();
		}
	});
}

function doFetch(url, response){
	var headerType = '';
	for(var i=0; i<VLENGTH; i++){
		if(url.includes(VALIDEXT[i][0])){
			response.setHeader('Content-Type', VALIDEXT[i][1]);
		}
	}

	fs.readFile(url, (err, data) => {
		if (err){
			response.statusCode = 403;
			response.write("ERROR: unable to fetch URL " + url + "\n");
			response.end();
		}
		else{
			response.write(data);
			response.end();
		}
	});
}

function incoming(request, response) {
	var xurl = request.url;
	console.log("Incoming request with the URL: " + xurl + "\n");

	if(REPART1.test(xurl) == true){
		var url = WORKDIRECTORY + xurl.substring(8);
		doRemove(url, response);
	}
	else if(REPART2.test(xurl) == true){
		var url = WORKDIRECTORY + xurl.substring(6);
		doSize(url, response);
	}
	else if(REPART3.test(xurl) == true){
		var url = WORKDIRECTORY + xurl.substring(7);
		doFetch(url, response);
	}
	else{
		response.statusCode = 403;
		response.write("INVALID URL: " + xurl + "\n");
		response.end();
	}

}

// create a server, passing it the event function
var server = http.createServer(incoming);
port = randomPort(MINPORT, MAXPORT);

// try to listen to incoming requests.
// each incoming request should invoke incoming()
try {
	server.on('error', function(e) {
		console.log("Error! "+e.code);
	}); // server.on()
	server.listen(port);
	console.log("Listening.....");
} catch (error) {
	console.log("server error");
} // try
