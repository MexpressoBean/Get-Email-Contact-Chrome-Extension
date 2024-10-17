chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "extractEmailBody") {
    const emailBody = getEmailBody();
    const senderEmail = getSenderEmail();

    if (emailBody) {
      const emailText = emailBody.innerText;

      // Respond with the email content and sender's email address
      sendResponse({
        emailContent: emailText,
        senderEmailAddress: senderEmail,
      });
    } else {
      console.log("Email body not found.");
      sendResponse({ emailContent: null, senderEmailAddress: null });
    }
  }
});

// Get the email body element from the Gmail interface
const getEmailBody = () => document.querySelector("div.ii.gt"); // Gmail email body element

// Get the sender's email address from the email header
const getSenderEmail = () => {
  const headerElement = document.querySelector(".gD");
  if (headerElement) {
    return (
      headerElement.getAttribute("email") ||
      extractEmailFromText(headerElement.textContent)
    );
  }
  return null;
};

// Extract the email address from the given text
const extractEmailFromText = (text) => {
  const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  return emailMatch ? emailMatch[0] : null;
};
