const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Create uploads folder
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Extract text from PDF
async function extractPdfText(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// Check rules using pattern matching
async function checkRulesWithLogic(pdfText, rules) {
  const results = [];
  const textLower = pdfText.toLowerCase();
  
  for (let rule of rules) {
    const ruleLower = rule.toLowerCase();
    let status = 'fail';
    let evidence = 'Not found';
    let confidence = 0;
    let reasoning = 'Rule not satisfied';
    
    // Check for DATE
    if (ruleLower.includes('date')) {
      const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december|\d{4}/i;
      if (datePattern.test(textLower)) {
        status = 'pass';
        const dateMatch = textLower.match(datePattern);
        evidence = `Found: ${dateMatch[0]}`;
        confidence = 90;
        reasoning = 'Date information is present in document';
      } else {
        reasoning = 'No date found in document';
      }
    }
    
    // Check for COMPANY NAME
    else if (ruleLower.includes('company') || ruleLower.includes('organization')) {
      const companyKeywords = ['pvt', 'ltd', 'limited', 'private', 'inc', 'corporation'];
      const found = companyKeywords.some(keyword => textLower.includes(keyword));
      if (found) {
        status = 'pass';
        evidence = 'Company/Organization name mentioned';
        confidence = 85;
        reasoning = 'Organization information is present';
      } else {
        reasoning = 'No company/organization name found';
      }
    }
    
    // Check for NAME/PERSON
    else if (ruleLower.includes('name') || ruleLower.includes('person')) {
      const namePattern = /[A-Z][a-z]+ [A-Z][a-z]+/;
      if (namePattern.test(textLower)) {
        status = 'pass';
        const nameMatch = textLower.match(namePattern);
        evidence = `Found: ${nameMatch[0]}`;
        confidence = 80;
        reasoning = 'Person name is present in document';
      } else {
        reasoning = 'No person name found';
      }
    }
    
    // Check for EMAIL
    else if (ruleLower.includes('email') || ruleLower.includes('contact')) {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      if (emailPattern.test(textLower)) {
        status = 'pass';
        const emailMatch = textLower.match(emailPattern);
        evidence = `Found: ${emailMatch[0]}`;
        confidence = 95;
        reasoning = 'Contact information is present';
      } else {
        reasoning = 'No email address found';
      }
    }
    
    // Check for PHONE
    else if (ruleLower.includes('phone') || ruleLower.includes('mobile')) {
      const phonePattern = /\+?91[-.\s]?\d{10}|\d{10}/;
      if (phonePattern.test(textLower)) {
        status = 'pass';
        const phoneMatch = textLower.match(phonePattern);
        evidence = `Found: ${phoneMatch[0]}`;
        confidence = 92;
        reasoning = 'Phone number is present';
      } else {
        reasoning = 'No phone number found';
      }
    }
    
    // Check for SIGNATURE/APPROVAL
    else if (ruleLower.includes('signature') || ruleLower.includes('approve') || ruleLower.includes('sign')) {
      const signatureKeywords = ['signature', 'signed', 'approved', 'authorize', 'manager'];
      const found = signatureKeywords.some(keyword => textLower.includes(keyword));
      if (found) {
        status = 'pass';
        evidence = 'Signature/Approval information present';
        confidence = 85;
        reasoning = 'Document contains approval/signature';
      } else {
        reasoning = 'No signature or approval found';
      }
    }
    
    // Generic keyword matching
    else {
      const words = ruleLower.split(' ').filter(w => w.length > 3);
      const matchedCount = words.filter(word => textLower.includes(word)).length;
      
      if (matchedCount >= 2) {
        status = 'pass';
        evidence = `Matching keywords: ${words.slice(0, 2).join(', ')}`;
        confidence = 70;
        reasoning = 'Document contains relevant information';
      } else {
        reasoning = 'Rule not satisfied in document';
      }
    }
    
    results.push({
      rule: rule,
      status: status,
      evidence: evidence,
      reasoning: reasoning,
      confidence: confidence
    });
  }
  
  return results;
}

// API Endpoint
app.post('/api/check', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file required' });
    }

    const { rules } = req.body;
    if (!rules) {
      return res.status(400).json({ error: 'Rules required' });
    }

    const rulesArray = JSON.parse(rules);
    
    console.log('Extracting PDF text...');
    const pdfText = await extractPdfText(req.file.path);
    console.log(`Extracted ${pdfText.length} characters`);
    
    console.log('Analyzing rules...');
    const results = await checkRulesWithLogic(pdfText, rulesArray);
    
    // Delete temporary file
    fs.unlinkSync(req.file.path);
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});