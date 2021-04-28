const { token, refreshToken } = require('./config');
const { Client } = require('../dist/index');

const client = new Client();

client.on('ready', async () => {
	console.log('ready');

	await client.rooms.first().join();
});

client.on('userLeave', console.log);

client.on('userJoin', console.log);

client.login(token, refreshToken);
