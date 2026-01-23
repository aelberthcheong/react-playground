/**
 * Live reload client with status HUD
 */

(() => {
    /* ---------- HUD ---------- */
    const hud = document.createElement("div");
    hud.style.position = "fixed";
    hud.style.bottom = "12px";
    hud.style.right = "12px";
    hud.style.padding = "6px 10px";
    hud.style.fontFamily = "monospace";
    hud.style.fontSize = "12px";
    hud.style.background = "rgba(0,0,0,0.75)";
    hud.style.color = "#a3e635";
    hud.style.border = "1px solid #3f3f46";
    hud.style.borderRadius = "6px";
    hud.style.zIndex = "9999";
    hud.style.pointerEvents = "none";

    hud.textContent = "reload: connecting…";
    document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(hud);
    });

    function setStatus(text, color) {
        hud.textContent = text;
        if (color) hud.style.color = color;
    }

    /* ---------- SSE ---------- */
    const source = new EventSource("/__reload");

    source.onopen = () => {
        setStatus("reload: connected", "#22c55e");
    };

    source.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "reload") {
            const time = new Date(data.time).toLocaleTimeString();
            setStatus(`reload: ${data.file} @ ${time}`, "#a3e635");

            console.log("[reload]", data.file);
            location.reload();
        }
    };

    source.onerror = () => {
        setStatus("reload: disconnected", "#ef4444");
    };
})();
