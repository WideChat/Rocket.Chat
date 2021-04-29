import { Meteor } from 'meteor/meteor';

import { callbacks } from '../../../app/callbacks/client';

const removeUserIdOnLogout = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then((reg) => {
			reg.pushManager.getSubscription().then((sub) => {
				Meteor.call('removeUserFromPushSubscription', sub.endpoint);
			});
		});
	}
};

const addUserIdOnLogin = async () => {
	const user = await Meteor.user();
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then((reg) => {
			reg.pushManager.getSubscription().then((sub) => {
				Meteor.call('addUserToPushSubscription', sub.endpoint, user);
			});
		});
	}
};

callbacks.add(
	'afterLogoutCleanUp',
	removeUserIdOnLogout,
	callbacks.priority.MEDIUM,
	'remove-user-from-push-subscription',
);
callbacks.add(
	'onUserLogin',
	addUserIdOnLogin,
	callbacks.priority.MEDIUM,
	'add-user-to-push-subscription',
);
