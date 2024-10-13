window.onload = function () {
  const authButton = document.getElementById("authButton");

  // Initialize and check login state
  checkLoginState(authButton);

  // Button click handler for login or logout
  authButton.addEventListener("click", () => handleAuthButtonClick(authButton));
};

// Check the user's authentication status and update the UI accordingly
function checkLoginState(authButton) {
  chrome.identity.getAuthToken({ interactive: false }, function (token) {
    if (chrome.runtime.lastError || !token) {
      showLoginButton(authButton); // No token, user is not logged in
    } else {
      storeAuthToken(token); // User is logged in, store token and hide button
      hideLoginButton(authButton);
    }
  });
}

// Show the login button and set its text
function showLoginButton(authButton) {
  authButton.style.display = "block";
  authButton.textContent = "Login with Google";
}

// Hide the login button (e.g., after logging in)
function hideLoginButton(authButton) {
  authButton.style.display = "none";
}

// Store the auth token in chrome.storage.local
function storeAuthToken(token) {
  chrome.storage.local.set({ authToken: token }, function () {
    console.log("Auth token saved:", token);
  });
}

// Handle login or logout based on current button text
function handleAuthButtonClick(authButton) {
  if (authButton.textContent === "Login with Google") {
    loginWithGoogle(authButton);
  } else {
    logoutFromGoogle(authButton);
  }
}

// Log the user in with Google and store the auth token
function loginWithGoogle(authButton) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.error("Error getting auth token:", chrome.runtime.lastError);
      return;
    }
    storeAuthToken(token);
    hideLoginButton(authButton);
  });
}

// Log the user out by removing the cached auth token and clearing local storage
function logoutFromGoogle(authButton) {
  chrome.storage.local.get("authToken", function (result) {
    const token = result.authToken;

    if (!token) {
      console.error("No token found for logout.");
      showLoginButton(authButton);
      return;
    }

    // Remove cached auth token
    chrome.identity.removeCachedAuthToken({ token: token }, function () {
      if (chrome.runtime.lastError) {
        console.error(
          "Error removing cached auth token:",
          chrome.runtime.lastError
        );
        return;
      }
      console.log("Token removed from Chrome cache");

      // Remove token from local storage
      chrome.storage.local.remove("authToken", function () {
        console.log("Token removed from local storage");
        showLoginButton(authButton); // Show login button after logout
      });
    });
  });
}
