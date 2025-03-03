const chatsContainer = document.querySelector(".chats-container");
const promptFrom = document.querySelector(".prompt-form");
const promptInput = promptFrom.querySelector(".prompt-input");

let userMessage = "";

// Function to create message elements
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  userMessage = promptInput.value.trim();
  if (!userMessage) {
    return;
  }

  promptInput.value = "";

  // Generate user message HTML and add in the chats container
  const userMsgHTML = `<p class="message-text"></p>`;
  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);

  setTimeout(() => {
    // Generate bot message HTML and add in the chats container after 600ms
    const botMsgHTML = `
    <img src="assets/img/gemini-chatbot-logo.svg" alt="Gemini" class="avatar">
    <p class="message-text">Just a sec...</p>
    `;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
  }, 600);
};

promptFrom.addEventListener("submit", handleFormSubmit);
