# Example Bot

Here's an example bot that you can use.

```js
const { Client } = require('dogehq');

const client = new Client();
const config = {
	token: 'your_token_here',
	refreshToken: 'your_refresh_token_here',
	prefix: 'your_preffered_prefix_here',
};

// when the client is ready
client.once('ready', () => {
	console.log('Ready!');

	// join the top room
	client.rooms.first().join();
});

client.on('message', (message) => {
	if (!message.content.startsWith(config.prefix)) return; // if the message doesn't start with the prefix, dont respond

	const args = message.content.slice(config.prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'ping') {
		message.room.send('Pong!');
	} else if (command === 'pong') {
		message.room.send('Ping!');
	} else if (command === 'food') {
		if (args.length === 0) return; // if the argument isnt there, dont respond
		message.room.send(`You like ${args[0]}? I like it too!`);
	}
});

client.login(config.token, config.refreshToken);
```
