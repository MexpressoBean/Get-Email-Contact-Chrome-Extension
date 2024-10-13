window.onload = function () {
  const authButton = document.getElementById("authButton");
  const createGoogleContactButton = document.getElementById("createContactButton");

  // Initial check for current logged in user in chrome browser
  chrome.identity.getAuthToken({ interactive: false }, function (token) {
    if (chrome.runtime.lastError || !token) {
      authButton.style.display = "block"; // Show the login button if no token

      // User is not logged in, show "Login with Google"
      authButton.textContent = "Login with Google";
    } else {
      // User is already logged in, show "Log out"
      // Store the token and change button text to "Log out"
      chrome.storage.local.set({ authToken: token }, function () {
        console.log("Auth token saved:", token);
      });

      authButton.style.display = "none"; // Hide the login button if we have a token
      authButton.textContent = "Log out";
    }
  });

  // Button handler to either login or logout depending on existence of google auth token
  authButton.addEventListener("click", function () {
    if (authButton.textContent === "Login with Google") {
      // Log in user
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
          console.error("Error getting auth token:", chrome.runtime.lastError);
          return;
        }
        // Store the token after logging in
        chrome.storage.local.set({ authToken: token }, function () {
          console.log("Auth token saved:", token);
        });
        authButton.style.display = "none"; // Hide the login button if we have a token
        authButton.textContent = "Log out";
      });
    } else {
      // Retrieve the token from chrome.storage.local
      chrome.storage.local.get("authToken", function (result) {
        const token = result.authToken;

        if (!token) {
          console.error("No token found for logout.");
          authButton.style.display = "block"; // Show the login button if no token

          // User is not logged in, show "Login with Google"
          authButton.textContent = "Login with Google";
          return;
        }

        // Remove cached token from Chrome's OAuth cache
        chrome.identity.removeCachedAuthToken({ token: token }, function () {
          if (chrome.runtime.lastError) {
            console.error(
              "Error removing cached auth token:",
              chrome.runtime.lastError
            );
            return;
          }

          console.log("Token removed from Chrome cache");

          // Optionally, remove token from chrome.storage.local as well
          chrome.storage.local.remove("authToken", function () {
            console.log("Token removed from local storage");
            authButton.innerText = "Login with Google";
          });
        });
      });
    }
  });
};
