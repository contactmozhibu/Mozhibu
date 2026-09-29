const fs = require('fs');
const path = require('path');

const dir = 'c:/projects/Mozhibu - Story/Frontend/src/app/features/admin';

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync(dir, function(filePath) {
    if (filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Regex for colors that should be text
        content = content.replace(/color:\s*#(111|1e293b|1f2937|333|1e342c);/gi, 'color: var(--sd-text);');
        content = content.replace(/color:\s*#(444|555|666|6b7280|4b5563|64748b|94a3b8);/gi, 'color: var(--sd-muted);');
        // Border colors
        content = content.replace(/border(-[a-z]+)*-color:\s*#(ccc|e2e8f0|1e342c|d1d5db);/gi, 'border$1-color: var(--sd-border);');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
