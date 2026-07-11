const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

console.log('Starting server...');
const server = spawn('node', [serverPath], { cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'] });

let serverStarted = false;
const timeoutMs = 15000;

const timer = setTimeout(() => {
  console.error('Server did not start within timeout');
  server.kill();
  process.exit(1);
}, timeoutMs);

server.stdout.on('data', (data) => {
  const out = data.toString();
  process.stdout.write(`[SERVER] ${out}`);
  if (out.includes('SPOTFY rodando')) {
    clearTimeout(timer);
    serverStarted = true;
    // Wait a bit to ensure it's listening
    setTimeout(runTests, 1500);
  }
});

server.stderr.on('data', (data) => {
  process.stderr.write(`[SERVER-ERR] ${data.toString()}`);
});

async function runTests() {
  try {
    console.log('Running /api/search test...');
    const res = await fetch('http://localhost:3000/api/search?q=bonnie%20tyler');
    const json = await res.json();
    console.log('SEARCH RESULT COUNT:', json.results ? json.results.length : 0);
    console.log('Sample result:', json.results ? json.results[0] : null);

    console.log('Running /api/proxy-page test (Kboing)...');
    const pageRes = await fetch(`http://localhost:3000/api/proxy-page?url=https://www.kboing.com.br/bonnie-tyler/total-eclipse-of-the-heart/`);
    const pageHtml = await pageRes.text();
    console.log('Proxy page length:', pageHtml.length);
    console.log('Proxy page snippet:', pageHtml.slice(0, 200));
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    console.log('Killing server...');
    server.kill();
    process.exit(0);
  }
}