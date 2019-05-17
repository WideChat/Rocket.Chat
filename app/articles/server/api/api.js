import { Restivus } from 'meteor/nimble:restivus';
import _ from 'underscore';

import { processWebhookMessage } from '../../../lib';
import { API } from '../../../api';
import { settings } from '../../../settings';
import * as Models from '../../../models';

const Api = new Restivus({
	enableCors: true,
	apiPath: 'ghooks/',
	auth: {
		user() {
			const payloadKeys = Object.keys(this.bodyParams);
			const payloadIsWrapped = (this.bodyParams && this.bodyParams.payload) && payloadKeys.length === 1;
			if (payloadIsWrapped && this.request.headers['content-type'] === 'application/x-www-form-urlencoded') {
				try {
					this.bodyParams = JSON.parse(this.bodyParams.payload);
				} catch ({ message }) {
					return {
						error: {
							statusCode: 400,
							body: {
								success: false,
								error: message,
							},
						},
					};
				}
			}

			this.announceToken = settings.get('Announcement_Token');
			const { blogId } = this.request.params;
			const token = decodeURIComponent(this.request.params.token);

			if (this.announceToken !== `${ blogId }/${ token }`) {
				return {
					error: {
						statusCode: 404,
						body: {
							success: false,
							error: 'Invalid token provided.',
						},
					},
				};
			}

			const user = this.bodyParams.userId ? Models.Users.findOne({ _id: this.bodyParams.userId }) : Models.Users.findOne({ username: this.bodyParams.username });

			return { user };
		},
	},
});

function executeAnnouncementRest() {
	const defaultValues = {
		channel: this.bodyParams.channel,
		alias: this.bodyParams.alias,
		avatar: this.bodyParams.avatar,
		emoji: this.bodyParams.emoji,
	};

	// TODO: Turn this into an option on the integrations - no body means a success
	// TODO: Temporary fix for https://github.com/RocketChat/Rocket.Chat/issues/7770 until the above is implemented
	if (!this.bodyParams || (_.isEmpty(this.bodyParams) && !this.integration.scriptEnabled)) {
		// return RocketChat.API.v1.failure('body-empty');
		return API.v1.success();
	}

	try {
		const message = processWebhookMessage(this.bodyParams, this.user, defaultValues);
		if (_.isEmpty(message)) {
			return API.v1.failure('unknown-error');
		}

		return API.v1.success();
	} catch ({ error, message }) {
		return API.v1.failure(error || message);
	}
}

function executefetchUserRest() {
	try {
		const { _id, name, username, emails } = this.user;
		const user = { _id, name, username, emails };

		return API.v1.success({ user });
	} catch ({ error, message }) {
		return API.v1.failure(error || message);
	}
}

Api.addRoute(':blogId/:token', { authRequired: true }, {
	post: executeAnnouncementRest,
	get: executeAnnouncementRest,
});

// If a user is editor/admin in Ghost but is not an admin in RC,
// then the e-mail will not be provided to that user
// This method will allow user to fetch user with email.
Api.addRoute(':blogId/:token/getUser', { authRequired: true }, {
	post: executefetchUserRest,
	get: executefetchUserRest,
});
