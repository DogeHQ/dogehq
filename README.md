# dogehq

> API Wrapper for [@dogehouse/kebab](https://npmjs.com/package/@dogehouse/kebab)

<div align="center">
	<p>
		<a href="https://www.npmjs.com/package/dogehq"><img src="https://img.shields.io/npm/v/dogehq.svg?maxAge=3600" alt="NPM version" /></a>
		<a href="https://www.npmjs.com/package/dogehq"><img src="https://img.shields.io/npm/dt/dogehq?maxAge=3600" alt="NPM downloads" /></a>
		<a href="https://david-dm.org"><img src="https://david-dm.org/DogeHQ/dogehq.svg" alt="Dependencies" /></a>
		<a href="https://david-dm.org"><img src="https://david-dm.org/DogeHQ/dogehq/dev-status.svg" alt="Dev Dependencies" /></a>
		<a href="https://prettier.io"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="Prettier" /></a>
		<a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate" /></a>
		<br />
		<a href="https://github.com/DogeHQ/dogehq"><img src="https://github.com/DogeHQ/dogehq/actions/workflows/lint.yml/badge.svg" alt="ESLint" /></a>
		<a href="https://github.com/DogeHQ/dogehq"><img src="https://github.com/DogeHQ/dogehq/actions/workflows/docs.yml/badge.svg" alt="Docs" /></a>
		<a href="https://github.com/DogeHQ/dogehq"><img src="https://github.com/DogeHQ/dogehq/actions/workflows/codeql-analysis.yml/badge.svg" alt="CodeQL" /></a>
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
npm i dogehq --no-optional --production
```

> With voice support

```bash
npm i dogehq --production
```

## Documentation

https://dogehq.js.org

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

## Credits

- [@discordjs/collection](https://npmjs.com/package/@discordjs/collection)
- [@fuwwy](https://github.com/fuwwy)
- [@dogehouse/kebab](https://npmjs.com/package/@dogehouse/kebab)

## Author

**dogehq** © [1chiSensei](https://github.com/1chiSensei), Released under the [Apache-2.0](https://github.com/Shukaaku/dogehq/blob/main/LICENSE) License.<br>
Authored and maintained by 1chiSensei.

> GitHub [@1chiSensei](https://github.com/1chiSensei)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://renovate.whitesourcesoftware.com/"><img src="https://avatars.githubusercontent.com/u/25180681?v=4?s=100" width="100px;" alt=""/><br /><sub><b>WhiteSource Renovate</b></sub></a><br /><a href="#infra-renovate-bot" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/fuwwy"><img src="https://avatars.githubusercontent.com/u/9268058?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Checkium</b></sub></a><br /><a href="https://github.com/DogeHQ/dogehq/commits?author=fuwwy" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/FrostyTheDumDum"><img src="https://avatars.githubusercontent.com/u/75714323?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Frosty!</b></sub></a><br /><a href="#maintenance-FrostyTheDumDum" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
