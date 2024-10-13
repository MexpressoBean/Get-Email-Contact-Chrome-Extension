let contactInfo = null;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all elements and event listeners
  initializeElements();
  checkIfOnGmail();
  initializeEventListeners();
});

// Initialize UI elements
const initializeElements = () => {
  this.getContactInfoButton = document.getElementById("getContactInfoButton");
  this.createGoogleContactButton = document.getElementById(
    "createContactButton"
  );
  this.clearContactInfoButton = document.getElementById(
    "clearContactInfoButton"
  );
  this.emailPreview = document.getElementById("emailPreview");
  this.firstNamePreview = document.getElementById("firstNamePreview");
  this.lastNamePreview = document.getElementById("lastNamePreview");
  this.phonePreview = document.getElementById("phonePreview");
  this.urlPreview = document.getElementById("urlPreview");
  this.bannerMessageElement = document.getElementById("bannerMessage");
  this.messageBanner = document.getElementById("messageBanner");
  this.closeBannerButton = document.getElementById("closeBannerButton");
  this.loadingSpinnerGet = document.getElementById("loadingSpinnerGet");
  this.loadingSpinnerCreate = document.getElementById("loadingSpinnerCreate");
};

// Check if current page is Gmail
const checkIfOnGmail = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = currentTab.url;

    if (url && url.includes("mail.google.com")) {
      enableButtons();
    } else {
      disableButtons();
      showBannerMessage("Please open Gmail to use this extension.", "red");
    }
  });
};

// Initialize all event listeners
const initializeEventListeners = () => {
  getContactInfoButton.addEventListener("click", handleGetContactInfo);
  createGoogleContactButton.addEventListener(
    "click",
    handleCreateGoogleContact
  );
  clearContactInfoButton.addEventListener("click", clearContactInfo);
  closeBannerButton.addEventListener("click", closeBanner);
};

// Handle getting contact info from Gmail
const handleGetContactInfo = () => {
  showLoadingSpinner(loadingSpinnerGet);
  chrome.runtime.sendMessage({ name: "extractEmailBody" }, (response) => {
    if (response && response.emailContent) {
      extractContactInfo(response);
    } else {
      console.log("Failed to extract email content.");
      hideLoadingSpinner(loadingSpinnerGet);
    }
  });
};

// Extract contact info from email content
const extractContactInfo = (response) => {
  chrome.runtime.sendMessage(
    {
      name: "extractContactInfoFromEmail",
      emailContent: response.emailContent,
      senderEmailAddress: response.senderEmailAddress,
    },
    (response) => {
      contactInfo = response.contactInfo;

      if (contactInfo) {
        updateContactInfoPreview(contactInfo);
        hideLoadingSpinner(loadingSpinnerGet);
        createGoogleContactButton.disabled = false;
      }
    }
  );
};

// Handle creating a Google contact
const handleCreateGoogleContact = () => {
  showLoadingSpinner(loadingSpinnerCreate);

  chrome.storage.local.get(["authToken"], (result) => {
    if (result.authToken && emailPreview.textContent !== "") {
      chrome.runtime.sendMessage(
        {
          name: "createGoogleContactViaPeopleApi",
          contactInfoBody: contactInfo,
        },
        (response) => {
          showBannerMessage(response.responseMessage);
          createGoogleContactButton.disabled = true;
          hideLoadingSpinner(loadingSpinnerCreate);
        }
      );
    } else {
      const message = result.authToken
        ? "Contact info is not available to create contact!"
        : "User not logged in! Log into Google through your browser.";
      showBannerMessage(message, "red");
      hideLoadingSpinner(loadingSpinnerCreate);
    }
  });
};

// Update contact info preview on UI
const updateContactInfoPreview = (contactInfo) => {
  emailPreview.textContent = contactInfo.emailAddresses[0].value || "N/A";
  firstNamePreview.textContent = contactInfo.names[0].givenName || "N/A";
  lastNamePreview.textContent = contactInfo.names[0].familyName || "N/A";
  phonePreview.textContent = contactInfo.phoneNumbers[0].value || "N/A";
  urlPreview.textContent = contactInfo.urls[0].value || "N/A";
};

// Clear contact info previews
const clearContactInfo = () => {
  emailPreview.textContent = "";
  firstNamePreview.textContent = "";
  lastNamePreview.textContent = "";
  phonePreview.textContent = "";
  urlPreview.textContent = "";
  createGoogleContactButton.disabled = true;
};

// Banner message handling
const showBannerMessage = (message, color = "green") => {
  bannerMessageElement.textContent = message;
  messageBanner.classList.remove("hidden");
  messageBanner.style.backgroundColor = color;
};

const closeBanner = () => {
  messageBanner.classList.add("hidden");
  bannerMessageElement.textContent = "";
};

// Button handling
const enableButtons = () => {
  getContactInfoButton.disabled = false;
  createGoogleContactButton.disabled = false;
  clearContactInfoButton.disabled = false;
};

const disableButtons = () => {
  getContactInfoButton.disabled = true;
  createGoogleContactButton.disabled = true;
  clearContactInfoButton.disabled = true;
};

// Loading spinner handling
const showLoadingSpinner = (spinner) => {
  spinner.classList.remove("hidden");
};

const hideLoadingSpinner = (spinner) => {
  spinner.classList.add("hidden");
};
