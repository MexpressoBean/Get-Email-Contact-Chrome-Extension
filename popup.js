// function extractEmailBodyContent() {
//   // Try to find common email body selectors (e.g., Gmail)
//   const emailBody = document.querySelector('div.ii.gt');  // Gmail email body element

//   if (emailBody) {
//     // Extract the entire text content from the email body
//     const emailText = emailBody.innerText;

//     console.log('Extracted Email Body Content:', emailText);

//     return emailText;
//   } else {
//     console.log('Email body not found.');
//     return null;
//   }
// }

// Event listener for button click
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('logButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({name: "extractEmailBody"}, (response) => {
      if (response && response.emailContent) {
        console.log('Extracted Email Body Content (popup.js):', response.emailContent);
      } else {
        console.log('Failed to extract email content.');
      }
    })


    // chrome.runtime.sendMessage({name: "fetchActivity", emailContent: "some content here"}, (response) => {
    //   console.log(`RESPONSE in popup.js: ${response}`)
    //   console.log("**********************************")
    //   // console.log(`EMAIL CONTENT: ${emailContent}`)
    // })
  });
});
