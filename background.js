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
                This is an email message from the sender's email address: ${request.senderEmailAddress}. Based on the following email body, please extract the sender's full name, email (${request.senderEmailAddress}), phone number, and any additional details in JSON format.

                Email body: ${request.emailContent}

                Please return the contact information in a JSON object with the following fields, formatted to be used for creating a new contact via the Google People API:

                {
                    "names": [
                        {
                        "givenName": "first_name",
                        "familyName": "last_name",
                        "displayName": "full_name"
                        }
                    ],
                    "nicknames": [
                        {
                        "value": "nickname"
                        }
                    ],
                    "emailAddresses": [
                        {
                        "value": "email"
                        }
                    ],
                    "phoneNumbers": [
                        {
                        "value": "phone_number"
                        }
                    ],
                    "urls": [
                        {
                        "value": "website"
                        }
                    ]
                }

                If any field is not available, DO NOT include it in the output. Ensure the JSON is properly structured for a Google People API call.
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

// add handler here to google people api call
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "createGoogleContactViaPeopleApi") {
    chrome.storage.local.get(["authToken"], function (result) {
      const token = result.authToken;
      if (token) {
        console.log(`Token received: ${token}`);

        fetch("https://people.googleapis.com/v1/people:createContact", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message.contactInfoBody),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("API response data:", data);
          })
          .catch((error) => {
            console.error("Error making API request:", error);
          });
      }
      // might want to add an else case to try to log in or do something here
    });

    return true;
  }
});
