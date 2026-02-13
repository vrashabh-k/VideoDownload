document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("downloadBtn");

  btn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const API = "https://videodownload-tqg9.onrender.com";

    try {
      const start = await fetch(
        `${API}/start?url=` + encodeURIComponent(tab.url)
      );

      const { id } = await start.json();

      chrome.tabs.create({
        url: `${API}/file/${id}`
      });

    } catch (err) {
      console.error("Download error:", err);
      alert("Server not reachable");
    }
  });
});
