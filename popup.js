// Event listener for button click
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("logButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ name: "extractEmailBody" }, (response) => {
      if (response && response.emailContent) {
        chrome.runtime.sendMessage(
          { name: "extractContactInfoFromEmail", emailContent: response.emailContent },
          (response) => {
            console.log(`RESPONSE in popup.js: ${response}`);
          }
        );
      } else {
        console.log("Failed to extract email content.");
      }
    });
  });
});
