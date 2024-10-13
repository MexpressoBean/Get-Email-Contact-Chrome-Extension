// Event listener for button click
let contactInfo = null;

document.addEventListener("DOMContentLoaded", function () {
  const getContactInfoButton = document.getElementById("getContactInfoButton");
  const createContactButton = document.getElementById("createContactButton");
  const clearContactInfoButton = document.getElementById(
    "clearContactInfoButton"
  );
  const emailPreview = document.getElementById("emailPreview");
  const firstNamePreview = document.getElementById("firstNamePreview");
  const lastNamePreview = document.getElementById("lastNamePreview");
  const phonePreview = document.getElementById("phonePreview");
  const urlPreview = document.getElementById("urlPreview");

  getContactInfoButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ name: "extractEmailBody" }, (response) => {
      if (response && response.emailContent) {
        chrome.runtime.sendMessage(
          {
            name: "extractContactInfoFromEmail",
            emailContent: response.emailContent,
            senderEmailAddress: response.senderEmailAddress,
          },
          (response) => {
            contactInfo = response.contactInfo;

            emailPreview.textContent =
              contactInfo.emailAddresses[0].value || "N/A";
            firstNamePreview.textContent =
              contactInfo.names[0].givenName || "N/A";
            lastNamePreview.textContent =
              contactInfo.names[0].familyName || "N/A";
            phonePreview.textContent =
              contactInfo.phoneNumbers[0].value || "N/A";
            urlPreview.textContent = contactInfo.urls[0].value || "N/A";
          }
        );
      } else {
        console.log("Failed to extract email content.");
      }
    });
  });

  createContactButton.addEventListener("click", () => {
    console.log("Create contact button clicked");

    // need to add something here that will prevent the user from hitting the button until there is new contact info
    // also maybe i null out the contact info?

    if (contactInfo) {
      chrome.runtime.sendMessage(
        {
          name: "createGoogleContactViaPeopleApi",
          contactInfoBody: contactInfo,
        },
        (response) => {
          // do something with response
          console.log("Contact created:", response);
        }
      );
    }
  });

  clearContactInfoButton.addEventListener("click", () => {
    emailPreview.textContent = "";
    firstNamePreview.textContent = "";
    lastNamePreview.textContent = "";
    phonePreview.textContent = "";
    urlPreview.textContent = "";
  });
});
