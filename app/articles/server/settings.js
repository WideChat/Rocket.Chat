import { Meteor } from 'meteor/meteor';

import { settings } from '../../settings';

const defaults = {
	enable: false,
};

Meteor.startup(() => {
	settings.addGroup('Articles', function() {
		this.add('Articles_enabled', defaults.enable, {
			type: 'boolean',
			i18nLabel: 'Enable',
			public: true,
		});

		this.add('Article_Site_title', 'Rocket.Chat', {
			type: 'string',
			enableQuery: {
				_id: 'Articles_enabled',
				value: true,
			},
			public: true,
		});

		this.add('Article_Site_Url', 'http://localhost:2368', {
			type: 'string',
			enableQuery: {
				_id: 'Articles_enabled',
				value: true,
			},
			public: true,
		});

		this.add('Announcement_Token', 'announcement_token', {
			type: 'string',
			readonly: true,
			enableQuery: {
				_id: 'Articles_enabled',
				value: true,
			},
			public: true,
		});

		this.add('Collaboration_Token', 'collaboration_token', {
			type: 'string',
			readonly: true,
			enableQuery: {
				_id: 'Articles_enabled',
				value: true,
			},
			public: true,
		});

		this.add('Articles_admin_panel', 'Articles_admin_panel', {
			type: 'link',
			enableQuery: {
				_id: 'Articles_enabled',
				value: true,
			},
			linkText: 'Article_Admin_Panel',
		});
	});
});
