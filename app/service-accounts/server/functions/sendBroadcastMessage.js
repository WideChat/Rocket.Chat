import { Meteor } from 'meteor/meteor';

import { Rooms, Messages } from '../../../models/server';
import { settings } from '../../../settings';
import { sendMessage } from '../../../lib/server';
import { RateLimiter } from '../../../lib/server/lib';

const _sendBroadcastMessage = function(message, room) {
	if (!Meteor.userId()) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'sendBroadcastMessage' });
	}

	if (!Meteor.user().u) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'sendBroadcastMessage' });
	}

	const timeLimit = settings.get('Service_accounts_broadcast_time_limit');
	const maxBroadcast = settings.get('Service_accounts_broadcast_limit');

	const time = new Date();
	time.setHours(time.getHours() - timeLimit);

	const count = Messages.findVisibleByRoomIdAfterTimestamp(room._id, time).count();

	if (count === maxBroadcast) {
		throw new Meteor.Error('error-max-broadcast-limit', 'Broadcast limit reached', { method: 'sendBroadcastMessage' });
	}

	const rooms = Rooms.findDirectRoomContainingUsername(Meteor.user().username);
	for (const targetRoom of rooms) {
		sendMessage(Meteor.user(), { msg: message.msg }, targetRoom);
	}
};

export const sendBroadcastMessage = RateLimiter.limitFunction(_sendBroadcastMessage, 1, 1000, {
	0() { return !Meteor.userId(); },
});
