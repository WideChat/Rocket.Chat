import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { settings } from '../app/settings';
import { handleError } from '../app/utils/client';

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}


function isMobile() {
	const toMatch = [
		/Android/i,
		/webOS/i,
		/iPhone/i,
		/iPad/i,
		/iPod/i,
		/BlackBerry/i,
		/Windows Phone/i,
	];

	return toMatch.some((toMatchItem) => navigator.userAgent.match(toMatchItem));
}

function subscribeUser() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then(async function(reg) {
			try {
				const vapidKey = await settings.get('Vapid_public_key');
				const subscription = await reg.pushManager
					.subscribe({
						userVisibleOnly: true,
						applicationServerKey: urlBase64ToUint8Array(vapidKey),
					});

				const platform = isMobile() ? 'mobile' : 'desktop';
				Meteor.call('savePushNotificationSubscription', JSON.stringify(subscription), platform);
			} catch (e) {
				handleError(e);
			}
		});
	}
}

Meteor.startup(() => {
	Tracker.autorun((computation) => {
		const settingsReady = settings.cachedCollection.ready.get();
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('sw.js', {
					scope: './',
				})
				.then(function(reg) {
					if (reg.installing) {
						const sw = reg.installing || reg.waiting;
						sw.onstatechange = function() {
							if (sw.state === 'installed') {
								// SW installed. Reload page.
								window.location.reload();
							}
						};
						console.log(`Service worker has been registered for scope: ${ reg.scope }`);
					} else {
						reg.pushManager.getSubscription().then(function(sub) {
							if (sub === null) {
								console.log('Not subscribed to push service!');
								if (settingsReady) {
									if (window.Notification && Notification.permission === 'granted') {
										subscribeUser();
									} else if (window.Notification && (Notification.permission !== 'granted')) {
										return Notification.requestPermission(function(permission) {
											if (permission === 'granted') {
												subscribeUser();
											}
										});
									}
									computation.stop();
								}
							} else {
								console.log('Subscribed to push service');
								computation.stop();
							}
						});
					}
				});
		}
	});
});
