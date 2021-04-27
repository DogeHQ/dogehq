import { ScheduledRoom as ScheduledRoomInfo } from '@dogehouse/kebab';
import { ScheduledRoomData } from './ClientUser';
import { UUID, User } from './User';
import { Client } from './Client';

/**
 * The scheduled room class.
 * This does not extends the [Room]{@link Room} class because a scheduled room lacks data that a room does.
 * @param {Client} client - The client.
 * @param {ScheduledRoomInfo} scheduledRoom - The scheduled room.
 */
export class ScheduledRoom {
	/**
	 * The client that instantiated the scheduled room.
	 * @type {Client}
	 */
	public client: Client;

	/**
	 * The room id.
	 * @type {?UUID}
	 */
	public roomId: UUID | null;

	/**
	 * The description of the scheduled room.
	 * @type {string}
	 */
	public description: string;

	/**
	 * When the room will start.
	 * @type {string}
	 */
	public scheduledFor: string;

	/**
	 * The number of attendees.
	 * @type {number}
	 */
	public attendingCount: number;

	/**
	 * The name of the scheduled room.
	 * @type {string}
	 */
	public name: string;

	/**
	 * The id of the scheduled room.
	 * @type {UUID}
	 */
	public id: UUID;

	/**
	 * The id of the creator of the scheduled room.
	 * @type {UUID}
	 */
	public creatorId: UUID;

	/**
	 * The creator of the scheduled room.
	 * @type {User}
	 */
	public creator: User;

	public constructor(client: Client, scheduledRoom: ScheduledRoomInfo) {
		this.client = client;

		this.roomId = scheduledRoom.roomId;
		this.description = scheduledRoom.description;
		this.scheduledFor = scheduledRoom.scheduledFor;
		this.attendingCount = scheduledRoom.numAttending;
		this.name = scheduledRoom.name;
		this.id = scheduledRoom.id;
		this.creatorId = scheduledRoom.creatorId;
		this.creator = new User(client, scheduledRoom.creator);
	}

	/**
	 * Edits the scheduled room.
	 * @param {ScheduledRoomData} data - The data.
	 */
	public async edit(data: ScheduledRoomData): Promise<void> {
		await this.client.wrapper.mutation.editScheduledRoom(this.id, data);
	}

	/**
	 * Deletes the scheduled room.
	 */
	public delete(): void {
		this.client.wrapper.mutation.deleteScheduledRoom(this.id);
	}
}
