# PDF Rule Checker

## What is This?
A web application that checks if your PDF documents contain the information you need using pattern matching and regex logic.

## Problem It Solves

You have many PDF files and need to verify if they contain:
- Dates
- Company names
- Contact information
- Names and signatures
- Specific keywords

Instead of checking manually, this app does it automatically.

## How It Works

**3 Simple Steps:**

1. Upload a PDF file
2. Write 3 rules (what you want to find)
3. Get results showing PASS or FAIL

**Example:**
- PDF: Internship Certificate
- Rule 1: "Document must mention a date"
- Rule 2: "Document must mention company name"
- Rule 3: "Document must have person name"

Results:
```
Rule 1: PASS (Found: "1st March 2024")
Rule 2: PASS (Found: "Codebucket Solutions")
Rule 3: PASS (Found: "Priya Kumari")
```

## Technology Used

- **Frontend**: React.js (user interface)
- **Backend**: Node.js + Express (server)
- **PDF Processing**: pdf-parse (extract text from PDF)
- **Pattern Matching**: Regular Expressions (check rules)
- **File Upload**: Multer (handle file uploads)
- **API Communication**: CORS (connect frontend and backend)

## Project Structure

```
pdf-checker/
├── frontend/
│   ├── src/
│   │   ├── App.js (main React component)
│   │   └── index.js
│   ├── public/
│   └── package.json
├── backend/
│   ├── server.js (main backend code)
│   ├── uploads/ (temporary PDF storage)
│   └── package.json
├── README.md
└── .gitignore
```

## Installation

### Prerequisites

- Node.js installed (v20 or higher)
- npm installed
- A PDF file for testing

### Step 1: Setup Backend

```bash
cd backend
npm install
node server.js
```

Output should show:
```
Server running on http://localhost:5000
```

### Step 2: Setup Frontend (open new terminal)

```bash
cd frontend
npm install
npm start
```

Browser will automatically open: `http://localhost:3000`

## How the Application Works

### Frontend Flow

1. User clicks "Choose File" and selects a PDF
2. User enters 3 rules in text boxes
3. User clicks "Check Document" button
4. Loading indicator shows
5. Results table appears with PASS/FAIL for each rule

### Backend Flow

1. Receives PDF file from frontend
2. Extracts text from PDF using pdf-parse
3. For each rule, checks patterns:
   - If rule contains "date" → search for date patterns
   - If rule contains "email" → search for email patterns
   - If rule contains "company" → search for company keywords
   - If rule contains "phone" → search for phone patterns
   - If rule contains "name" → search for name patterns
   - If rule contains "signature" → search for approval keywords
4. Returns results with status, evidence, and confidence score
5. Deletes temporary PDF file

## Pattern Matching Rules

The app checks for these patterns:

| Rule Type | Pattern | Example |
|-----------|---------|---------|
| Date | DD/MM/YYYY or month names | "1st March 2024" |
| Email | email@domain.com | "support@codebuckets.in" |
| Company | Keywords: pvt, ltd, inc, limited | "Codebucket Solutions Private Limited" |
| Phone | +91-XXXXXXXXXX or 10 digits | "+91-999-500-8671" |
| Name | Capital Letter + Capital Letter | "Priya Kumari" |
| Signature | Keywords: signed, approved, manager | "Signed by Priya Kumari" |

## API Endpoints

### POST /api/check

Upload PDF and check rules

**Request:**
```
FormData:
- pdf: File (PDF file)
- rules: JSON string ["rule1", "rule2", "rule3"]
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "rule": "Document must mention a date",
      "status": "pass",
      "evidence": "Found: 1st March 2024",
      "reasoning": "Date information is present",
      "confidence": 90
    }
  ]
}
```

### GET /api/health

Check if backend is running

**Response:**
```json
{
  "status": "Backend running"
}
```

## Troubleshooting

### Problem: "Backend not running" error

**Solution:**
1. Open terminal
2. Navigate to backend folder: `cd backend`
3. Run: `node server.js`
4. Check if it says: "Server running on http://localhost:5000"

### Problem: "Cannot upload PDF"

