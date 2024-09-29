// Event listener for button click
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("getContactInfoButton")
    .addEventListener("click", () => {
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

              // Display the contact info in the preview area
              document.getElementById("contactInfoPreview").textContent =
                JSON.stringify(response.contactInfo, null, 2);
            }
          );
        } else {
          console.log("Failed to extract email content.");
        }
      });
    });

  document
    .getElementById("createContactButton")
    .addEventListener("click", () => {
      // Logic for creating the contact in Google Contacts goes here
      console.log("Create contact button clicked");
    });

  document
    .getElementById("clearContactInfoButton")
    .addEventListener("click", () => {
      // Clear the contact info preview
      document.getElementById("contactInfoPreview").textContent = "";
    });
});
