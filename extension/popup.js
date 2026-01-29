document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("downloadBtn");

  btn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const start = await fetch(
      "http://localhost:3000/start?url=" +
        encodeURIComponent(tab.url)
    );

    const { id } = await start.json();

    chrome.tabs.create({
      url: "http://localhost:3000/file/" + id
    });
  });
});
