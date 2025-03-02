const promptFrom = document.querySelector(".prompt-form");
const promptInput = promptFrom.querySelector(".prompt-input");

let userMessage = "";

// Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  userMessage = promptInput.value.trim();
  if (!userMessage) {
    return;
  }

  console.log(userMessage);
};

promptFrom.addEventListener("submit", handleFormSubmit);
