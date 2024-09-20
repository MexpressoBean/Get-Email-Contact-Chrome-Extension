document.getElementById('capture-contact').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: extractContactInfoFromPage,
      });
    });
  });
  
  function extractContactInfoFromPage() {
    const emailBody = document.querySelector('.ii.gt');
    if (emailBody) {
      const contactInfo = extractContactInfo(emailBody.innerText);
      document.getElementById('contact-info').innerText = JSON.stringify(contactInfo, null, 2);
    }
  }
  