const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 9000;
const SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const LOG_FILE = path.join(__dirname, 'deploy.log');
const PROJECT_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'lfcrea-frontend');

function log(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, formattedMessage);
}

const server = http.createServer((req, res) => {
    log(`Received ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];
            if (!signature) {
                log('Error: Missing X-Hub-Signature-256 header');
                res.statusCode = 401;
                return res.end('Missing signature');
            }

            const hmac = crypto.createHmac('sha256', SECRET);
            const digest = 'sha256=' + hmac.update(body).digest('hex');

            if (signature !== digest) {
                log('Error: Invalid signature');
                res.statusCode = 401;
                return res.end('Invalid signature');
            }

            const payload = JSON.parse(body);
            if (payload.ref === 'refs/heads/master') {
                log('Valid push to master detected. Starting deployment...');
                
                const deployCommand = `cd ${PROJECT_DIR} && git pull && npm install && npm run build && pm2 restart lfcrea-frontend`;
                
                exec(deployCommand, (error, stdout, stderr) => {
                    if (error) {
                        log(`Deployment Error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        log(`Deployment Stderr: ${stderr}`);
                    }
                    log(`Deployment Stdout: ${stdout}`);
                    log('Deployment completed successfully.');
                });

                res.statusCode = 200;
                res.end('Deployment started');
            } else {
                log(`Push to branch ${payload.ref} ignored.`);
                res.statusCode = 200;
                res.end('Branch ignored');
            }
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    log(`Webhook server listening on port ${PORT}`);
});
