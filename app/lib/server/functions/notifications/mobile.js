import { Meteor } from 'meteor/meteor';

import { settings } from '../../../../settings';
import { Subscriptions, PushNotificationSubscriptions } from '../../../../models';
import { roomTypes } from '../../../../utils';
import { PushNotification } from '../../../../push-notifications/server';

const CATEGORY_MESSAGE = 'MESSAGE';
const CATEGORY_MESSAGE_NOREPLY = 'MESSAGE_NOREPLY';
const webpush = require('web-push');

let alwaysNotifyMobileBoolean;
settings.get('Notifications_Always_Notify_Mobile', (key, value) => {
	alwaysNotifyMobileBoolean = value;
});

let SubscriptionRaw;
Meteor.startup(() => {
	SubscriptionRaw = Subscriptions.model.rawCollection();
});

async function getBadgeCount(userId) {
	const [result = {}] = await SubscriptionRaw.aggregate([
		{ $match: { 'u._id': userId } },
		{
			$group: {
				_id: 'total',
				total: { $sum: '$unread' },
			},
		},
	]).toArray();

	const { total } = result;
	return total;
}

function enableNotificationReplyButton(room, username) {
	// Some users may have permission to send messages even on readonly rooms, but we're ok with false negatives here in exchange of better perfomance
	if (room.ro === true) {
		return false;
	}

	if (!room.muted) {
		return true;
	}

	return !room.muted.includes(username);
}

export async function sendSinglePush({
	room,
	message,
	userId,
	receiverUsername,
	senderUsername,
	senderName,
	notificationMessage,
}) {
	let username = '';
	if (settings.get('Push_show_username_room')) {
		username = settings.get('UI_Use_Real_Name') === true ? senderName : senderUsername;
	}

	PushNotification.send({
		roomId: message.rid,
		payload: {
			host: Meteor.absoluteUrl(),
			rid: message.rid,
			sender: message.u,
			type: room.t,
			name: room.name,
			messageType: message.t,
			messageId: message._id,
		},
		roomName:
			settings.get('Push_show_username_room') && room.t !== 'd'
				? `#${ roomTypes.getRoomName(room.t, room) }`
				: '',
		username,
		message: settings.get('Push_show_message') ? notificationMessage : ' ',
		badge: await getBadgeCount(userId),
		usersTo: {
			userId,
		},
		category: enableNotificationReplyButton(room, receiverUsername)
			? CATEGORY_MESSAGE
			: CATEGORY_MESSAGE_NOREPLY,
	});

	const gcmKey = settings.get('Push_gcm_api_key');
	const vapidPublic = settings.get('Vapid_public_key');
	const vapidPrivate = settings.get('Vapid_private_key');

	webpush.setGCMAPIKey(gcmKey);
	webpush.setVapidDetails(
		'https://www.viasat.com',
		vapidPublic,
		vapidPrivate,
	);

	const pushSubscriptions = PushNotificationSubscriptions.findByUserId(userId);
	const options = {
		TTL: 3600,
	};

	pushSubscriptions.forEach((pushSubscription) => {
		webpush.sendNotification(pushSubscription, 'ok', options)
			.catch((error) => console.log(error));
	});
}

export function shouldNotifyMobile({
	disableAllMessageNotifications,
	mobilePushNotifications,
	hasMentionToAll,
	isHighlighted,
	hasMentionToUser,
	hasReplyToThread,
	statusConnection,
	roomType,
}) {
	if (disableAllMessageNotifications && mobilePushNotifications == null && !isHighlighted && !hasMentionToUser && !hasReplyToThread) {
		return false;
	}

	if (mobilePushNotifications === 'nothing') {
		return false;
	}

	if (!alwaysNotifyMobileBoolean && statusConnection === 'online') {
		return false;
	}

	if (!mobilePushNotifications) {
		if (settings.get('Accounts_Default_User_Preferences_mobileNotifications') === 'all') {
			return true;
		}
		if (settings.get('Accounts_Default_User_Preferences_mobileNotifications') === 'nothing') {
			return false;
		}
	}

	return roomType === 'd' || (!disableAllMessageNotifications && hasMentionToAll) || isHighlighted || mobilePushNotifications === 'all' || hasMentionToUser || hasReplyToThread;
}
