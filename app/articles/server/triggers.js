import { callbacks } from '../../callbacks';
import { triggerHandler } from './lib/triggerHandler';
import { settings } from '../../settings';

const callbackHandler = function _callbackHandler(eventType) {
	return function _wrapperFunction(...args) {
		return triggerHandler.executeTrigger(eventType, ...args);
	};
};

const priority = settings.get('Articles_enabled') ? callbacks.priority.HIGH : callbacks.priority.LOW;

callbacks.add('afterUserEmailChange', callbackHandler('userEmail'), priority);
callbacks.add('afterUserRealNameChange', callbackHandler('userRealname'), priority);
callbacks.add('afterUserAvatarChange', callbackHandler('userAvatar'), priority);
callbacks.add('afterUsernameChange', callbackHandler('userName'), priority);
callbacks.add('afterRoomTypeChange', callbackHandler('roomType'), priority);
callbacks.add('afterRoomNameChange', callbackHandler('roomName'), priority);

settings.get('Article_Site_title', (key, value) => {
	triggerHandler.executeTrigger('siteTitle', { title: value });
});
