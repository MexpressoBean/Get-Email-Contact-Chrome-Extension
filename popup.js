// Event listener for button click
let contactInfo = null;

document.addEventListener("DOMContentLoaded", function () {
  const getContactInfoButton = document.getElementById("getContactInfoButton");
  const createGoogleContactButton = document.getElementById(
    "createContactButton"
  );
  const clearContactInfoButton = document.getElementById(
    "clearContactInfoButton"
  );
  const emailPreview = document.getElementById("emailPreview");
  const firstNamePreview = document.getElementById("firstNamePreview");
  const lastNamePreview = document.getElementById("lastNamePreview");
  const phonePreview = document.getElementById("phonePreview");
  const urlPreview = document.getElementById("urlPreview");
  const bannerMessageElement = document.getElementById("bannerMessage");
  const messageBanner = document.getElementById("messageBanner");
  const closeBannerButton = document.getElementById("closeBannerButton");

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

            if (contactInfo) {
              emailPreview.textContent =
                contactInfo.emailAddresses[0].value || "N/A";
              firstNamePreview.textContent =
                contactInfo.names[0].givenName || "N/A";
              lastNamePreview.textContent =
                contactInfo.names[0].familyName || "N/A";
              phonePreview.textContent =
                contactInfo.phoneNumbers[0].value || "N/A";
              urlPreview.textContent = contactInfo.urls[0].value || "N/A";

              createGoogleContactButton.disabled = false;
            }
          }
        );
      } else {
        console.log("Failed to extract email content.");
      }
    });
  });

  closeBannerButton.addEventListener("click", () => {
    messageBanner.classList.add("hidden");
    bannerMessageElement.textContent = "";
  });

  createGoogleContactButton.addEventListener("click", () => {
    console.log("Create contact button clicked");

    chrome.storage.local.get(["authToken"], function (result) {
      if (result.authToken) {
        if (emailPreview.textContent !== "") {
          chrome.runtime.sendMessage(
            {
              name: "createGoogleContactViaPeopleApi",
              contactInfoBody: contactInfo,
            },
            (response) => {
              console.log("Contact created:", response.responseMessage);
              bannerMessageElement.textContent = response.responseMessage;
              messageBanner.classList.remove("hidden");
              createGoogleContactButton.disabled = true;
            }
          );
        }
      }
    });
  });

  clearContactInfoButton.addEventListener("click", () => {
    emailPreview.textContent = "";
    firstNamePreview.textContent = "";
    lastNamePreview.textContent = "";
    phonePreview.textContent = "";
    urlPreview.textContent = "";
    createGoogleContactButton.disabled = true;
  });
});
