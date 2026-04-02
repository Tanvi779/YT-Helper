console.log("✅ content script loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === "getInsights") {
    sendResponse({
      ...getVideoInfo(),
      timestamps: getTimestamps(),
      videoId: getVideoId()
    });
  }

  if (msg.action === "toggleFocus") {
    toggleFocusMode();
  }

  if (msg.action === "saveNote") {
    saveNote(msg.videoId, msg.note);
  }

  if (msg.action === "getNote") {
    getNote(msg.videoId, sendResponse);
    return true;
  }
});

// ------------- FUNCTIONS ----------------
 
function getVideoInfo() {
  const player = document.getElementById("movie_player");

  const videoData =
    player && typeof player.getVideoData === "function"
      ? player.getVideoData()
      : {};

  const title = videoData.title || document.title;
  const channel =
    videoData.author ||
    document.querySelector("ytd-channel-name a")?.innerText ||
    "--";

  const viewsText =
    document.querySelector("ytd-video-view-count-renderer span")
      ?.innerText || "";

  const views = viewsText.match(/\d+/g)?.join("") || "--";

return { title, channel, views};
}

function getTimestamps() {
  const links = document.querySelectorAll("#description a");
  const timestamps = [];

  links.forEach((a) => {
    const text = a.innerText;
    if (text.match(/\d+:\d+/)) {
      timestamps.push({
        label: text,
        url: a.href,
      });
    }
  });

  return timestamps;
}

function toggleFocusMode() {
  const sidebar = document.querySelector("#related");
  const comments = document.querySelector("#comments");

  if (sidebar) {
    sidebar.classList.toggle("hidden");
  }

  if (comments) {
    comments.classList.toggle("hidden");
  }
}

function saveNote(videoId, note) {
  chrome.storage.local.set({[videoId]: note });
}

function getNote(videoId, cb) {
  chrome.storage.local.get([videoId], (res) => {
    cb(res[videoId] || "");
  });
}

function getVideoId() {
  return new URLSearchParams(window.location.search).get("v");
}

let lastUrl = location.href;

new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("🔄 YouTube navigated:", lastUrl);
  }
}).observe(document, { subtree: true, childList: true }); 
