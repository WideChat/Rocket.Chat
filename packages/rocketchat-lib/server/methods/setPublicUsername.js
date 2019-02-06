import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
	setPublicUsername(isPublicUsername) {

		check(isPublicUsername, Boolean);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'setRealName' });
		}

		return RocketChat.models.Users.setPublicUsername(Meteor.userId(), isPublicUsername);

	},
});

RocketChat.RateLimiter.limitMethod('setPublicUsername', 1, 1000, {
	userId: () => true,
});
