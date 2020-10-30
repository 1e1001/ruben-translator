var http = require('http'),
  url = require('url'),
  fs = require('fs'),
  os = require('os'),
  path = require('path');

var fileExtensions = JSON.parse(fs.readFileSync("./extensions.json", { encoding: "utf-8" }));

var port = 8000

var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias + ": " + iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname + ': ' + iface.address);
    }
    ++alias;
  });
});

process.on('SIGINT', function() {
  server.close();
  console.log(" Caught! Exiting...");
  process.exit(0);
});

var lastIp = "";

var server = http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
  /*if (q.pathname === "/exit") {
    res.end("closed");
    server.close();
    process.exit(0);
  }*/
  var filename = path.join("./", q.pathname);
  var newIp = req.connection.remoteAddress.toString();
  if (newIp !== lastIp) {
    lastIp = newIp;
    console.log("From " + newIp);
  }
  console.log(filename + " " + req.method);
  if (req.method === "POST") {
    var body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var data = JSON.parse(Buffer.concat(body).toString()),
        request = data.request;
      data = data.data;
    });
  } else if (req.method === "GET") {
    fs.stat(filename, function (err, stats) {
      if (res.err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("404 Not Found: res error");
        //throw res.err;
        return;
      }
      if (stats === undefined) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end("404 Not Found: stats error");
      }
      console.log(stats.size + "B");
      fs.readFile(filename, function (err, data) {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end("404 Not Found: fs error");
          //throw err;
          return;
        }
        var i = filename.split(".");
        res.writeHead(200, { 'Content-Type': fileExtensions[i[i.length - 1]] || 'text/plain' });
        res.write(data);
        return res.end();
      });
    });
  }
}).listen(port);
console.log("running on port " + port);
