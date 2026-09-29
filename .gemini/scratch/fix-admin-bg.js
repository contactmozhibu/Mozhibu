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
    if (filePath.endsWith('.ts') || filePath.endsWith('.css') || filePath.endsWith('.scss')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Background replacements for table headers and light containers
        content = content.replace(/background(-color)?:\s*#(f8fafc|f9fafb|f9f9f9|f8f9fa|f5f5f5|f1f3f5);/gi, 'background$1: var(--sd-icon-btn);');
        
        // Background for main white areas (like modals) -> use var(--sd-sidebar)
        content = content.replace(/background(-color)?:\s*#(ffffff|fff);/gi, 'background$1: var(--sd-sidebar);');

        // Light red backgrounds -> use var(--sd-active-bg) or similar? No, just let it be, or replace with var(--sd-active-bg)
        content = content.replace(/background(-color)?:\s*#(fde8e8|fee2e2|ffebee|fce8e6);/gi, 'background$1: rgba(239, 68, 68, 0.1);');
        // Light green backgrounds
        content = content.replace(/background(-color)?:\s*#(def7ec|e6f4ea|e8f5e9);/gi, 'background$1: rgba(16, 185, 129, 0.1);');
        // Light blue backgrounds
        content = content.replace(/background(-color)?:\s*#(e3f2fd);/gi, 'background$1: rgba(59, 130, 246, 0.1);');
        // Light orange backgrounds
        content = content.replace(/background(-color)?:\s*#(fff3e0);/gi, 'background$1: rgba(245, 158, 11, 0.1);');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
