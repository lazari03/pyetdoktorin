const fs = require('fs');
const path = require('path');

// Path to your generated knip-report.json
const reportPath = path.resolve(__dirname, 'knip-report.json');

// Read the report file
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Example: Logging unused files from the report
const unusedFiles = report.files.filter(file => file.status === 'unused');

// Print unused files
console.log('Unused files:', unusedFiles);

// Optional: Delete the unused files (be careful with this part)
unusedFiles.forEach(file => {
    const filePath = path.resolve(__dirname, file.path);
    console.log(`Deleting file: ${filePath}`);
    fs.unlinkSync(filePath); // Deletes the file
});
