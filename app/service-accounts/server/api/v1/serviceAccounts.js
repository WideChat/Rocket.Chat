import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { API } from '../../../../api';
import { Users } from '../../../../models';

API.v1.addRoute('serviceAccounts.create', { authRequired: true }, {
	post() {
		check(this.bodyParams, {
			name: String,
			password: String,
			username: String,
			description: String,
		});
		Meteor.runAsUser(this.userId, () => {
			Meteor.call('addServiceAccount', this.bodyParams);
		});
		return API.v1.success({ user: Users.findOneByUsername(this.bodyParams.username, { fields: API.v1.defaultFieldsToExclude }) });
	},
});

API.v1.addRoute('serviceAccounts.getLinkedAccounts', { authRequired: true }, {
	get() {
		let serviceAccounts;
		Meteor.runAsUser(this.userId, () => {
			serviceAccounts = Meteor.call('getLinkedServiceAccounts');
		});

		if (!serviceAccounts) {
			return API.v1.failure();
		}
		return API.v1.success({ serviceAccounts });
	},
});

API.v1.addRoute('serviceAccounts.getToken', { authRequired: true }, {
	get() {
		const { username } = this.queryParams;
		let token;
		Meteor.runAsUser(this.userId, () => {
			token = Meteor.call('getLoginToken', username);
		});

		if (!token) {
			return API.v1.failure();
		}
		return API.v1.success({ token });
	},
});
