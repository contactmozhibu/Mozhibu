const fs = require('fs');
const path = require('path');

const text = fs.readFileSync('scratch_raw_terms.txt', 'utf8');

const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

let html = '';

let inSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line === 'TERMS OF SERVICE') {
    continue;
  }
  if (line.startsWith('Last Updated:')) {
    html += `          <div class="policy-block intro">\n`;
    html += `            <p class="last-updated">${line}</p>\n`;
    continue;
  }
  
  // Checking for Main Headers (All Caps)
  if (line === 'USER OBLIGATIONS' || line === 'RIGHTS OF THE COMPANY' || line === 'CONTENT GUIDELINES' || line === 'COMPANY AS AN INTERMEDIARY' || line === 'LIABILITY AND DISCLAIMER' || line === 'GRIEVANCE REDRESSAL' || line === 'MISCELLANEOUS') {
    if (inSection) {
      html += `          </div>\n\n`;
      inSection = false;
    }
    html += `          <div class="policy-block main-section">\n`;
    html += `            <h2 class="main-heading">${line}</h2>\n`;
    html += `          </div>\n\n`;
    continue;
  }

  // Checking for numbered sections
  if (/^[0-9]+\.\s+/.test(line)) {
    if (inSection) {
      html += `          </div>\n\n`;
    }
    html += `          <div class="policy-block">\n`;
    html += `            <h3>${line}</h3>\n`;
    inSection = true;
    continue;
  }

  // Regular paragraph or list item
  if (line.startsWith('(a)') || line.startsWith('(b)') || line.startsWith('(c)') || line.startsWith('(d)') || line.startsWith('(e)') || line.startsWith('(f)')) {
    html += `            <p class="list-item">${line}</p>\n`;
  } else {
    // Check if it's the first paragraph after Last Updated, we are in intro block
    if (!inSection && html.includes('intro">') && !html.includes('</div>\n\n')) {
      html += `            <p>${line}</p>\n`;
    } else if (!inSection && !html.includes('intro">')) {
       // Should not happen based on text, but fallback
       html += `            <p>${line}</p>\n`;
    } else if (!inSection && html.includes('intro">')) {
      // Still in intro block
      html += `            <p>${line}</p>\n`;
    } else {
      // In a section block
      html += `            <p>${line}</p>\n`;
    }
  }
}

if (inSection || !html.endsWith('</div>\n\n')) {
  html += `          </div>\n`;
}

// Ensure the intro block is closed
if (html.includes('<div class="policy-block intro">') && !html.includes('</div>', html.indexOf('<div class="policy-block intro">'))) {
    // This is handled by the first numbered section which closes any open section if inSection was true, but intro is not governed by inSection.
    // Let's just fix the parser logic above slightly by closing intro when hitting the first numbered section.
}

let fixedHtml = html.replace(/<div class="policy-block">\s*<h3>1. Acceptance of Terms<\/h3>/, '</div>\n\n          <div class="policy-block">\n            <h3>1. Acceptance of Terms</h3>');

const componentPath = path.join(__dirname, 'Frontend', 'src', 'app', 'features', 'company', 'terms-of-service.component.ts');
let componentCode = fs.readFileSync(componentPath, 'utf8');

const startMarker = '<div class="policy-container">';
const endMarker = '</div>\n      </div>\n    </div>';

const startIndex = componentCode.indexOf(startMarker) + startMarker.length;
const endIndex = componentCode.indexOf(endMarker);

const newComponentCode = componentCode.slice(0, startIndex) + '\n' + fixedHtml + '\n        ' + componentCode.slice(endIndex);

fs.writeFileSync(componentPath, newComponentCode);

console.log("Updated terms-of-service.component.ts");
