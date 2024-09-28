// Event listener for button click
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('logButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({name: "extractEmailBody"}, (response) => {
      if (response && response.emailContent) {
        console.log('Extracted Email Body Content (popup.js):', response.emailContent);

        chrome.runtime.sendMessage({name: "fetchActivity", emailContent: response.emailContent}, (response) => {
          console.log(`RESPONSE in popup.js: ${response}`)
          console.log("**********************************")
          // console.log(`EMAIL CONTENT: ${emailContent}`)
        })
      } else {
        console.log('Failed to extract email content.');
      }
    })
  });
});
