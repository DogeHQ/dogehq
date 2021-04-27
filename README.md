# dogehq

> API Wrapper for [@dogehouse/kebab](https://npmjs.com/package/@dogehouse/kebab)

<div align="center">
	<p>
		<a href="https://www.npmjs.com/package/dogehq"><img src="https://img.shields.io/npm/v/dogehq.svg?maxAge=3600" alt="NPM version" /></a>
		<a href="https://www.npmjs.com/package/dogehq"><img src="https://img.shields.io/npm/dt/dogehq?maxAge=3600" alt="NPM downloads" /></a>
		<a href="https://david-dm.org/Shukaaku/dogehq"><img src="https://david-dm.org/Shukaaku/dogehq/status.svg?maxAge=3600" alt="Dependencies" /></a>
	</p>
	<p>
		<a href="https://nodei.co/npm/dogehq/"><img src="https://nodei.co/npm/dogehq.png?downloads=true&stars=true" alt="NPM info" /></a>
	</p>
</div>

## Features

- Actually maintained
- Supports bot creation
- Uses async/await
- Uses [@discordjs/collection](https://npmjs.com/package/@discordjs/collection) to store users, rooms, etc.
- Typescript support

## Install

```bash
yarn add dogehq
```

## Documentation

https://shukaaku.github.io/dogehq

## Support

https://discord.gg/ZrrAQ3HAdK

## Usage

```js
const { Client } = require('dogehq');

const client = new Client();

client.on('ready', () => console.log(`Logged in as ${client.user.username} (${client.user.id}).`));

client.login('token', 'accessToken');
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**dogehq** © [1chiSensei](https://github.com/1chiSensei), Released under the [Apache-2.0](https://github.com/Shukaaku/dogehq/blob/main/LICENSE) License.<br>
Authored and maintained by 1chiSensei.

> GitHub [@1chiSensei](https://github.com/1chiSensei)
