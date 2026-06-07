import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
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

phoneButton.addEventListener("click", () => {
  phoneButton.classList.add("hide");
  flipPhone.classList.add("open");
});

flipPhone.addEventListener("click", () => {
  flipPhone.classList.remove("open");
  phoneButton.classList.remove("hide");
});

appButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const appName = button.dataset.app;

    if (appName === "phone") {
  phoneAppTitle.textContent = "Observer Hotline";
  phoneAppText.innerHTML = `
    <strong>Status:</strong> Available<br><br>
    <strong>Response Hours:</strong><br>
    After hours + weekends<br><br>
    Questions?<br>
    Leave a message in Messages.
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

function loadMessagesApp() {
  phoneAppTitle.textContent = "Messages";

  phoneAppText.innerHTML = `
  <div class="chat-box" id="chatBox"></div>

  <input class="chat-input" id="nicknameInput" type="text" placeholder="Nickname" maxlength="18" />

  <textarea class="chat-message-input" id="messageInput" placeholder="Write a message..." maxlength="160"></textarea>

  <button class="chat-send-btn" id="sendMessageBtn" type="button">Send</button>
`;

  const chatBox = document.getElementById("chatBox");
  const nicknameInput = document.getElementById("nicknameInput");
  const savedNickname = localStorage.getItem("observerNickname");

if (savedNickname) {
  nicknameInput.value = savedNickname;
}
  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "asc"));

  onSnapshot(messagesQuery, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {
      const message = doc.data();

      const messageBubble = document.createElement("div");
      messageBubble.className = "chat-message";
      messageBubble.innerHTML = `
        <strong>${escapeHTML(message.nickname || "Observer")}:</strong>
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
}

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

function vibratePhone() {
  phoneButton.classList.add("vibrate");

  setTimeout(() => {
    phoneButton.classList.remove("vibrate");
  }, 1200);
}

setTimeout(vibratePhone, 1800);
