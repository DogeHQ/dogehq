// make promises safe
import 'make-promises-safe';

// Base Structures
export * from './Structures/Client';
export * from './Structures/Collection';
export * from './Structures/Room';
export * from './Structures/User';
export * from './Structures/ClientUser';
export * from './Structures/ScheduledRoom';
export * from './Structures/Message';

// Voice
export * from './Structures/Voice/Dispatcher';
export * from './Structures/Voice/Player';
export * from './Structures/Voice/StreamSplitter';

// Utils
export const version = '1.7.0';
export * from './Util/Constants';
export * from './Util/Util';
export * from './Util/TypedEmitter';
export * from './Util/MessageBuilder';
export * from './Util/VolumeInterface';
export * from './Util/Silence';
