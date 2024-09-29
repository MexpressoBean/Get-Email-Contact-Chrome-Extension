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
            content: `Can you please parse this email body message and give me back the senders name and any contact info (full name, email, phone number, etc) listed for them: ${request.emailContent}.  Please give me the contact info in an organized json format.`,
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
        console.log("OpenAI API Response:", data);
        const parsedContactInfo = JSON.parse(data.choices[0].message.content);
        console.log(JSON.stringify(parsedContactInfo));
        // Handle the data as needed
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
                  sendResponse({ emailContent: response.emailContent });
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
