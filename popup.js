// Event listener for button click
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('logButton').addEventListener('click', () => {
    console.log("********** BUTTON CLICKED **********")
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Inject the script into the active tab to extract email content
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractContactInfoFromPage
      });
    });
  });
});

// Function that will run in the active tab to extract contact info
function extractContactInfoFromPage() {
  // Try to find common email body selectors (e.g., Gmail)
  const emailBody = document.querySelector('div.ii.gt');  // Gmail example

  if (emailBody) {
    // Extract text content from the email
    const emailText = emailBody.innerText;

    // Extract first and last name (very basic placeholder logic for now)
    const nameRegex = /\b([A-Z][a-z]+)\s([A-Z][a-z]+)\b/;  // Simple regex for names like "John Doe"
    const matches = emailText.match(nameRegex);

    if (matches) {
      const firstName = matches[1];
      const lastName = matches[2];

      console.log(`Extracted Name: ${firstName} ${lastName}`);

      // Send the extracted data back to the extension's popup console
      chrome.runtime.sendMessage({ firstName, lastName });
    } else {
      console.log('No name found');
    }
  } else {
    console.log('Email body not found.');
  }
}
