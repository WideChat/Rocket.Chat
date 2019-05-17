import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import _ from 'underscore';
import { Random } from 'meteor/random';

import { API } from '../utils/url';
import { settings } from '../../../settings';

const api = new API();

// Try to get a verified email, if available.
function getVerifiedEmail(emails) {
	const email = _.find(emails, (e) => e.verified);
	return email || emails[0].address;
}

function setupGhost(user, token) {
	const rcUrl = Meteor.absoluteUrl().replace(/\/$/, '');
	const blogTitle = settings.get('Article_Site_title');
	const blogToken = Random.id(17);
	const announceToken = `${ blogToken }/${ Random.id(24) }`;
	const settingsToken = `${ blogToken }/${ Random.id(24) }`;
	settings.updateById('Announcement_Token', announceToken);
	settings.updateById('Settings_Token', settingsToken);
	const data = {
		setup: [{
			rc_url: rcUrl,
			rc_id: user._id,
			rc_token: token,
			name: user.name,
			email: getVerifiedEmail(user.emails),
			announce_token: announceToken,
			settings_token: settingsToken,
			blogTitle,
		}],
	};
	return HTTP.call('POST', api.setup(), { data, headers: { 'Content-Type': 'application/json' } });
}

function redirectGhost() {
	return {
		link: api.siteUrl(),
		message: 'Ghost is Set up. Redirecting.',
	};
}

Meteor.methods({
	Articles_admin_panel(token) {
		const enabled = settings.get('Articles_enabled');

		if (!enabled) {
			throw new Meteor.Error('Articles are disabled');
		}
		const user = Meteor.users.findOne(Meteor.userId());

		try {
			let response = HTTP.call('GET', api.setup());

			if (response.data && response.data.setup && response.data.setup[0]) {
				if (response.data.setup[0].status) { // Ghost site is already setup
					return redirectGhost();
				} // Setup Ghost Site and set title
				response = setupGhost(user, token);
				if (response.statusCode === 201 && response.content) {
					return redirectGhost();
				} if (response.errors) {
					throw new Meteor.Error(response.errors.message || 'Unable to setup. Make sure Ghost is running');
				}
			} else {
				throw new Meteor.Error('Unable to redirect. Make sure Ghost is running.');
			}
		} catch (e) {
			console.log(e);
			throw new Meteor.Error(e.error || 'Unable to connect to Ghost. Make sure Ghost is running.');
		}
	},
});
