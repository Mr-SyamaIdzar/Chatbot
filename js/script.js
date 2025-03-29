const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptFrom = document.querySelector(".prompt-form");
const promptInput = promptFrom.querySelector(".prompt-input");
const fileInput = promptFrom.querySelector("#file-input");
const fileUploadWrapper = promptFrom.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// API Setup
const API_KEY = "AIzaSyDpOGY-5XqcUCtj14wRcnvLIe8umTN2g34";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let typingInterval, controller;
const chatHistory = []; // Menempatkan semua pesan bot dan user agar bot dapat tahu pesan sebelumnya
const userData = { message: "", file: {} };

// Function to create message elements
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Scroll to the bottom of the container
// top: Posisi vertikal scroll yang ingin dicapai. Dalam hal ini, container.scrollHeight digunakan untuk menggulir ke bagian paling bawah.
const scrollToBottom = () =>
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Simulate typing effect for bot reponses
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" "); // Memisahkan teks menjadi array kata-kata menggunakan spasi sebagai pemisah.
  let wordIndex = 0;

  // Set an interval to type each word
  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      scrollToBottom(); //  Digunakan untuk menggulir halaman ke bagian bawah setelah teks ditambahkan.
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  }, 40);
};

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  // Add user message and file to the chat history
  chatHistory.push({
    role: "user",
    // Include the attached file data along with message in chat history, aligned Gemini required parameters
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [
            {
              inline_data: (({ fileName, isImage, ...rest }) => rest)(
                userData.file
              ),
            },
          ]
        : []),
    ],
  });

  // Template saat menggunakan API
  try {
    // Send the chat history to the API to get a response
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Menetapkan tipe konten sebagai application/json
      body: JSON.stringify({ contents: chatHistory }), // Mengirim riwayat chat (chatHistory) sebagai JSON.
      signal: controller.signal, // Attaching the controller to terminate the fatch request when the "Stop Response" button is clicked
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

    chatHistory.push({
      role: "model",
      // Include the attached file data along with message in chat history, aligned Gemini required parameters
      parts: [{ text: responseText }],
    });
  } catch (error) {
    textElement.style.color = "#d62939";
    textElement.textContent =
      error.name === "AbortError"
        ? "Response generation stopped."
        : error.message;
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    scrollToBottom();
  } finally {
    userData.file = {};
  }
};

// Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  // Jika inputan kosong atau saat program sedang berjalan, tombol send tidak mengrimikan perintah yang baru sebelum yang lama selesai
  if (!userMessage || document.body.classList.contains("bot-responding")) {
    return;
  }

  promptInput.value = "";
  userData.message = userMessage; // Adding the user message in the userData object
  document.body.classList.add("bot-responding");
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached"); // Hiding the file preview once the message is sent

  // Generate user message HTML and add in the chats container
  const userMsgHTML = `<p class="message-text"></p> ${
    userData.file.data // Adding the attachment in the message whether it's img or other file
      ? userData.file.isImage
        ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment">`
        : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
      : ""
  }`;

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

// Handle file input change (file upload)
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Display the file preview in the prompt input
  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    // Clearing the file input so users can select the same file if they previously selescted and canceled it
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1]; // Gemini only receives the base64 string on the file
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add(
      "active",
      isImage ? "img-attached" : "file-attached"
    );

    // Storefile data in userData obj
    userData.file = {
      fileName: file.name,
      data: base64String,
      mime_type: file.type,
      isImage,
    };
  };
});

// BUTTON FUNCTION

// Cancle file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  // Clearing the file data once the upload is canceled or the response is generated
  userData.file = {};
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
});

// Stop ongoing bot response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  // Clearing the file data once the upload is canceled or the response is generated
  userData.file = {};
  controller?.abort();
  clearInterval(typingInterval);
  chatsContainer
    .querySelector(".bot-message.loading")
    .classList.remove("loading");
  document.body.classList.remove("bot-responding");
});

// Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatsContainer.innerHTML = "";
  document.body.classList.remove("bot-responding");
});

themeToggle.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme");
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode"; // Mengubah icon
});

promptFrom.addEventListener("submit", handleFormSubmit);
// Trigger the file input click when the add file button is clicked
promptFrom
  .querySelector("#add-file-btn")
  .addEventListener("click", () => fileInput.click());
