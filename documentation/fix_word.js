const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 1. Parse Markdown
const mdContent = fs.readFileSync('Mozhibu_Complete_Documentation.md', 'utf8');
let htmlContent = marked.parse(mdContent);

// Add inline styles for Word
htmlContent = htmlContent.replace(/<table/g, '<table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-family:Calibri,sans-serif;"');
htmlContent = htmlContent.replace(/<th/g, '<th style="background:#f2f2f2;font-weight:bold;text-align:left;"');
htmlContent = htmlContent.replace(/<td/g, '<td style="border:1px solid #ddd;"');
htmlContent = htmlContent.replace(/<h1/g, '<h1 style="color:#2F5496;font-family:Calibri Light;page-break-before:always;"');
htmlContent = htmlContent.replace(/<h2/g, '<h2 style="color:#2F5496;font-family:Calibri Light;"');
htmlContent = htmlContent.replace(/<pre/g, '<pre style="background:#f8f9fa;padding:10px;font-family:Consolas,monospace;"');

// 2. Setup Files
let template = fs.readFileSync('Doc1.htm', 'utf8');

// Fix Encoding so ASCII art shows correctly
template = template.replace('charset=windows-1252', 'charset=utf-8');

// Fix Header/Footer Links by renaming Doc1_files to mozhibu_files
template = template.replace(/Doc1_files/g, 'mozhibu_files');

// Ensure mozhibu_files directory exists and copy contents
const srcDir = path.join(__dirname, 'Doc1_files');
const destDir = path.join(__dirname, 'mozhibu_files');
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}
fs.readdirSync(srcDir).forEach(file => {
    let srcFile = path.join(srcDir, file);
    let destFile = path.join(destDir, file);
    let content = fs.readFileSync(srcFile);
    // If it's a text file, replace Doc1_files in it as well
    if (file.endsWith('.htm') || file.endsWith('.xml')) {
        let text = content.toString('utf8');
        text = text.replace(/Doc1_files/g, 'mozhibu_files');
        text = text.replace('charset=windows-1252', 'charset=utf-8');
        fs.writeFileSync(destFile, text, 'utf8');
    } else {
        fs.writeFileSync(destFile, content);
    }
});

// 3. Inject Content
const insertionPoint = '<div class=WordSection1>';
const index = template.indexOf(insertionPoint);

if (index !== -1) {
    const topHalf = template.substring(0, index + insertionPoint.length);
    const bottomHalf = template.substring(index + insertionPoint.length);
    
    // We will wrap the HTML in a div to ensure Word applies the section correctly
    const finalDoc = topHalf + '\n<div>\n' + htmlContent + '\n</div>\n' + bottomHalf;
    fs.writeFileSync('mozhibu_final.doc', finalDoc, 'utf8');
    console.log('Successfully created mozhibu_final.doc with fixed encoding and headers!');
} else {
    console.error('Could not find <div class=WordSection1> in Doc1.htm');
}
