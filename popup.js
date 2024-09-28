// Event listener for button click
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('logButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Inject the script into the active tab to extract email content
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractEmailBodyContent
      });
    });
  });
});

function extractEmailBodyContent() {
  // Try to find common email body selectors (e.g., Gmail)
  const emailBody = document.querySelector('div.ii.gt');  // Gmail email body element

  if (emailBody) {
    // Extract the entire text content from the email body
    const emailText = emailBody.innerText;

    console.log('Extracted Email Body Content:', emailText);

    // Send the extracted email content back to the extension's popup or background script
    chrome.runtime.sendMessage({ emailContent: emailText });
  } else {
    console.log('Email body not found.');
  }
}