chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.name === 'fetchActivity') {
    //   console.log(request.emailText)
      console.log("REACHED THE MSG LISTENER")
      console.log("****************************");
      console.log(`REQUEST info: ${JSON.stringify(request)}`)
      
      fetch('https://restcountries.com/v3.1/name/deutschland')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          console.log('Fetched Activity:', data);
          // Handle the data as needed
      })
      .catch(error => {
          console.error('Error fetching activity:', error);
      });
  
      // Return true to indicate you want to send a response asynchronously
      return true;
    }
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.name === 'extractEmailBody') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          // Inject content script into the current tab manually
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['contentScript.js'] // Ensure this points to your actual content script file
          }, () => {
            // After injecting, send the message
            chrome.tabs.sendMessage(tabs[0].id, { name: 'extractEmailBody' }, (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
              } else {
                sendResponse({ emailContent: response.emailContent });
              }
            });
          });
        }
      });
      return true;  // Keep the message channel open for async response
    }
  });
  