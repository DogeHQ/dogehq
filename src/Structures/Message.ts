import { Message as MessageInfo, tokensToString, User as UserInfo, stringToToken } from '@dogehouse/kebab';
import { User, UUID } from './User';
import { Client } from './Client';

/**
 * The message class.
 * @param {Client} client - The client.
 * @param {MessageInfo} message - The message.
 */
export class Message {
	/**
	 * The client that instantiated the message.
	 * @type {Client}
	 */
	public client: Client;

	/**
	 * The id of the message.
	 * @type {UUID}
	 */
	public id: UUID;

	/**
	 * The message author.
	 * @type {User}
	 */
	public author!: User;

	/**
	 * The color of the message.
	 * @type {string}
	 */
	public color: string;

	/**
	 * The content of the message.
	 * @type {string}
	 */
	public content: string;

	/**
	 * If the message has been deleted.
	 * @type {boolean|undefined}
	 */
	public deleted?: boolean;

	/**
	 * The deleter id. (If deleted.)
	 * @type {UUID|undefined}
	 */
	public deleterId?: UUID;

	/**
	 * The date format when the message was sent.
	 * @type {string}
	 */
	public sentAt: string;

	/**
	 * If the message is a whisper.
	 * @type {boolean|undefined}
	 */
	public isWhisper?: boolean;

	public constructor(client: Client, message: MessageInfo) {
		this.client = client;

		this.id = message.id;
		this.color = message.color;
		this.content = tokensToString(message.tokens);
		this.deleted = message.deleted;
		this.deleterId = message.deleterId;
		this.sentAt = message.sentAt;
		this.isWhisper = message.isWhisper;

		void client.wrapper.query.search(message.username).then(({ items }) => {
			const item = items[0] as UserInfo;

			this.author = new User(client, item);
		});

		client.users.set(this.id, this.author);
	}

	/**
	 * Replies to a message.
	 * @param {string} content - The content.
	 */
	public async reply(content: string): Promise<void> {
		await this.client.wrapper.mutation.sendRoomChatMsg(
			stringToToken(`@${this.author.displayName}, ${content}`),
		);
	}

	/**
	 * Deletes a message.
	 * @param {number} [timeout] - The timeout.
	 */
	public async delete(timeout?: number): Promise<void> {
		if (timeout) {
			/* eslint-disable */
			this.client.setTimeout(async () => {
				await this.client.wrapper.mutation.deleteRoomChatMessage(this.author.id, this.id);
			}, timeout); /* eslint-enable */
		}

		await this.client.wrapper.mutation.deleteRoomChatMessage(this.author.id, this.id);
	}
}
