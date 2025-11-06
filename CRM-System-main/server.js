const jsonServer = require("json-server");
const path = require('path');
const express = require('express');

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || process.env.SERVER_PORT || 3001;

// JSON Server middlewares (logger, static, cors, no-cache)
server.use(middlewares);

// Serve frontend static files from repo root
server.use(express.static(path.join(__dirname, '/')));

// Mount json-server API under /api to avoid conflicting with static files
server.use('/api', router);

// SPA fallback: serve index.html for any other route
server.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});