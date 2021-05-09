import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import {
	getUserPreference,
} from '../../../utils/client';

import './messageBoxAudioMessage';
import './messageBoxFriendlyUI.html';

Template.messageBoxFriendlyUI.onCreated(function() {
	this.isSendIconVisible = new ReactiveVar(false);
});

Template.messageBoxFriendlyUI.helpers({
	isEmojiEnabled() {
		return getUserPreference(Meteor.userId(), 'useEmojis');
	},
	isSendIconVisible() {
		return Template.instance().isSendIconVisible.get();
	},
});

Template.messageBoxFriendlyUI.events({
	'input .js-input-message'(event, instance) {
		instance.isSendIconVisible.set(!!event.target.value);
	},
});
