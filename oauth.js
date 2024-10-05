window.onload = function() {
    document.getElementById('authButton').addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError);
                return;
            }
            
            console.log('Access Token:', token);
        
            chrome.runtime.sendMessage(
                {
                  name: "createGoogleContactViaPeopleApi",
                  googleAuthToken: token
                },
                (response) => {
                  console.log(
                    `RESPONSE in oauth.js: `
                  );
    
                  // do stuff here
                }
              );
        });        
    });
  };