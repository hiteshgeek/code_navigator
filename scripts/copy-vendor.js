const fs = require('fs');
const path = require('path');

// This script copies the vendor directory to the out/dist/ or extension root for packaging
// Usage: node copy-vendor.js

const srcVendor = path.resolve(__dirname, '../vendor');
const destVendor = path.resolve(__dirname, '../dist/vendor');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

if (!fs.existsSync(srcVendor)) {
    console.error('No vendor directory found at', srcVendor);
    process.exit(1);
}

copyRecursiveSync(srcVendor, destVendor);
console.log('Vendor directory copied to', destVendor);
