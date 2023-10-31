const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');
const express = require('express');


// Load the configuration file
const config = require('./config.json');

// Use the value of the "server_port" key from the config.json file
const serverPort = config.server_port;

const app = express();

app.use(express.static(path.join(__dirname, 'client')));

app.post('/upload', (req, res) => {
    const chunks = [];
    // Collect the data chunks of the request
    req.on('data', chunk => chunks.push(chunk));
    // When all data has been received, save the file to disk
    req.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const fileName = `image_${Date.now()}.jpg`;
        const filePath = path.join(__dirname, 'assets', fileName);
        fs.writeFile(filePath, buffer, err => {
            if (err) {
                console.error(chalk.red(err));
                res.statusCode = 500;
                res.end('Error uploading file');
            } else {
                console.debug(chalk.green(`File ${fileName} was received successfully`));
                // Spawn a child process to perform OCR on the file
                const ocrProcess = spawn('python3', ['lib/ocr.py', filePath]);
                // Log the output of the OCR process
                ocrProcess.stdout.on('data', data => {
                    console.debug(chalk.green(`OCR output: ${data}`));
                });
                // Log any errors from the OCR process
                ocrProcess.stderr.on('data', data => {
                    console.error(chalk.red(`OCR error: ${data}`));
                });
                // When the OCR process is done, send the file back to the client
                ocrProcess.on('exit', code => {
                    if (code === 0) {
                        // output file is same as fileName but with anyting after the . removed
                        const ocrFilePath = path.join(__dirname, 'assets', `${fileName.split('.')[0]}.html`);
                        // const ocrFilePath = path.join(__dirname, 'assets', `${fileName}.txt`);
                        // const ocrFilePath = path.join(__dirname, 'assets', `${fileName}.html`);
                        fs.readFile(ocrFilePath, (err, data) => {
                            if (err) {
                                console.error(chalk.red(err));
                                res.statusCode = 500;
                                res.end('Error reading OCR file');
                            } else {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'text/plain');
                                res.setHeader('Content-Disposition', `attachment; filename=${fileName}.html`);
                                res.end(data);
                            }
                        });
                    } else {
                        console.error(chalk.red(`OCR process exited with code ${code}`));
                        res.statusCode = 500;
                        res.end('Error performing OCR');
                    }
                });
            }
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(serverPort, () => {
    console.log(chalk.blue(`Server listening on port ${serverPort}`));
});