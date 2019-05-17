import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { settings } from '../../../settings';
import { API } from '../utils/url';

const api = new API();

export const triggerHandler = new class ArticlesSettingsHandler {
	constructor() {
		this.trigger = {};
	}

	eventNameArgumentsToObject(...args) {
		const argObject = {
			event: args[0],
		};
		switch (argObject.event) {
			case 'userEmail':
			case 'userRealname':
			case 'userAvatar':
			case 'userName':
				if (args.length >= 2) {
					argObject.user = args[1];
				}
				break;
			case 'roomType':
			case 'roomName':
				if (args.length >= 2) {
					argObject.room = args[1];
				}
				break;
			case 'siteTitle':
				argObject.article = args[1];
				break;
			default:
				argObject.event = undefined;
				break;
		}
		return argObject;
	}

	mapEventArgsToData(data, { event, room, user, article }) {
		data.event = event;
		switch (event) {
			case 'userEmail':
			case 'userRealname':
			case 'userAvatar':
			case 'userName':
				data.user_id = user._id;

				if (user.avatar) {
					data.avatar = user.avatar;
				}

				if (user.name) {
					data.name = user.name;
				}

				if (user.email) {
					data.email = user.email;
				}

				if (user.username) {
					data.username = user.username;
				}
				break;
			case 'roomType':
			case 'roomName':
				data.room_id = room.rid;

				if (room.name) {
					data.name = room.name;
				}

				if (room.type) {
					data.type = room.type;
				}
				break;
			case 'siteTitle':
				if (article && article.title) {
					data.title = article.title;
				}
				break;
			default:
				break;
		}
	}

	executeTrigger(...args) {
		const argObject = this.eventNameArgumentsToObject(...args);
		const { event } = argObject;

		if (!event) {
			return;
		}

		if (settings.get('Articles_enabled')) {
			const token = settings.get('Settings_Token');
			this.trigger.api = api.rhooks(token);
			this.trigger.retryCount = 5;
		}

		this.executeTriggerUrl(argObject, 0);
	}

	executeTriggerUrl({ event, room, user, article }, tries = 0) {
		if (!this.trigger.api) {
			return;
		}
		const url = this.trigger.api;

		const data = {};

		this.mapEventArgsToData(data, { event, room, user, article });

		const opts = {
			params: {},
			method: 'POST',
			url,
			data,
			auth: undefined,
			npmRequestOptions: {
				rejectUnauthorized: !settings.get('Allow_Invalid_SelfSigned_Certs'),
				strictSSL: !settings.get('Allow_Invalid_SelfSigned_Certs'),
			},
			headers: {
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
			},
		};

		if (!opts.url || !opts.method) {
			return;
		}

		HTTP.call(opts.method, opts.url, opts, (error, result) => {
			// if the result contained nothing or wasn't a successful statusCode
			if (!result) {
				if (tries < this.trigger.retryCount) {
					// 2 seconds, 4 seconds, 8 seconds
					const waitTime = Math.pow(2, tries + 1) * 1000;

					Meteor.setTimeout(() => {
						this.executeTriggerUrl({ event, room, user }, tries + 1);
					}, waitTime);
				}
			}
		});
	}
}();
