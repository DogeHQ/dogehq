const { token, refreshToken } = require('./config');
const { Client } = require('../dist/index');

const client = new Client();

client.on('ready', async () => {
	await client.rooms.first().join();

	console.log('ready');
});

client.on('userLeave', console.log);

client.on('userJoin', console.log);

client.login(token, refreshToken);
