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
  const loadingSpinnerGet = document.getElementById("loadingSpinnerGet");
  const loadingSpinnerCreate = document.getElementById("loadingSpinnerCreate");

  const showLoadingSpinner = (spinner) => {
    spinner.classList.remove("hidden");
  };

  const hideLoadingSpinner = (spinner) => {
    spinner.classList.add("hidden");
  };

  getContactInfoButton.addEventListener("click", () => {
    showLoadingSpinner(loadingSpinnerGet);
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
              hideLoadingSpinner(loadingSpinnerGet);
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
        // add banner notification here
        hideLoadingSpinner(loadingSpinnerGet);
      }
    });
  });

  closeBannerButton.addEventListener("click", () => {
    messageBanner.classList.add("hidden");
    bannerMessageElement.textContent = "";
  });

  createGoogleContactButton.addEventListener("click", () => {
    showLoadingSpinner(loadingSpinnerCreate);

    chrome.storage.local.get(["authToken"], function (result) {
      if (result.authToken) {
        if (emailPreview.textContent !== "") {
          chrome.runtime.sendMessage(
            {
              name: "createGoogleContactViaPeopleApi",
              contactInfoBody: contactInfo,
            },
            (response) => {
              bannerMessageElement.textContent = response.responseMessage;
              messageBanner.classList.remove("hidden");
              createGoogleContactButton.disabled = true;
              hideLoadingSpinner(loadingSpinnerCreate);
            }
          );
        } else {
          bannerMessageElement.textContent = "Contact info is not available to create contact!";
          messageBanner.classList.remove("hidden");
          hideLoadingSpinner(loadingSpinnerCreate);
        }
      } else {
        bannerMessageElement.textContent = "User not logged in!  Log into Google through your browser.";
        messageBanner.classList.remove("hidden");
        hideLoadingSpinner(loadingSpinnerCreate);
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
