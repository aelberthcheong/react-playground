#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const port = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
};

const server = http.createServer((req, res) => {

    // handle GET __live_reload 
    if (req.url === "/__live_reload.js") {
        res.writeHead(200, {
            "Content-Type": "application/javascript",
            "Cache-Control": "no-store",
        });
        return fs.createReadStream(
            path.join(__dirname, "reload.js")
        ).pipe(res);
    }

    // normalisasikan URL
    const urlPath = req.url === "/" ? "/index.html" : req.url;
    const resolvedPath = path.resolve(root, "." + urlPath);

    // cek keberadaan file nya pada root
    let stat;
    try {
        stat = fs.statSync(resolvedPath);
    } catch {
        res.writeHead(404);
        return res.end("Not found");
    }

    // if (stat.isDirectory()) {
    //     const indexFile = path.join(resolvedPath, "index.html");

    //     if (fs.existsSync(indexFile)) {
    //         let html = fs.readFileSync(indexFile, "utf8");
    //         html = injectClient(html);

    //         res.writeHead(200, {
    //             "Content-Type": "text/html",
    //             "Cache-Control": "no-store",
    //         });
    //         return res.end(html);
    //     }

    //     const html = renderDirListing(resolvedPath, urlPath);
    //     res.writeHead(200, {
    //         "Content-Type": "text/html",
    //         "Cache-Control": "no-store",
    //     });
    //     return res.end(html);
    // }

    // handle directory
    if (stat.isDirectory()) {
        res.writeHead(404);
        return res.end("Not found");
    }

    const ext = path.extname(resolvedPath);
    const contentType =
        mimeTypes[ext] || "application/octet-stream";

    res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store", // jangan di cache
    });

    // injeksi ke dalam html yg di serve
    if (ext === ".html") {
        let html = fs.readFileSync(resolvedPath, "utf8");
        html = inject(html);
        return res.end(html);
    }

    fs.createReadStream(resolvedPath).pipe(res);
});

// function renderDirListing(dir, url) {
//     const entries = fs.readdirSync(dir, { withFileTypes: true });

//     const items = entries
//         .filter(e => !e.name.startsWith("."))
//         .map(e => {
//             const slash = e.isDirectory() ? "/" : "";
//             const href = path.posix.join(url, e.name) + slash;
//             return `
//                 <li>
//                     <a href="${href}">${e.name}${slash}</a>
//                 </li>
//             `;
//         })
//         .join("");

//     // ini layout nya, berdasarkan layout directory listing firefox
//     return inject(`
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="utf-8" />
//             <title>Index of ${url}</title>
//             <style>
//                 body { font-family: system-ui, sans-serif; padding: 2rem }
//                 ul { list-style: none; padding: 0 }
//                 li { margin: .25rem 0 }
//                 a { text-decoration: none; color: #0366d6 }
//                 a:hover { text-decoration: underline }
//             </style>
//         </head>
//         <body>
//             <h1>Index of ${url}</h1>
//             <ul>${items}</ul>
//         </body>
//         </html>
//     `);
// }

function inject(html) {
    const injection = `<script src="/__live_reload.js"></script>\n</body>`;
    if (html.includes("/__live_reload.js")) return html;
    return html.replace("</body>", injection);
}

function openBrowser(url) {
    const command = 
        process.platform === "win32" ? `start ${url}` : // windows
        process.platform === "darwin" ? `open ${url}` : // macos
        `xdg-open ${url}`;                              // linux (setidaknya ubuntu bisa ku-vouch)

    exec(command);
}

const wss = new WebSocketServer({ server, path: "/ws" });

let isConnected = false;
wss.on("connection", (ws) => {
    ws.send("connected");

    if (!isConnected) {
        isConnected = true;
        const time = new Date().toLocaleTimeString("id-ID");
        console.log(`\x1b[34m${time}\x1b[0m \x1b[33m@ server terkoneksi.\x1b[0m`);
    }

    ws.on("error", () => { });
});

let debounceTimer = null;
const watcher = chokidar.watch(root, {
    ignored: /node_modules|\.git/,
    ignoreInitial: true,
});

watcher.on("change", (file) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const time = new Date().toLocaleTimeString("id-ID");
        console.log(`\x1b[34m${time}\x1b[0m \x1b[33m@ reload ${path.relative(root, file)}\x1b[0m`);

        for (const client of wss.clients) {
            if (client.readyState === client.OPEN)
                client.send("reload");
        }
    }, 50);
});

server.listen(port, () => {
    const url = new URL(`http://localhost:${port}`);
    console.log(`Server running at \x1b[36m${url}\x1b[0m`);
    openBrowser(url);
});