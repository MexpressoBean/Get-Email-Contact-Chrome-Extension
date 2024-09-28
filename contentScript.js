// contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.name === 'extractEmailBody') {
      const emailBody = document.querySelector('div.ii.gt');  // Gmail email body element
  
      if (emailBody) {
        const emailText = emailBody.innerText;
        console.log('Extracted Email Body Content (contentScript.js):', emailText);
  
        // Respond with the email content
        sendResponse({ emailContent: emailText });
      } else {
        console.log('Email body not found.');
        sendResponse({ emailContent: null });
      }
    }
  });
  
