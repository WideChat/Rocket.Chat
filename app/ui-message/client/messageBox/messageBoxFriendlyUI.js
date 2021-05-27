import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

import { settings } from '../../../settings';
import {
	getUserPreference,
} from '../../../utils/client';
import {
	fileUpload,
	KonchatNotification,
} from '../../../ui';
import {
	keyCodes,
	isRTL,
} from '../../../ui-utils';
import './messageBoxAudioMessage';
import './messageBoxFriendlyUI.html';

Template.messageBoxFriendlyUI.onCreated(function() {
	this.isSendIconVisible = new ReactiveVar(false);
	this.replyMessageData = new ReactiveVar();

	this.set = (value) => {
		const { input } = this;
		if (!input) {
			return;
		}

		input.value = value;
		$(input).trigger('change').trigger('input');
	};

	this.insertNewLine = () => {
		const { input } = this;
		if (!input) {
			return;
		}

		if (document.selection) {
			input.focus();
			const sel = document.selection.createRange();
			sel.text = '\n';
		} else if (input.selectionStart || input.selectionStart === 0) {
			const newPosition = input.selectionStart + 1;
			const before = input.value.substring(0, input.selectionStart);
			const after = input.value.substring(input.selectionEnd, input.value.length);
			input.value = `${ before }\n${ after }`;
			input.selectionStart = newPosition;
			input.selectionEnd = newPosition;
		} else {
			input.value += '\n';
		}
		$(input).trigger('change').trigger('input');

		input.blur();
		input.focus();
	};

	// let isSending = false;

	this.send = (event) => {
		const { input } = this;

		if (!input) {
			return;
		}

		const { data: { rid, tmid, onSend, tshow } } = this;
		const { value } = input;
		this.set('');

		if (!onSend) {
			return;
		}

		onSend.call(this.data, event, { rid, tmid, value, tshow }, () => {
			input.focus();
		});
	};
});

Template.messageBoxFriendlyUI.onRendered(function() {
	let inputSetup = false;

	this.autorun(() => {
		if (!inputSetup) {
			const $input = $(this.find('.js-input-message-friendly'));
			this.source = $input[0];
			if (this.source) {
				inputSetup = true;
			}
			$input.on('dataChange', () => {
				const messages = $input.data('reply') || [];
				this.replyMessageData.set(messages);
			});
		}
	});

	this.autorun(() => {
		const { onInputChanged } = Template.currentData();
		Tracker.afterFlush(() => {
			const input = this.find('.js-input-message-friendly');
			if (this.input === input) {
				return;
			}

			this.input = input;
			onInputChanged && onInputChanged(input);
		});
	});
});

Template.messageBoxFriendlyUI.helpers({
	isEmojiEnabled() {
		return getUserPreference(Meteor.userId(), 'useEmojis');
	},
	isSendIconVisible() {
		return Template.instance().isSendIconVisible.get();
	},
});

let sendOnEnter;
let sendOnEnterActive;

Tracker.autorun(() => {
	sendOnEnter = getUserPreference(Meteor.userId(), 'sendOnEnter');
	sendOnEnterActive = sendOnEnter == null || sendOnEnter === 'normal'
		|| (sendOnEnter === 'desktop' && Meteor.Device.isDesktop());
});

const handleSubmit = (event, instance) => {
	const { which: keyCode } = event;

	const isSubmitKey = keyCode === keyCodes.CARRIAGE_RETURN || keyCode === keyCodes.NEW_LINE;

	if (!isSubmitKey) {
		return false;
	}

	const withModifier = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
	const isSending = (sendOnEnterActive && !withModifier) || (!sendOnEnterActive && withModifier);

	if (isSending) {
		instance.send(event);
		return true;
	}

	instance.insertNewLine();
	return true;
};

Template.messageBoxFriendlyUI.events({
	'focus .js-input-message-friendly'() {
		KonchatNotification.removeRoomNotification(this.rid);
	},
	'keydown .js-input-message-friendly'(event, instance) {
		const isEventHandled = handleSubmit(event, instance);

		if (isEventHandled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		const { rid, tmid, onKeyDown } = this;
		onKeyDown && onKeyDown.call(this, event, { rid, tmid });
	},
	'keyup .js-input-message-friendly'(event) {
		const { rid, tmid, onKeyUp } = this;
		onKeyUp && onKeyUp.call(this, event, { rid, tmid });
	},
	'paste .js-input-message-friendly'(event, instance) {
		const { rid, tmid } = this;
		const { input, autogrow } = instance;

		setTimeout(() => autogrow && autogrow.update(), 50);

		if (!event.originalEvent.clipboardData) {
			return;
		}

		const items = [...event.originalEvent.clipboardData.items];

		if (items.some(({ kind, type }) => kind === 'string' && type === 'text/plain')) {
			return;
		}

		const files = items
			.filter((item) => item.kind === 'file' && item.type.indexOf('image/') !== -1)
			.map((item) => ({
				file: item.getAsFile(),
				name: `Clipboard - ${ moment().format(settings.get('Message_TimeAndDateFormat')) }`,
			}))
			.filter(({ file }) => file !== null);

		if (files.length) {
			event.preventDefault();
			fileUpload(files, input, { rid, tmid });
		}
	},
	'input .js-input-message-friendly'(event, instance) {
		const { input } = instance;
		if (!input) {
			return;
		}

		instance.isSendIconVisible.set(!!input.value);

		if (input.value.length > 0) {
			input.dir = isRTL(input.value) ? 'rtl' : 'ltr';
		}

		const { rid, tmid, onValueChanged } = this;
		onValueChanged && onValueChanged.call(this, event, { rid, tmid });
	},
	'propertychange .js-input-message-friendly'(event, instance) {
		if (event.originalEvent.propertyName !== 'value') {
			return;
		}

		const { input } = instance;
		if (!input) {
			return;
		}

		instance.sendIconDisabled.set(!!input.value);

		if (input.value.length > 0) {
			input.dir = isRTL(input.value) ? 'rtl' : 'ltr';
		}

		const { rid, tmid, onValueChanged } = this;
		onValueChanged && onValueChanged.call(this, event, { rid, tmid });
	},
	async 'click .js-send'(event, instance) {
		instance.send(event);
	},
});
