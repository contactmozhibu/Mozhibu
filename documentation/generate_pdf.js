const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

(async () => {
    console.log('Generating PDF...');
    try {
        const headerImagePath = path.join(__dirname, 'documentation.images', 'header_image.png');
        const footerImagePath = path.join(__dirname, 'documentation.images', 'footer_image.png');

        const headerBase64 = fs.readFileSync(headerImagePath).toString('base64');
        const footerBase64 = fs.readFileSync(footerImagePath).toString('base64');

        const pdf = await mdToPdf({ path: 'Mozhibu_Complete_Documentation.md' }, {
            css: `
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                
                /* Page break management for professional layout */
                h1, h2, h3, h4, h5 { page-break-after: avoid; }
                table, tr, td, th { page-break-inside: avoid; }
                blockquote, pre, img { page-break-inside: avoid; }
                p, li { orphans: 3; widows: 3; }
                
                h1, h2, h3, h4, h5, h6 {
                    color: #2c3e50;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                }
                h1 { border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
                h2 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
                code { background-color: #f8f9fa; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                pre { background-color: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #e9ecef; }
                table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                th, td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; }
                th { background-color: #f8f9fa; }
                blockquote { border-left: 4px solid #0056b3; margin: 0; padding-left: 15px; color: #555; background: #f8f9fa; padding: 10px 15px; }
            `,
            pdf_options: {
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: '<style>#header { padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact; }</style><div style="width: 100%; text-align: center;"><img src="data:image/png;base64,' + headerBase64 + '" style="width: 451.7pt; height: 60.45pt; margin-top: 0.2in;" /></div>',
                footerTemplate: '<style>#footer { padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact; }</style><div style="width: 100%; text-align: center;"><img src="data:image/png;base64,' + footerBase64 + '" style="width: 328.1pt; height: 21.05pt; margin-bottom: 0.2in;" /></div>',
                margin: { top: '1.2in', right: '1in', bottom: '1in', left: '1in' }
            }
        });

        if (pdf) {
            fs.writeFileSync('mozhibu.pdf', pdf.content);
            console.log('Successfully generated mozhibu.pdf!');
        }
    } catch (err) {
        console.error('Error generating PDF:', err);
    }
})();
