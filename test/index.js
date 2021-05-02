const { token, refreshToken } = require('./config');
const { Client } = require('../dist/index');

const client = new Client();

client.on('ready', async () => {
	await client.user.joinRoom('83c02ec8-8893-448c-a334-acfe9429bd12');

	const room = client.rooms.get('83c02ec8-8893-448c-a334-acfe9429bd12');

	room.send(';');
	console.log('ready');
});

client.on('message', (msg) => console.log(msg.content));

// client.on('raw', console.log);

client.on('userLeave', console.log);

client.on('error', console.error);

client.on('userJoin', console.log);

client.login(token, refreshToken);
