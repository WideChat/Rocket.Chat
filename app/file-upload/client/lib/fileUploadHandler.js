import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Tracker } from 'meteor/tracker';
import { UploadFS } from 'meteor/jalik:ufs';

import { FileUploadBase } from '../../lib/FileUploadBase';
import { Uploads, Avatars } from '../../../models';

new UploadFS.Store({
	collection: Uploads.model,
	name: 'Uploads',
});

new UploadFS.Store({
	collection: Avatars.model,
	name: 'Avatars',
});

export const fileUploadHandler = (directive, meta, file) => {
	const store = UploadFS.getStore(directive);

	if (store) {
		return new FileUploadBase(store, meta, file);
	}
	console.error('Invalid file store', directive);
};

Tracker.autorun(function() {
	if (Meteor.userId()) {
		let domain = Meteor.absoluteUrl().replace(/.*\/\//, '');
		domain = domain.replace(/:.*\/$/, '');
		domain = domain.replace(/\/$/, '');
		domain = `.${ domain }`;
		document.cookie = `rc_uid=${ escape(Meteor.userId()) }; domain=${ domain }; path=/`;
		document.cookie = `rc_token=${ escape(Accounts._storedLoginToken()) }; domain=${ domain }; path=/`;
	}
});
