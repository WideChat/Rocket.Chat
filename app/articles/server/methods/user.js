import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { API } from '../utils/url';
import { settings } from '../../../settings';

const api = new API();

function addUser(user, accessToken) {
	const data = {
		user: [{
			rc_username: user.username,
			role: 'Author', // User can add itself only as Author, even if he/she is admin in RC
			rc_uid: user._id,
			rc_token: accessToken,
		}],
	};
	return HTTP.call('POST', api.createAccount(), { data, headers: { 'Content-Type': 'application/json' } });
}

function userExist(id) {
	const data = {
		user: [{
			rc_uid: id,
		}],
	};
	const response = HTTP.call('GET', api.userExist(), { data, headers: { 'Content-Type': 'application/json' } });
	return response.data;
}

function inviteSetting() {
	const response = HTTP.call('GET', api.invite());
	const { settings } = response.data;

	if (settings && settings[0] && settings[0].key === 'invite_only') {
		return settings[0].value;
	}
	// default value in Ghost
	return false;
}

function redirectGhost() {
	return {
		link: api.siteUrl(),
		message: 'Ghost is Set up. Redirecting.',
	};
}

function redirectUser(slug) {
	return {
		link: api.authorUrl(slug),
		message: 'Redirecting.',
	};
}

Meteor.methods({
	redirectUserToArticles(accessToken) {
		const enabled = settings.get('Articles_enabled');

		if (!enabled) {
			throw new Meteor.Error('Articles are disabled');
		}
		const user = Meteor.users.findOne(Meteor.userId());
		let errMsg = 'Ghost is not set up. Setup can be done from Admin Panel';

		try {
			const response = HTTP.call('GET', api.setup());

			if (response.data.setup[0].status) { // Ghost site is already setup
				const u = userExist(user._id).users[0];

				if (u.exist && u.status === 'active') {
					return redirectGhost();
				}

				if (u.exist) { // user exist but suspended
					throw new Meteor.Error('You are suspended from Ghost');
				}

				const inviteOnly = inviteSetting();

				// create user account in ghost
				if (!inviteOnly && addUser(user, accessToken).statusCode === 200) {
					return redirectGhost();
				}

				errMsg = inviteOnly ? 'You are not a member of Ghost. Ask admin to add' : 'Unable to setup your account';
			}

			// Cannot setup Ghost from sidenav
			throw new Meteor.Error(errMsg);
		} catch (e) {
			throw new Meteor.Error(e.error || 'Unable to connect to Ghost.');
		}
	},

	redirectToUsersArticles(_id) {
		const enabled = settings.get('Articles_enabled');

		if (!enabled) {
			throw new Meteor.Error('Articles are disabled');
		}
		const errMsg = 'User is not a member of Ghost';

		try {
			const u = userExist(_id).users[0];

			if (u.exist) {
				return redirectUser(u.slug);
			}

			throw new Meteor.Error(errMsg);
		} catch (e) {
			throw new Meteor.Error(e.error || errMsg);
		}
	},
});
