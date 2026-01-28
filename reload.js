/**
 * Live Reload Client
 * 
 * Script ini menghubungkan browser ke websocket server,
 * Ketika server mendeteksi perubahan file, browser akan otomatis refresh.
 */
if ("WebSocket" in window) {
    (() => {
        // reload halaman dan wrap dengan flag `reloading`
        // untuk mencegah reload ganda.
        function triggerReload() {
            if (reloading) return;
            reloading = true;
            location.reload();
        }

        let socket;            // instance WebSocket
        let retries = 0;       // # percobaan reconnect
        let reloading = false; // flag untuk cegah reload berulang berkali-kali

        /**
         * Menginisialisasi dan mengelola koneksi WebSocket
         * Menggunakan exponential backoff untuk reconnect
         */
        function connect() {

            // Tentukan protocol berdasarkan protocol halaman (http/https)
            const protocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
            const address  = protocol + location.host + "/ws";

            socket = new WebSocket(address);

            // koneksi berhasil
            socket.onopen = () => {
                retries = 0;
                socket.send("connected");
            };
            
            // menerima pesan dari server
            socket.onmessage = (msg) => {
                switch (msg.data) {
                    // case "connected":
                    // break;

                    case "reload":
                    triggerReload();
                    break;

                    case "error":
                    console.error(msg.data);
                    break;
                }
            };

            // koneksi terputus
            socket.onclose = () => {
                const delay = Math.min(1000 * 2 ** retries, 10_000);
                retries++;

                setTimeout(connect, delay);
            };

            // Supress error logging
            socket.onerror = () => {
                // silent - onclose akan handle reconnection
            };
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