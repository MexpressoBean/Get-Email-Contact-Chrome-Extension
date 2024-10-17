importScripts("../config/config.js");

// Listener for message events
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.name) {
    case "extractContactInfoFromEmail":
      handleContactInfoExtraction(request, sendResponse);
      return true; // Asynchronous response
    case "extractEmailBody":
      handleEmailBodyExtraction(sendResponse);
      return true; // Asynchronous response
    case "createGoogleContactViaPeopleApi":
      handleGoogleContactCreation(request.contactInfoBody, sendResponse);
      return true; // Asynchronous response
  }
});

// Handle extracting contact info using OpenAI API
const handleContactInfoExtraction = (request, sendResponse) => {
  const openAIRequestBody = JSON.stringify({
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
  });

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.OPEN_AI_API_KEY}`,
    },
    body: openAIRequestBody,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          console.error("Error Body:", text);
          throw new Error("Request failed with status " + response.status);
        });
      }
      return response.json();
    })
    .then((data) => {
      const parsedContactInfo = JSON.parse(data.choices[0].message.content);
      sendResponse({ contactInfo: parsedContactInfo });
    })
    .catch((error) => {
      console.error("Error fetching from OpenAI API:", error);
    });
};

// Handle extracting email body
const handleEmailBodyExtraction = (sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["../content/contentScript.js"],
        },
        () => {
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
};

// Handle creating a Google contact via People API
const handleGoogleContactCreation = (contactInfoBody, sendResponse) => {
  chrome.storage.local.get(["authToken"], (result) => {
    const token = result.authToken;
    if (token) {
      fetch("https://people.googleapis.com/v1/people:createContact", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactInfoBody),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("API response data:", data);
          sendResponse({
            responseMessage: "Contact created in Google successfully!",
          });
        })
        .catch((error) => {
          console.error("Error making API request:", error);
          sendResponse({
            responseMessage: `There was an error creating the contact in Google: ${error}`,
          });
        });
    } else {
      sendResponse({
        responseMessage: "Auth token is missing. Please log in to Google.",
      });
    }
  });
};
