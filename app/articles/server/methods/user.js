import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { API } from '../utils/url';
import { settings } from '../../../settings';

const api = new API();

function addUser(user, accessToken) {
	const data = {
		user: [{
			rc_username: user.username,
			role: 'Author', // User can add itself as Author, even if he/she is admin in RC
			rc_uid: user._id,
			rc_token: accessToken,
		}],
	};
	return HTTP.call('POST', api.createAccount(), { data, headers: { 'Content-Type': 'application/json' } });
}

function userExist(user, accessToken) {
	const data = {
		user: [{
			rc_uid: user._id,
			rc_token: accessToken,
		}],
	};
	const response = HTTP.call('GET', api.userExist(), { data, headers: { 'Content-Type': 'application/json' } });
	return response.data && response.data.users[0] && response.data.users[0].exist;
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

Meteor.methods({
	redirectUserToArticles(accessToken) {
		const enabled = settings.get('Articles_enabled');

		if (!enabled) {
			throw new Meteor.Error('Articles are disabled');
		}
		const user = Meteor.users.findOne(Meteor.userId());

		try {
			let response = HTTP.call('GET', api.setup());
			if (response.data && response.data.setup && response.data.setup[0]) {
				if (response.data.setup[0].status) { // Ghost site is already setup
					const exist = userExist(user, accessToken);
					if (exist) {
						return redirectGhost();
					}
					const inviteOnly = inviteSetting();

					if (!inviteOnly) {
						response = addUser(user, accessToken);
						if (response.statusCode === 200) {
							return redirectGhost();
						}
						throw new Meteor.Error('Unable to setup your account.');
					} else {
						throw new Meteor.Error('You are not a member of Ghost. Ask admin to add');
					}
				} else { // Cannot setup Ghost from sidenav
					throw new Meteor.Error('Ghost is not set up. Setup can be done from Admin Panel.');
				}
			} else {
				throw new Meteor.Error('Unable to redirect.');
			}
		} catch (e) {
			throw new Meteor.Error(e.error || 'Unable to connect to Ghost.');
		}
	},
});
