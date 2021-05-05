import { raw, wrap, Wrapper, InvitationToRoomResponse, http, audioWrap } from '@dogehouse/kebab';
import { AudioConnectionOptions } from './Voice/Connection';
import { TypedEventEmitter } from '../Util/TypedEmitter';
import { baseUrl } from '../Util/Constants';
import { Collection } from './Collection';
import { ClientUser } from './ClientUser';
import EventEmitter from 'eventemitter3';
import { Message } from './Message';
import { Room } from './Room';
import { User } from './User';

export interface BotCredentials {
	accessToken: string;
	refreshToken: string;
	username: string;
}

export interface ClientOptions {
	apiUrl?: string;
	fetchTimeout?: number;
}

export interface ClientEvents {
	ready: () => void;
	userJoin: (user?: User) => void;
	message: (message: Message) => void;
	userLeave: (user?: User, room?: Room) => void;
	handRaised: (user?: User) => void;
	invite: (invite: InvitationToRoomResponse) => void;
	joinRoom: (room: Room) => void;
	leaveRoom: (room: Room) => void;
	raw: (data: string) => void;
	error: (error: Error) => void;
	speakerAdd: (user?: User) => void;
	speakerRemove: (user?: User) => void;
}

/**
 * The main client class.
 * @extends {EventEmitter}
 * @param {ClientOptions|undefined} options - The client options.
 * @example ```js
 * const { Client } = require('dogehq');
 * const client = new Client();
 *
 * client.on('ready', () => console.log('Im ready!'));
 *
 * client.login('token', 'accessToken');
 * ```
 */
export class Client extends ((EventEmitter as any) as new () => TypedEventEmitter<ClientEvents>) {
	/**
	 * The timeouts.
	 * @type {Set<NodeJS.Timeout>}
	 */
	private readonly _timeouts = new Set<NodeJS.Timeout>();

	/**
	 * The intervals.
	 * @type {Set<NodeJS.Timeout>}
	 */
	private readonly _intervals = new Set<NodeJS.Timeout>();

	/**
	 * The immediates.
	 * @type {Set<NodeJS.Immediate>}
	 */
	private readonly _immediates = new Set<NodeJS.Immediate>();

	/**
	 * The client options that you set.
	 * @type {ClientOptions}
	 */
	private readonly _options?: ClientOptions;

	/**
	 * The raw connection.
	 * @type {raw.Connection}
	 */
	public connection!: raw.Connection;

	/**
	 * The wrapper.
	 * @type {Wrapper}
	 */
	public wrapper!: Wrapper;

	/**
	 * The top public rooms.
	 * @type {Collection<string, Room>}
	 */
	public rooms!: Collection<string, Room>;

	/**
	 * The users.
	 * @type {Collection<string, User>}
	 */
	public users!: Collection<string, User>;

	/**
	 * The token that you used to auth.
	 * @type {?string}
	 */
	public token!: string | null;

	/**
	 * The refresh token that you used to auth.
	 * @type {?string}
	 */
	public refreshToken!: string | null;

	/**
	 * The client user.
	 * @type {?ClientUser}
	 */
	public user!: ClientUser | null;

	/**
	 * The voice data cache.
	 * @type {AudioConnectionOptions}
	 */
	public voiceDataCache: AudioConnectionOptions;

	/**
	 * The audio wrapper.
	 */
	public audioWrapper!: ReturnType<typeof audioWrap>;

	public constructor(options?: ClientOptions) {
		super();

		this._options = options;
		this.voiceDataCache = {};
	}

	/**
	 * Login to the DogeHouse API.
	 * @param {string} token - The token.
	 * @param {string} refreshToken - The refresh token.
	 */
	public async login(token: string, refreshToken: string): Promise<void> {
		if (!token || !refreshToken) throw new Error('The token and/or the access token is required!');

		this.connection = await raw.connect(token, refreshToken, {
			onConnectionTaken: () => {
				throw new Error('You can only login on only one account at the same time.');
			},
			logger: (direction, opcode, _, fetchId, raw) => {
				const directionPadded = direction.toUpperCase().padEnd(3, ' ');
				const fetchIdInfo = fetchId ? ` (addListener id ${fetchId})` : '';

				this.emit('raw', `${directionPadded} "${opcode}"${fetchIdInfo}: ${raw ?? ''}`);
			},
			onClearTokens: () => {
				const err = new Error(
					"Oh no. An error occured. Your token may be wrong or you're trying to access something that you don't have access to.",
				);

				this.emit('error', err);
				throw err;
			},
			url: this._options?.apiUrl ?? baseUrl,
			fetchTimeout: this._options?.fetchTimeout,
		});
		this.user = new ClientUser(this);
		this.rooms = new Collection<string, Room>();
		this.users = new Collection<string, User>();
		this.wrapper = wrap(this.connection);
		this.audioWrapper = audioWrap(this.connection);
		this.wrapper.subscribe.newChatMsg((data) => {
			this.emit('message', new Message(this, data.msg));
		});
		this.wrapper.subscribe.userJoinRoom(({ user }) => {
			const useR = new User(this, user);
			this.emit('userJoin', useR);
			this.users.set(useR.id, useR);
		});
		this.wrapper.subscribe.userLeaveRoom(({ userId, roomId }) =>
			this.emit('userLeave', this.users.get(userId), this.rooms.get(roomId)),
		);
		this.wrapper.subscribe.handRaised(({ userId }) => this.emit('handRaised', this.users.get(userId)));
		this.wrapper.subscribe.invitationToRoom((data) => this.emit('invite', data));
		this.wrapper.subscribe.speakerAdded(({ userId }) => {
			const user = this.users.get(userId);
			this.emit('speakerAdd', user);
			const room = this.rooms.get(user?.currentRoomId || '');
			room?.speakers.set(user?.id || '', user as User);
		});
		this.wrapper.subscribe.speakerRemoved(({ userId }) => {
			const user = this.users.get(userId);
			this.emit('speakerRemove', user);
			const room = this.rooms.get(user?.currentRoomId || '');
			room?.speakers.delete(user?.id || '');
		});
		this.audioWrapper.subscribe.youBecameSpeaker(
			({ sendTransportOptions }) => (this.voiceDataCache.sendTransportOptions = sendTransportOptions),
		);
		this.audioWrapper.subscribe.youJoinedAsPeer(({ recvTransportOptions, routerRtpCapabilities }) => {
			this.voiceDataCache.recvTransportOptions = recvTransportOptions;
			this.voiceDataCache.routerRtpCapabilities = routerRtpCapabilities;
		});
		this.audioWrapper.subscribe.youJoinedAsSpeaker(
			({ recvTransportOptions, routerRtpCapabilities, sendTransportOptions }) => {
				this.voiceDataCache.recvTransportOptions = recvTransportOptions;
				this.voiceDataCache.routerRtpCapabilities = routerRtpCapabilities;
				this.voiceDataCache.sendTransportOptions = sendTransportOptions;
			},
		);
		this.token = token;
		this.refreshToken = refreshToken;

		const { rooms } = await this.wrapper.query.getTopPublicRooms();

		rooms.forEach((room) => {
			this.rooms.set(room.id, new Room(this, room));
		});
		this.emit('ready');
	}

