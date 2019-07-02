import { Meteor } from 'meteor/meteor';

import { Users, Subscriptions } from '../../../models';
import { getDefaultUserFields } from '../../../utils/server/functions/getDefaultUserFields';

Meteor.methods({
	getLinkedServiceAccounts() {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'addServiceAccount' });
		}

		const query = {
			'u._id': Meteor.userId(),
			active: true,
		};
		const result = Users.find(query, { fields: getDefaultUserFields() }).fetch();
		result.forEach((serviceAccount) => {
			serviceAccount.unread = Subscriptions.findUnreadByUserId(serviceAccount._id).count();
		});
		return result;
	},
});
