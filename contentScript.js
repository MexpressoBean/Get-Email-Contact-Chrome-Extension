// contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "extractEmailBody") {
    const emailBody = document.querySelector("div.ii.gt"); // Gmail email body element
    const headerElement = document.querySelector(".gD");
    if (emailBody) {
      const senderEmail =
        headerElement.getAttribute("email") ||
        headerElement.textContent.match(
          /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
        );
      const emailText = emailBody.innerText;

      // Respond with the email content
      sendResponse({
        emailContent: emailText,
        senderEmailAddress: senderEmail,
      });
    } else {
      console.log("Email body not found.");
      sendResponse({ emailContent: null });
    }
  }
});
