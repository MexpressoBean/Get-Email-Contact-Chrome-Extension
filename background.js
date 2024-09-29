importScripts("config.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name === "extractContactInfoFromEmail") {
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "user",
            content: `
              This is an email message from the sender's email address: ${request.senderEmailAddress}. Based on the following email body, please extract the sender's full name, the sender's email (${request.senderEmailAddress}), phone number, and any other relevant contact information (e.g., website, social media) in JSON format:

              Email body: ${request.emailContent}

              Please return the contact information in a JSON object with the following fields:

              full_name
              first name
              last name (please watch out for people who have two last names or hyphenated last names if applicable)
              nickname (if available)
              email
              phone_number
              website (if available)
              social_media (if available, please seperate out each applicable social media like: Instagram: handle, Facebook: name, etc)
              If any field is not available, do not include it in the output.
            `,
          },
        ],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // Read the full error response body
          return response.text().then((text) => {
            console.error("Error Body:", text);
            throw new Error("Request failed with status " + response.status);
          });
        }
        return response.json();
      })
      .then((data) => {
        // Capture and parse OpenAI chat response
        const parsedContactInfo = JSON.parse(data.choices[0].message.content);

        sendResponse({
          contactInfo: parsedContactInfo,
        });
      })
      .catch((error) => {
        console.error("Error fetching from OpenAI API:", error);
      });

    // Return true to indicate you want to send a response asynchronously
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "extractEmailBody") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // Inject content script into the current tab manually
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ["contentScript.js"], // Ensure this points to your actual content script file
          },
          () => {
            // After injecting, send the message
            chrome.tabs.sendMessage(
              tabs[0].id,
              { name: "extractEmailBody" },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                } else {
                  sendResponse({
                    emailContent: response.emailContent,
                    senderEmailAddress: response.senderEmailAddress,
                  });
                }
              }
            );
          }
        );
      }
    });
    return true; // Keep the message channel open for async response
  }
});
