/**
 * 
 * 
 */
if ("WebSocket" in window) {
    (() => {
        function setHud(msg, color) {
            if (!hud) return;
            hud.textContent = msg;
            if (color) hud.style.color = color;
        }

        function triggerReload() {
            if (reloading) return;
            reloading = true;
            setHud("reloading...", "#eab308");
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

        let socket;
        let retries = 0;
        let reloading = false;

        function connect() {
            const protocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
            const address  = protocol + location.host + "/ws";
            socket = new WebSocket(address);

            socket.onopen = () => {
                retries = 0;
                setHud("connected", "#22c55e");
                socket.send("connected");
            };
            
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

            socket.onclose = () => {
                setHud("disconnected", "#ef4444");

                const delay = Math.min(1000 * 2 ** retries, 10_000);
                retries++;

                setTimeout(connect, delay);
            };

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