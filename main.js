import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRc7008yHYApRVTMIqvt-ao789uvlwgTU",
  authDomain: "officemuse-messenger.firebaseapp.com",
  projectId: "officemuse-messenger",
  storageBucket: "officemuse-messenger.firebasestorage.app",
  messagingSenderId: "1089537013433",
  appId: "1:1089537013433:web:e9f5b6cc75cdb38f2b8d68"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const phoneButton = document.getElementById("phoneButton");
const flipPhone = document.getElementById("flipPhone");

const appButtons = document.querySelectorAll(".phone-app-btn");
const phoneAppTitle = document.getElementById("phoneAppTitle");
const phoneAppText = document.getElementById("phoneAppText");

phoneButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  phoneButton.classList.add("hide");
  flipPhone.classList.add("open");
});

flipPhone.addEventListener("click", (event) => {
  if (event.target.closest("button, input, textarea")) return;

  flipPhone.classList.remove("open");
  phoneButton.classList.remove("hide");
});

appButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const appName = button.dataset.app;

    if (appName === "phone") {
      phoneAppTitle.textContent = "The Unfinished Chapter";
      phoneAppText.innerHTML = `
<strong>Status:</strong> Available<br><br>
<strong>Response Hours:</strong><br>
After hours + weekends<br><br>
Questions?<br>
Leave a message in Chapter Notes.
`;
    }

    if (appName === "messages") {
      loadMessagesApp();
    }

    if (appName === "notices") {
      phoneAppTitle.textContent = "Notices";
      phoneAppText.innerHTML = `
        <strong>NEW ENTRY POSTED</strong><br><br>
        Welcome to Ordinary Things<br><br>
        <strong>Newest Update:</strong><br>
        June 6, 2026
      `;
    }
  });
});

function loadMessagesApp() {
  phoneAppTitle.textContent = "Chapter Notes";

  phoneAppText.innerHTML = `
    <div class="chat-box" id="chatBox"></div>

    <input class="chat-input" id="nicknameInput" type="text" placeholder="Nickname" maxlength="30" />

    <textarea class="chat-message-input" id="messageInput" placeholder="Write a message..." maxlength="160"></textarea>

    <button class="chat-send-btn" id="sendMessageBtn" type="button">Send</button>
  `;

  const chatBox = document.getElementById("chatBox");
  const nicknameInput = document.getElementById("nicknameInput");
  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  const savedNickname = localStorage.getItem("observerNickname");

  if (savedNickname) {
    nicknameInput.value = savedNickname;
  }

  const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "asc"));

  onSnapshot(messagesQuery, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {
      const message = doc.data();

      const messageBubble = document.createElement("div");
      messageBubble.className = "chat-message";
      messageBubble.innerHTML = `
  <strong>${escapeHTML(message.nickname || "Guest")}</strong>
  <span>${escapeHTML(message.text || "")}</span>
`;

      chatBox.appendChild(messageBubble);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });

  sendMessageBtn.addEventListener("click", async (event) => {
    event.stopPropagation();

    const nickname = nicknameInput.value.trim() || "Observer";
    const text = messageInput.value.trim();

    if (!text) return;

    localStorage.setItem("observerNickname", nickname);

    await addDoc(collection(db, "messages"), {
      nickname,
      text,
      createdAt: serverTimestamp(),
      userId: "visitor"
    });

    messageInput.value = "";
  });

  nicknameInput.addEventListener("click", (event) => event.stopPropagation());
  messageInput.addEventListener("click", (event) => event.stopPropagation());
  sendMessageBtn.addEventListener("click", (event) => event.stopPropagation());
}

const commentSections = document.querySelectorAll(".post-comments");

