window.onload = function() {
    document.getElementById('authButton').addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError);
                return;
            }
            
            console.log('Access Token:', token);
        
            // Use the token to make an API request to a Google service (e.g., Google Contacts API)
            fetch('https://www.googleapis.com/auth/contacts.readonly', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('API response data:', data);
            })
            .catch(error => {
                console.error('Error making API request:', error);
            });
        });        
    });
  };