**Solution:**
1. Make sure the file is a .pdf file
2. Check file size is not too large (10MB max)
3. Try a different PDF

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Kill the process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart: node server.js
```

### Problem: Results showing as FAIL when they should be PASS

**Solution:**
1. Check PDF actually contains the information
2. Try more specific rule text
3. Use exact keywords from PDF

## Example Rules to Try

- "Document must mention a date"
- "Must have company name"
- "Should include email address"
- "Must list contact information"
- "Should mention who approved it"
- "Must include person name"
- "Should have phone number"
- "Must mention approval or signature"

## Code Explanation

### Backend - PDF Text Extraction

```javascript
async function extractPdfText(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;  // Returns all text from PDF
}
```

This reads the PDF file and extracts all text content.

### Backend - Rule Checking

```javascript
if (ruleLower.includes('date')) {
  const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
  if (datePattern.test(textLower)) {
    status = 'pass';  // Date found
  }
}
```

This checks if the rule mentions "date", then searches PDF text using regex pattern.

### Frontend - File Upload

```javascript
const handlePdfChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    setPdf(file);
    setFileName(file.name);
  }
}
```

This handles PDF file selection from user.

### Frontend - Sending Data to Backend

```javascript
const formData = new FormData();
formData.append('pdf', pdf);
formData.append('rules', JSON.stringify(filledRules));

const response = await fetch('http://localhost:5000/api/check', {
  method: 'POST',
  body: formData
});
```

This sends PDF and rules to backend for analysis.

## Features

- Upload any PDF file
- Define custom validation rules
- Pattern-based analysis (no AI)
- Get immediate results
- See confidence scores
- View evidence from PDF
- Clean, simple interface
- Fast processing

## Advantages of This Approach

- No external API calls needed
- No API costs
- Works offline
- Fast processing
- Transparent logic (see exactly how it works)
- Easy to add new patterns
- Reliable and consistent results

## How to Add New Pattern

If you want to check for something new:

1. Open `backend/server.js`
2. Find the `checkRulesWithLogic` function
3. Add new else if block:

```javascript
if (ruleLower.includes('newkeyword')) {
  const newPattern = /regex_pattern/;
  if (newPattern.test(textLower)) {
    status = 'pass';
    evidence = 'Found: ...';
    confidence = 90;
  }
}
```

4. Restart backend: `node server.js`


## Testing

### Test with Sample PDF

1. Create a simple text document with:
   - A date: "15th November 2024"
   - Company name: "ABC Company Private Limited"
   - Email: "contact@abc.com"
   - Phone: "+91-9999999999"
   - Person name: "John Smith"

2. Convert to PDF

3. Use these rules:
   - "Document must mention a date"
   - "Must have company name"
   - "Should include email"

4. All should return PASS

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Error: Failed to fetch" | Backend not running | Start backend: `node server.js` |
| PDF won't upload | Not a valid PDF | Use actual PDF file |
| All FAIL results | PDF doesn't have info | Try different PDF with content |
| Port already in use | Another app using port 5000 | Kill process or change port |
| Results not showing | Frontend-backend not connected | Check both are running on localhost |

## Performance

- Small PDFs (< 1MB): < 1 second
- Medium PDFs (1-5MB): < 3 seconds
- Large PDFs (5-10MB): < 5 seconds

## Limitations

- Works with PDFs up to 10MB
- Text-based PDFs only (not scanned images)
- Supports English language patterns
- Maximum 3 rules per check (can be modified)

## Future Improvements

- Support for multiple PDFs at once
- Save results to database
- Export results as PDF report
- Add more language support
- Support image-based PDFs with OCR
- Scheduled batch processing
- User authentication system

## Files Explained

### backend/server.js

Main backend file that:
- Creates Express server
- Handles file uploads with Multer
- Extracts PDF text
- Checks rules with regex patterns
- Returns results as JSON

### frontend/src/App.js

Main React component that:
- Manages state for PDF, rules, results
- Handles file upload
- Sends data to backend
- Displays results in table

### package.json

Lists all required dependencies for both frontend and backend

## Dependencies

**Backend:**
- express: Server framework
- cors: Enable cross-origin requests
- multer: Handle file uploads
- pdf-parse: Extract text from PDF
- fs: File system operations

**Frontend:**
- react: UI library
- react-dom: Render React to DOM

