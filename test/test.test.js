const { token, refreshToken } = require('./config');
const ytdl = require('ytdl-core-discord');
const { Client } = require('../dist/index');

const client = new Client();

client.on('ready', async () => {
	await client.user.joinRoom('07812173-030b-41ef-89cd-9f0fab6f9536');

	const room = client.rooms.get('07812173-030b-41ef-89cd-9f0fab6f9536');

	room.askToSpeak();
	await room.connectToAudio();
	room.audioConnection.play(ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), { type: 'opus' });

	console.log('ready');
});

client.on('message', (msg) => console.log(msg.content));

// client.on('raw', console.log);

client.on('userLeave', console.log);

client.on('error', console.error);

client.on('userJoin', console.log);

client.login(token, refreshToken);
