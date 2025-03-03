const chatsContainer = document.querySelector(".chats-container");
const promptFrom = document.querySelector(".prompt-form");
const promptInput = promptFrom.querySelector(".prompt-input");

// API Setup
const API_KEY = "AIzaSyDpOGY-5XqcUCtj14wRcnvLIe8umTN2g34";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = []; // Menempatkan semua pesan bot dan user agar bot dapat tahu pesan sebelumnya

// Function to create message elements
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");

  // Add user message to the chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // Template saat menggunakan API
  try {
    // Send the chat history to the API to get a response
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error.message);
    }

    console.log(data);
    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    textElement.textContent = responseText;
  } catch (error) {
    console.log(error);
  }
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
    generateResponse(botMsgDiv);
  }, 600);
};

promptFrom.addEventListener("submit", handleFormSubmit);
