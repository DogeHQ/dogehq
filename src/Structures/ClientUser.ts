import { JoinRoomAndGetInfoResponse, Room as RoomInfo, ScheduledRoom as ScheduledRoomInfo } from '@dogehouse/kebab';
import { ScheduledRoom } from './ScheduledRoom';
import { Client } from './Client';
import { User } from './User';
import { Room } from './Room';

export interface ProfileData {
	displayName: string;
	username: string;
	bio: string;
	avatarUrl: string;
	bannerUrl?: string;
}

export interface RoomData {
	name: string;
	privacy: string;
	description: string;
}

export interface ScheduledRoomData {
	name: string;
	description: string;
	scheduledFor: string;
}

/**
 * The client user.
 * @extends {User}
 * @param {Client} client - The client.
 */
export class ClientUser extends User {
	public constructor(client: Client) {
		super(client, client.connection.user);

		this.client = client;
	}

	/**
	 * Edits the bot profile.
	 * @param {ProfileData} data - The profile data.
	 */
	public async editProfile(data: ProfileData): Promise<void> {
		const { isUsernameTaken } = await this.client.wrapper.mutation.editProfile(data);

		if (isUsernameTaken) throw new Error(`Username "${data.username}" is already taken.`);
	}

	/**
	 * Creates a room.
	 * @param {RoomData} data - The room data.
	 * @returns {Promise<Room>} The created room.
	 */
	public async createRoom(data: RoomData): Promise<Room> {
		const info = ((await this.client.wrapper.mutation.createRoom(data)) as unknown) as RoomInfo;

		return new Room(this.client, info);
	}

	/**
	 * Create a scheduled room.
	 * @param {ScheduledRoomData} data - The data.
	 * @returns {Promise<ScheduledRoom>} The scheduled room.
	 */
	public async createScheduledRoom(data: ScheduledRoomData): Promise<ScheduledRoom> {
		const info = (await this.client.wrapper.mutation.createScheduledRoom(data)) as ScheduledRoomInfo;

		return new ScheduledRoom(this.client, info);
	}

	/**
	 * Creates a room from a scheduled room.
	 * @param {Object} data - The room data.
	 * @param {string} data.id - The scheduled room id.
	 * @param {string} data.name - The room name.
	 * @param {string} data.description - The room description.
	 * @returns {Promise<Room>} The created room.
	 */
	public async createRoomFromScheduledRoom(
		data: { id: string } & Omit<ScheduledRoomData, 'scheduledFor'>,
	): Promise<Room> {
		const info = ((await this.client.wrapper.mutation.createRoomFromScheduledRoom(
			data,
		)) as unknown) as RoomInfo;

		return new Room(this.client, info);
	}

	/**
	 * Joins a room.
	 * @param {string} id - The room id.
	 */
	public async joinRoom(id: string): Promise<void> {
		const { room } = (await this.client.wrapper.query.joinRoomAndGetInfo(id)) as JoinRoomAndGetInfoResponse;

		this.client.rooms.set(id, new Room(this.client, room));
		await this.client.emit('joinRoom', new Room(this.client, room));
	}
}
