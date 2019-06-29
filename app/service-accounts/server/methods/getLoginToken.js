import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Users } from '../../../models';

Meteor.methods({
	getLoginToken(username) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getLoginToken' });
		}

<<<<<<< HEAD
		const user = Users.findOneByUsername(username, {});
		if (user.u) {
			if (user.u._id !== Meteor.userId()) {
				throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getLoginToken' });
			}
		}

		if (Meteor.user().u) {
			if (user._id !== Meteor.user().u._id) {
				throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getLoginToken' });
			}
		}

		const stampedToken = Accounts._generateStampedLoginToken();
		Accounts._insertLoginToken(user._id, stampedToken);
=======
		let stampedToken = {};
		const user = Users.findOneByUsername(username, {});
		const isOwnerAccount = user.u && user.u._id === Meteor.userId(); // check if the requested account is owned by the user
		const isServiceAccount = Meteor.user().u && user._id === Meteor.user().u._id; // check if the service account is requesting owner account login token

		if (isOwnerAccount || isServiceAccount) {
			stampedToken = Accounts._generateStampedLoginToken();
			Accounts._insertLoginToken(user._id, stampedToken);
		} else {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getLoginToken' });
		}
>>>>>>> 117d725d6cc18dfcfdd2d314fdfe68dfa1e3cd6f
		return stampedToken;
	},
});
