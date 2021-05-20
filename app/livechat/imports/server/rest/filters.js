import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { API } from '../../../../api/server';
import { findFilters, findFilterById } from '../../../server/api/lib/filters';

API.v1.addRoute('livechat/filter', { authRequired: true }, {
	post() {
		try {
			check(this.bodyParams, {
				name: String,
				description: String,
				enabled: Boolean,
				regex: String,
				slug: String,
			});

			API.v1.success(
				Meteor.runAsUser(this.userId,
					() => Meteor.call('livechat:saveFilter', this.bodyParams),
				),
			);
		} catch (e) {
			return API.v1.failure(e);
		}
	},
});

API.v1.addRoute('livechat/filters', { authRequired: true }, {
	get() {
		const { offset, count } = this.getPaginationItems();
		const { sort } = this.parseJsonQuery();

		const filters = Promise.await(findFilters({
			userId: this.userId,
			pagination: {
				offset,
				count,
				sort,
			},
		}));

		return API.v1.success(filters);
	},
});

API.v1.addRoute('livechat/filters/:_id', { authRequired: true }, {
	get() {
		check(this.urlParams, {
			_id: String,
		});

		const filter = Promise.await(findFilterById({
			userId: this.userId,
			filterId: this.urlParams._id,
		}));

		return API.v1.success({
			filter,
		});
	},
});
