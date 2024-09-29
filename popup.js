// Event listener for button click
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("logButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ name: "extractEmailBody" }, (response) => {
      if (response && response.emailContent) {
        chrome.runtime.sendMessage(
          {
            name: "extractContactInfoFromEmail",
            emailContent: response.emailContent,
            senderEmailAddress: response.senderEmailAddress,
          },
          (response) => {
            console.log(
              `RESPONSE in popup.js: ${
                response.contactInfo
              } && ${JSON.stringify(response.contactInfo)}`
            );
          }
        );
      } else {
        console.log("Failed to extract email content.");
      }
    });
  });
});
