// Event listener for button click
let contactInfo = null;

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
              contactInfo = response.contactInfo
              console.log(
                `RESPONSE in popup.js: ${
                  contactInfo
                } && ${JSON.stringify(contactInfo)}`
              );

              // Display the contact info in the preview area
              document.getElementById("contactInfoPreview").textContent =
                JSON.stringify(contactInfo, null, 2);
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

      chrome.runtime.sendMessage(
        {
          name: "createGoogleContactViaPeopleApi",
          contactInfoBody: contactInfo
        },
        (response) => {
          // need to add something here that will prevent the user from hitting the button until there is new contact info
          // also maybe i null out the contact info?
        }
      );
    });

  document
    .getElementById("clearContactInfoButton")
    .addEventListener("click", () => {
      // Clear the contact info preview
      document.getElementById("contactInfoPreview").textContent = "";
    });
});
