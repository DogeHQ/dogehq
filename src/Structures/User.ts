import { User as UserInfo, Room as RoomInfo } from '@dogehouse/kebab';
import { Client } from './Client';

export type UUID = string;

/**
 * The user class.
 * @param {Client} client - The client.
 * @param {UserInfo} user - The user.
 */
export class User {
	/**
	 * The client that instantiated the user.
	 * @type {Client}
	 */
	public client: Client;

	/**
	 * If the user follows you.
	 * @type {boolean|undefined}
	 */
	public following?: boolean;

	/**
	 * The username of the user.
	 * @type {string}
	 */
	public username: string;

	/**
	 * The room permissions of the user.
	 * @type {unknown|undefined}
	 */
	public roomPermissions?: unknown;

	/**
	 * If the user is online.
	 * @type {boolean}
	 */
	public online: boolean;

	/**
	 * The number of people that the user follows.
	 * @type {number}
	 */
	public followingCount: number;

	/**
	 * The number of followers of the user.
	 * @type {number}
	 */
	public followers: number;

	/**
	 * When the user was last online.
	 * @type {string}
	 */
	public lastOnline: string;

	/**
	 * The id of the user.
	 * @type {UUID}
	 */
	public id: UUID;

	/**
	 * Whether the user follows you.
	 * @type {boolean}
	 */
	public followsYou?: boolean;

	/**
	 * The display name of the user.
	 * @type {string}
	 */
	public displayName: string;

	/**
	 * The current room id of the user.
	 * @type {UUID|undefined}
	 */
	public currentRoomId?: UUID;

	/**
	 * The current room of the user.
	 * @type {RoomInfo}
	 */
	public currentRoom: RoomInfo;

	/**
	 * The bio of the user.
	 * @type {?string}
	 */
	public bio: string | null;

	/**
	 * The avatar url of the user.
	 * @type {?string}
	 */
	public avatarUrl: string | null;

	/**
	 * The banner url of the user.
	 * @type {?string}
	 */
	public bannerUrl: string | null;

	public constructor(client: Client, user: UserInfo) {
		this.client = client;

		this.following = user.followsYou;
		this.username = user.username;
		this.roomPermissions = user.roomPermissions;
		this.online = user.online;
		this.followingCount = user.numFollowing;
		this.followers = user.numFollowers;
		this.lastOnline = user.lastOnline;
		this.id = user.id;
		this.followsYou = user.followsYou;
		this.displayName = user.displayName;
		this.currentRoom = user.currentRoom;
		this.currentRoomId = user.currentRoomId;
		this.bio = user.bio;
		this.avatarUrl = user.avatarUrl;
		this.bannerUrl = user.bannerUrl;
	}

	/**
	 * Follows the user.
	 * @param {boolean} value - If you want to follow the user.
	 */
	public async follow(value: boolean): Promise<void> {
		await this.client.wrapper.mutation.follow(this.id, value);
	}
}
