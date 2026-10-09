const fs = require('fs');
const { marked } = require('marked');

// 1. Read Markdown
const mdContent = fs.readFileSync('Mozhibu_Complete_Documentation.md', 'utf8');
let htmlContent = marked.parse(mdContent);

// Add styling for Word
htmlContent = htmlContent.replace(/<table/g, '<table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-family:Calibri,sans-serif;"');
htmlContent = htmlContent.replace(/<th/g, '<th style="background:#f2f2f2;font-weight:bold;text-align:left;"');
htmlContent = htmlContent.replace(/<td/g, '<td style="border:1px solid #ddd;"');
htmlContent = htmlContent.replace(/<h1/g, '<h1 style="color:#2F5496;font-family:Calibri Light;"');
htmlContent = htmlContent.replace(/<h2/g, '<h2 style="color:#2F5496;font-family:Calibri Light;"');

// 2. Read Template HTML
let template = fs.readFileSync('Doc1.htm', 'utf8');

// The file might be in different encoding if it has null bytes, but view_file showed it as standard text
const insertionPoint = '<div class=WordSection1>';
const index = template.indexOf(insertionPoint);

if (index !== -1) {
    const topHalf = template.substring(0, index + insertionPoint.length);
    const bottomHalf = template.substring(index + insertionPoint.length);
    
    // 3. Assemble and save
    const finalDoc = topHalf + '\n' + htmlContent + '\n' + bottomHalf;
    fs.writeFileSync('mozhibu.doc', finalDoc, 'utf8');
    console.log('Successfully created mozhibu.doc with template styles!');
} else {
    console.error('Could not find <div class=WordSection1> in Doc1.htm');
}