commentSections.forEach((section) => {
  const postId = section.dataset.postId;
  const commentList = section.querySelector(".comment-list");
  const nameInput = section.querySelector(".comment-name");
  const textInput = section.querySelector(".comment-text");
  const sendButton = section.querySelector(".comment-send");

  const commentsQuery = query(
    collection(db, "postComments", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  onSnapshot(commentsQuery, (snapshot) => {
    commentList.innerHTML = "";

    snapshot.forEach((doc) => {
      const comment = doc.data();

      const bubble = document.createElement("div");
      bubble.className = "comment-bubble";
      bubble.innerHTML = `
        <strong>${escapeHTML(comment.name || "Guest")}</strong>
        <span>${escapeHTML(comment.text || "")}</span>
      `;

      commentList.appendChild(bubble);
    });
  });

  sendButton.addEventListener("click", async () => {
    const name = nameInput.value.trim() || "Guest";
    const text = textInput.value.trim();

    if (!text) return;

    await addDoc(collection(db, "postComments", postId, "comments"), {
      name,
      text,
      createdAt: serverTimestamp()
    });

    textInput.value = "";
  });
});

const commentCounters = document.querySelectorAll(".comment-count");

commentCounters.forEach((counter) => {
  const postId = counter.dataset.postId;

  const commentsQuery = query(
    collection(db, "postComments", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  onSnapshot(commentsQuery, (snapshot) => {
    counter.textContent = snapshot.size;
  });
});

const likeButtons = document.querySelectorAll(".like-btn");

likeButtons.forEach((button) => {
  const postId = button.dataset.postId;
  const countSpan = button.querySelector(".like-count");
  const likeRef = doc(db, "postLikes", postId);

  onSnapshot(likeRef, (snapshot) => {
    if (snapshot.exists()) {
      countSpan.textContent = snapshot.data().count || 0;
    } else {
      countSpan.textContent = 0;
    }
  });

  button.addEventListener("click", async () => {
    button.classList.add("liked");

    await setDoc(
      likeRef,
      {
        count: increment(1)
      },
      { merge: true }
    );
  });
});

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, (match) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[match];
  });
}

const tabButtons = document.querySelectorAll(".tab-btn");
const postCards = document.querySelectorAll(".blog-file");

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelectorAll(".blog-file").forEach((post) => {
      const category = post.dataset.category;

      if (filter === "all" || category === filter) {
        post.style.display = "";
      } else {
        post.style.display = "none";
      }
    });
  });
});

const followBtn = document.getElementById("followBtn");
const askBtn = document.getElementById("askBtn");
const archiveBtn = document.getElementById("archiveBtn");

if (followBtn) {
  followBtn.addEventListener("click", () => {
    followBtn.textContent = "Following";
    followBtn.disabled = true;
  });
}

if (askBtn) {
  askBtn.addEventListener("click", () => {
    alert("Ask box coming soon.");
  });
}

if (archiveBtn) {
  archiveBtn.addEventListener("click", () => {
    window.scrollTo({
      top: document.querySelector(".feed-area").offsetTop,
      behavior: "smooth"
    });
  });
}

function vibratePhone() {
  phoneButton.classList.add("vibrate");

  setTimeout(() => {
    phoneButton.classList.remove("vibrate");
  }, 1200);
}

setTimeout(vibratePhone, 1800);

var tabButtons = document.querySelectorAll(".tab-btn");
var postCards = document.querySelectorAll(".blog-file");

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelectorAll(".blog-file").forEach((post) => {
      const category = post.dataset.category;
      post.style.display = filter === "all" || category === filter ? "" : "none";
    });
  });
});

const followBtn = document.getElementById("followBtn");
const askBtn = document.getElementById("askBtn");
const archiveBtn = document.getElementById("archiveBtn");

if (followBtn) {
  followBtn.addEventListener("click", () => {
    followBtn.textContent = "Following";
    followBtn.disabled = true;
  });
}

if (askBtn) {
  askBtn.addEventListener("click", () => {
    alert("Ask box coming soon.");
  });
}

if (archiveBtn) {
  archiveBtn.addEventListener("click", () => {
    window.scrollTo({
      top: document.querySelector(".feed-area").offsetTop,
      behavior: "smooth"
    });
  });
}
