const container = document.querySelector(".container");
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

// Scroll to the bottom of the container
// top: Posisi vertikal scroll yang ingin dicapai. Dalam hal ini, container.scrollHeight digunakan untuk menggulir ke bagian paling bawah.
const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth"})

// Simulate typing effect for bot reponses
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" "); // Memisahkan teks menjadi array kata-kata menggunakan spasi sebagai pemisah.
  let wordIndex = 0;

  // Set an interval to type each word
  const typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      botMsgDiv.classList.remove("loading");
      scrollToBottom(); //  Digunakan untuk menggulir halaman ke bagian bawah setelah teks ditambahkan.
    } else {
      clearInterval(typingInterval);
    }
  }, 40);
};

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");

  // Add user message to the chat history
  // Menambahkan pesan pengguna ke array chatHistory dengan format yang sesuai untuk dikirim ke API.
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // Template saat menggunakan API
  try {
    // Send the chat history to the API to get a response
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Menetapkan tipe konten sebagai application/json
      body: JSON.stringify({ contents: chatHistory }), // Mengirim riwayat chat (chatHistory) sebagai JSON.
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error.message);
    }

    // Process the response text and display with typing effect
    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Menghapus tanda ** (bold markdown) dari teks menggunakan regex.
      .trim();
    typingEffect(responseText, textElement, botMsgDiv);
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
  scrollToBottom();

  setTimeout(() => {
    // Generate bot message HTML and add in the chats container after 600ms
    const botMsgHTML = `
    <img src="assets/img/gemini-chatbot-logo.svg" alt="Gemini" class="avatar">
    <p class="message-text">Just a sec...</p>
    `;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom(); // Saat menginput perintah langsung otomatis scroll ke bawah
    generateResponse(botMsgDiv);
  }, 600);
};

promptFrom.addEventListener("submit", handleFormSubmit);
