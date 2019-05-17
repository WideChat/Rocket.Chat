import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { ghostCleanUp } from '../../app/articles/server/logoutCleanUp';
import { callbacks } from '../../app/callbacks';

Meteor.methods({
	logoutCleanUp(user, cookie = '') {
		check(user, Object);

		ghostCleanUp(cookie);

		Meteor.defer(function() {
			callbacks.run('afterLogoutCleanUp', user);
		});
	},
});
