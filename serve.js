#!/usr/bin/env node

/**
 * 
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = 3000
const ROOT = process.cwd(); // current working directory

let clients = [];

// common media types
// htstps://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
const MIMETYPES = {
    ".html": "text/html",
    ".js"  : "application/javascript",
    ".css" : "text/css",
    ".json": "application.json",
    ".png" : "image/png",
    ".jpg" : "image/jpg",
    ".svg" : "image/svg+xml",
};

const server = http.createServer((req, res) => {
    if (req.url === "/__reload") {
        res.writeHead(200, {
            "content-type" : "text-event-stream",
            "cache-control": "no-cache",
            connection     : "keep-alive",
        })

        res.write("\n");
        clients.push(res);

        req.on("close", () => {
            clients = clients.filter(c => c !== res);
        });

        return;
    }

    // serve static files
    const filePath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url);
    const fullPath = path.join(ROOT, filePath);

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(400);
            res.end("Not Found");
            return;
        }

        const ext = path.extname(fullPath);
        res.writeHead(200, {
            "content-type": MIMETYPES[ext] || "application/octet-stream",
        });
        res.end(data);
    });

});

fs.watch(ROOT, { recursive: true }, (_, filename) => {
    if (!filename) return;

    console.log(`[reload] ${filename}`);
    clients.forEach(res => {
        res.write("data: reload\n\n");
    });
});

server.listen(PORT, () => {
    console.log(`react-playground running at http://localhost:${PORT}`);
});