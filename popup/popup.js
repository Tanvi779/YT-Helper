document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("videoTitle");
  const viewsEl = document.getElementById("views");
  const channelEl = document.getElementById("channel");
  const timestampsEl = document.getElementById("timestamps");
  const notesEl = document.getElementById("notes");

  let currentVideoId = null;

  function fetchData() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      chrome.tabs.sendMessage(tab.id, { action: "getInsights" }, (res) => {
        if (!res) return;

        titleEl.textContent = res.title;
        viewsEl.textContent = res.views;
        channelEl.textContent = res.channel;
        currentVideoId = res.videoId;

        timestampsEl.innerHTML = "";

        res.timestamps.forEach((t) => {
          const li = document.createElement("li");
          const a = document.createElement("a");

          a.textContent = t.label;
          a.href = t.url;
          a.target = "_blank";

          li.appendChild(a);
          timestampsEl.appendChild(li);
        });

        chrome.tabs.sendMessage(
          tab.id,
          { action: "getNote", videoId: currentVideoId },
          (note) => {
            notesEl.value = note || "";
          }
        );
      });
    });
  }

  document.getElementById("primaryBtn").onclick = fetchData;

  document.getElementById("focusBtn").onclick = () => {
    chrome.tabs.query({ active: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleFocus" });
    });
  };

  document.getElementById("saveNote").onclick = () => {
  const saveBtn = document.getElementById("saveNote");
  
  chrome.tabs.query({ active: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "saveNote",
      videoId: currentVideoId,
      note: notesEl.value
    });

    saveBtn.textContent = "Saved ✅";    
    saveBtn.disabled = true;            

    setTimeout(() => {
      saveBtn.textContent = "Save Note";
      saveBtn.disabled = false;
    }, 1500);
  });
  };

  document.getElementById("refresh").onclick = fetchData;

  fetchData();
});