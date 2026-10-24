// A fixture of the Eris launch check: each route proves one thing a
// Deployment should have handed the Container.
const { createHash } = require('node:crypto');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const path = require('node:path');
const express = require('express');
const { Client } = require('pg');

const app = express();
const port = Number(process.env.PORT || 3000);
const volumePath = process.env.VOLUME_PATH || '/data';

app.get('/', (_request, response) => {
  response.send('eris-launch-check-app');
});

app.get('/healthz', (_request, response) => {
  response.send('ok');
});

// The Builder drops .git, so a commit marks itself by writing VERSION.
app.get('/version', (_request, response) => {
  response.type('text').send(readFileSync(path.join(__dirname, 'VERSION'), 'utf8').trim());
});

// A hash, so a Secret is compared without being shown.
app.get('/env/:name', (request, response) => {
  const value = process.env[request.params.name];

  if (value === undefined) {
    response.status(404).send('unset');
    return;
  }

  response.type('text').send(createHash('sha256').update(value).digest('hex'));
});

app.get('/storage', async (_request, response) => {
  if (!process.env.DATABASE_URL) {
    response.status(503).send('no DATABASE_URL');
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    await client.query('SELECT 1');
    response.send('ok');
  } catch (error) {
    response.status(503).send(String(error.message));
  } finally {
    await client.end().catch(() => {});
  }
});

const volumeFile = path.join(volumePath, 'launch-check.txt');

app.get('/volume', (_request, response) => {
  try {
    response.type('text').send(readFileSync(volumeFile, 'utf8'));
  } catch {
    response.status(404).send('nothing written');
  }
});

app.put('/volume', express.text(), (request, response) => {
  try {
    mkdirSync(volumePath, { recursive: true });
    writeFileSync(volumeFile, request.body || new Date().toISOString());
    response.type('text').send(readFileSync(volumeFile, 'utf8'));
  } catch (error) {
    response.status(500).send(String(error.message));
  }
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