	/**
	 * Creates a bot account.
	 * @param {string} username - The username of the bot account.
	 * @returns {Promise<string|null>} The api key.
	 */
	public async createBot(username: string): Promise<string | null> {
		const data = await this.wrapper.mutation.userCreateBot(username);

		if (data.isUsernameTaken) throw new Error(`The username "${username}" is taken`);

		return data.apiKey;
	}

	/**
	 * Gets the bot's credentials.
	 * @param {string} apiKey The api key.
	 * @returns {Promise<BotCredentials>} The bot credentials.
	 */
	public async getBotCredentials(apiKey: string): Promise<BotCredentials> {
		const data = await http.bot.auth(apiKey);

		return data;
	}

	/**
	 * Destroys the WS Connection.
	 */
	public destroy(): void {
		this.connection.close();
		this.user = null;
		this.token = null;
		this.refreshToken = null;

		for (const t of this._timeouts) this.clearTimeout(t);
		for (const i of this._intervals) this.clearInterval(i);
		for (const x of this._immediates) this.clearImmediate(x);

		this._timeouts.clear();
		this._intervals.clear();
		this._immediates.clear();
	}

	/**
	 * Sets whether the bot is speaking or not.
	 * @param {boolean} value If the bot should speak.
	 */
	public setSpeaking(value: boolean): void {
		this.connection.send('room:set_active_speaker', { active: value });
	}

	/**
	 * Sets a timeout.
	 * @param {Function} fn - The function to execute.
	 * @param {number} delay - Time to delay.
	 * @param {unknown[]} args - The extra args.
	 * @returns {NodeJS.Timeout} The timeout.
	 */
	public setTimeout(fn: (...args: unknown[]) => void, delay: number, ...args: unknown[]): NodeJS.Timeout {
		const timeout = setTimeout(() => {
			fn(...args);

			this._timeouts.delete(timeout);
		}, delay);

		this._timeouts.add(timeout);

		return timeout;
	}

	/**
	 * Sets an interval.
	 * @param {Function} fn - The function to execute.
	 * @param {number} delay - Time to execute.
	 * @param {unknown[]} args - The extra args.
	 * @returns {NodeJS.Timeout} The interval.
	 */
	public setInterval(fn: (...args: unknown[]) => void, delay: number, ...args: unknown[]): NodeJS.Timeout {
		const interval = this.setInterval(fn, delay, args);

		this._intervals.add(interval);

		return interval;
	}

	/**
	 * Sets an immediate.
	 * @param {Function} fn - The function to execute.
	 * @param {unknown[]} args - The extra args.
	 * @returns {NodeJS.Immediate} The immediate.
	 */
	public setImmediate(fn: (...args: unknown[]) => void, ...args: unknown[]): NodeJS.Immediate {
		const immediate = this.setImmediate(fn, ...args);

		this._immediates.add(immediate);

		return immediate;
	}

	/**
	 * Clears a timeout.
	 * @param {NodeJS.Timeout} timeout - The timeout to clear.
	 */
	public clearTimeout(timeout: NodeJS.Timeout): void {
		this.clearTimeout(timeout);
		this._timeouts.delete(timeout);
	}

	/**
	 * Clears an interval.
	 * @param {NodeJS.Timeout} interval - The interval to clear.
	 */
	public clearInterval(interval: NodeJS.Timeout): void {
		this.clearInterval(interval);
		this._intervals.delete(interval);
	}

	/**
	 * Clears an immediate.
	 * @param {NodeJS.Immediate} immediate - The immediate to clear.
	 */
	public clearImmediate(immediate: NodeJS.Immediate): void {
		this.clearImmediate(immediate);
		this._immediates.delete(immediate);
	}
}
