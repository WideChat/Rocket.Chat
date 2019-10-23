import 'url-polyfill';

import './importServiceWorker';

import './importsCss';
import './importPackages';
import '../imports/startup/client';

import '../lib/RegExp';

import './lib/toastr';
import './templateHelpers';
import './methods/deleteMessage';
import './methods/hideRoom';
import './methods/openRoom';
import './methods/setUserActiveStatus';
import './methods/toggleFavorite';
import './methods/updateMessage';
import './notifications/notification';
import './notifications/updateAvatar';
import './notifications/updateUserState';
import './notifications/UsersNameChanged';
import './routes';
import './startup/emailVerification';
import './startup/i18n';
import './startup/loginViaQuery';
import './startup/roomObserve';
import './startup/startup';
import './startup/unread';
import './startup/userSetUtcOffset';
import './startup/usersObserve';

if ('serviceWorker' in navigator) {
	if (navigator.serviceWorker.controller) {
		console.log('Active service worker found, no need to register');
	} else {
		// Register the service worker
		navigator.serviceWorker
			.register('sw.js', {
				scope: './',
			})
			.then(function(reg) {
				console.log(`Service worker has been registered for scope: ${ reg.scope }`);
			});
	}
}
