appButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const app = button.dataset.app;

    if (app === "phone") {
      phoneAppTitle.textContent = "Observer Hotline";
      phoneAppText.innerHTML = `
        <strong>Status:</strong> Available<br><br>
        Questions?<br>
        Leave a message in Messages.
      `;
    }

    if (app === "messages") {
      phoneAppTitle.textContent = "Messages";
      phoneAppText.innerHTML = `
        <strong>Observer Chatroom</strong><br><br>
        Firebase chat will be added here next.
      `;
    }

    if (app === "notices") {
      phoneAppTitle.textContent = "Notices";
      phoneAppText.innerHTML = `
        <strong>NEW ENTRY:</strong><br>
        Welcome to Ordinary Things<br><br>
        Posted June 6, 2026
      `;
    }
  });
});

function vibratePhone() {
  phoneButton.classList.add("vibrate");

  setTimeout(() => {
    phoneButton.classList.remove("vibrate");
  }, 1200);
}

setTimeout(vibratePhone, 1800);
