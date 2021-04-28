import { stringToToken, Room as RoomInfo } from '@dogehouse/kebab';
import { Collection } from './Collection';
import { Client } from './Client';
import { User } from './User';

export type PeoplePreview = Array<{
	id: string;
	displayName: string;
	numFollowers: number;
}>;

export type EditResponse = { error: string } | { room: RoomInfo };

/**
 * The room class.
 * @param {Wrapper} client - The client.
 * @param {RoomInfo} room - The room.
 */
export class Room {
	/**
	 * The client that instantiated the room.
	 * @type {Wrapper}
	 */
	public client: Client;

	/**
	 * The description of the room.
	 * @type {?string}
	 */
	public description: string | null;

	/**
	 * The id of the room.
	 * @type {string}
	 */
	public id: string;

	/**
	 * The name of the room.
	 * @type {string}
	 */
	public name: string;

	/**
	 * If the room is private.
	 * @type {boolean}
	 */
	public isPrivate: boolean;

	/**
	 * The number of people in the room.
	 * @type {number}
	 */
	public peopleCount: number;

	/**
	 * The voice server id of the room.
	 * @type {string}
	 */
	public voiceServerId: string;

	/**
	 * The id of the creator.
	 * @type {string}
	 */
	public creatorId: string;

	/**
	 * The preview of the people in the room.
	 * @type {PeoplePreview}
	 */
	public peoplePreviewList: PeoplePreview;

	/**
	 * The time the room was inserted.
	 * @type {string}
	 */
	public insertedAt: string;

	/**
	 * The list of users in the room.
	 * @type {Collection<string, User>}
	 */
	public users: Collection<string, User>;

	public constructor(client: Client, room: RoomInfo) {
		this.client = client;

		this.description = room.description ?? null;
		this.id = room.id;
		this.name = room.name;
		this.isPrivate = room.isPrivate;
		this.peopleCount = room.numPeopleInside;
		this.voiceServerId = room.voiceServerId;
		this.peoplePreviewList = room.peoplePreviewList;
		this.creatorId = room.creatorId;
		this.insertedAt = room.inserted_at;
		this.users = new Collection();

		void this._setUsers();
	}

	/**
	 * Sends a message to the room.
	 * @param {string} message - The message you wanna send.
	 * @param {string[]} [whisperedTo] - An array of usernames to whisper.
	 */
	public async send(message: string, whisperedTo?: string[]): Promise<void> {
		await this.client.wrapper.mutation.sendRoomChatMsg(stringToToken(message), whisperedTo);
	}

	/**
	 * Asks the room moderators to let the bot speak.
	 */
	public askToSpeak(): void {
		this.client.wrapper.mutation.askToSpeak();
	}

	/**
	 * Invites a user to the room.
	 * @param {string} userId - The user id of the user.
	 */
	public inviteToRoom(userId: string): void {
		this.client.wrapper.mutation.inviteToRoom(userId);
	}

	/**
	 * Mutes the bot.
	 * @param {boolean} isMuted - If you want to mute the bot.
	 * @returns {Promise<Record<string, never>>} The response.
	 */
	public setMute(isMuted: boolean): Promise<Record<string, never>> {
		return this.client.wrapper.mutation.setMute(isMuted);
	}

	/**
	 * Deafens the bot.
	 * @param {boolean} isDeafened - If you want to deafen the bot.
	 * @returns {Promise<Record<string, never>>} The response.
	 */
	public setDeaf(isDeafened: boolean): Promise<Record<string, never>> {
		return this.client.wrapper.mutation.setDeaf(isDeafened);
	}

	/**
	 * Adds a speaker to the room.
	 * @param {string} userId - The id of the user.
	 */
	public async addSpeaker(userId: string): Promise<void> {
		await this.client.wrapper.mutation.addSpeaker(userId);
	}

	/**
	 * Leaves the room.
	 * @returns {Promise<string>} The room id.
	 */
	public async leaveRoom(): Promise<string> {
		const { roomId } = await this.client.wrapper.mutation.leaveRoom();

		await this.client.emit('userLeave', [this.client.user ?? undefined, this]);

		return roomId;
	}

	/**
	 * Joins the room.
	 */
	public async join(): Promise<void> {
		await this.client.wrapper.query.joinRoomAndGetInfo(this.id);

		await this.client.emit('joinRoom', this);
	}

	/**
	 * Changes the room creator.
	 * @param {string} userId - The id of the user.
	 */
	public async changeRoomCreator(userId: string): Promise<void> {
		await this.client.wrapper.mutation.changeRoomCreator(userId);
	}

	/**
	 * Bans a user from the room.
	 * @param {string} userId - The id of the user.
	 * @param {boolean} [shouldBanIp] - If you want to ip ban.
	 */
	public ban(userId: string, shouldBanIp?: boolean): void {
		this.client.wrapper.mutation.roomBan(userId, shouldBanIp ? shouldBanIp : false);
	}

	/**
	 * Edits the room.
	 * @param {Object} data - The room data.
	 * @param {string} data.name - The room name.
	 * @param {string} data.privacy - The privacy of the room.
	 * @param {string} data.description - The description of the room.
	 * @returns {Promise<EditResponse>} The data.
	 */
	public async editRoom(data: { name: string; privacy: string; description: string }): Promise<EditResponse> {
		return this.client.wrapper.mutation.editRoom(data);
	}

	/**
	 * Bans a user in chat.
	 * @param {string} userId - The id of the user.
	 */
	public async banFromChat(userId: string): Promise<void> {
		await this.client.wrapper.mutation.banFromRoomChat(userId);
	}

	/**
	 * Unbans a user from the room.
	 * @param {string} userId - The id of the user.
	 */
	public async unban(userId: string): Promise<void> {
		await this.client.wrapper.mutation.unbanFromRoom(userId);
	}

	/**
	 * Unbans a user from the room chat.
	 * @param {string} userId - The id of the user.
	 */
	public async unbanFromChat(userId: string): Promise<void> {
		await this.client.wrapper.mutation.unbanFromRoomChat(userId);
	}

	/**
	 * Blocks a user from the room.
	 * @param {string} userId - The id of the user.
	 * @param {string} [reason] - The reason.
	 */
	public block(userId: string, reason?: string): void {
		this.client.wrapper.mutation.ban(userId, reason ? reason : 'No reason provided.');
	}

	/**
	 * Sets the users in the collection.
	 * @private
	 */
	private async _setUsers(): Promise<void> {
		const { users } = await this.client.wrapper.query.getRoomUsers();

		users.forEach((user) => this.users.set(user.id, new User(this.client, user)));
	}
}
