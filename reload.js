/**
 * Live Reload Client
 * 
 * Script ini menghubungkan browser ke websocket server,
 * Ketika server mendeteksi perubahan file, browser akan otomatis refresh.
 */
if ("WebSocket" in window) {
    (() => {
        function setHud(msg, color) {
            if (!hud) return;
            hud.textContent = msg;
            if (color) hud.style.color = color;
        }

        // reload halaman dan wrap dengan flag `reloading`
        // untuk mencegah reload ganda.
        function triggerReload() {
            if (reloading) return;
            reloading = true;
            setHud("reloading...", "#eab308");
            location.reload();
        }

        let hud;
        document.addEventListener("DOMContentLoaded", () => {
            const hud = document.createElement("div");
            hud.style.position      = "fixed";
            hud.style.bottom        = "12px";
            hud.style.right         = "12px";
            hud.style.padding       = "6px 10px";
            hud.style.fontFamily    = "monospace";
            hud.style.fontSize      = "12px";
            hud.style.background    = "rgba(0,0,0,0.75)";
            hud.style.border        = "1px solid #3f3f46";
            hud.style.borderRadius  = "6px";
            hud.style.zIndex        = "999";
            hud.style.pointerEvents = "none";
            hud.style.color         = "#a3e635";

            document.body.appendChild(hud);
            setHud("connecting...");
        });

        let socket;            // instance WebSocket
        let retries = 0;       // # percobaan reconnect
        let reloading = false; // flag untuk cegah reload berulang berkali-kali

        /**
         * Menginisialisasi dan mengelola koneksi WebSocket
         * Menggunakan exponential backoff (naive) untuk reconnect
         */
        function connect() {

            // Tentukan protocol berdasarkan protocol halaman (http/https)
            const protocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
            const address  = protocol + location.host + "/ws";

            socket = new WebSocket(address);

            // koneksi berhasil
            socket.onopen = () => {
                retries = 0;
                setHud("connected", "#22c55e");
                socket.send("connected");
            };
            
            // menerima pesan dari server
            socket.onmessage = (msg) => {
                switch (msg.data) {
                    case "connected":
                    setHud("connected", "#22c55e");
                    break;

                    case "reload":
                    triggerReload();
                    break;

                    case "error":
                    setHud("error", "#ef4444");
                    break;
                }
            };

            // koneksi terputus
            socket.onclose = () => {
                setHud("disconnected", "#ef4444");

                const delay = Math.min(1000 * 2 ** retries, 10_000);
                retries++;

                setTimeout(connect, delay);
            };

            // error pada waktu koneksi
            socket.onerror = () => socket.close();
        }

        if (sessionStorage && !sessionStorage.getItem("live-reload-active")) {
            console.log("Live reload mulai.");
            sessionStorage.setItem("live-reload-active", true);
        }

        connect();
    })();
}
else console.error(
    "Perbarui browser anda. Browser anda saat ini tidak mendukung Websocket API."+
    "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#browser_compatibility"
);