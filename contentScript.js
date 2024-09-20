const button = document.createElement('button');
button.innerText = 'Capture Contact';
button.style.position = 'fixed';
button.style.top = '10px';
button.style.right = '10px';
document.body.appendChild(button);

button.addEventListener('click', () => {
  const emailBody = document.querySelector('.ii.gt'); // Gmail email body selector
  if (emailBody) {
    const contactInfo = extractContactInfo(emailBody.innerText); // Extract contact info
    console.log('Extracted Contact:', contactInfo); // Log for debugging
  }
});

function extractContactInfo(emailText) {
  // Placeholder function to extract contact info using regex
  const contactInfo = {
    name: extractName(emailText),
    email: extractEmail(emailText),
    phone: extractPhone(emailText),
  };
  return contactInfo;
}

function extractName(text) {
  // Regex for simple name extraction (can be improved later)
  const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/m; // First and Last name (capitalized)
  const match = text.match(namePattern);
  return match ? match[0] : 'Unknown';
}

function extractEmail(text) {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailPattern);
  return match ? match[0] : 'No Email Found';
}

function extractPhone(text) {
  const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phonePattern);
  return match ? match[0] : 'No Phone Found';
}
