import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';

import { EmojiPicker } from '../../../emoji';
import { settings } from '../../../settings';
import {
	getUserPreference,
	t,
} from '../../../utils/client';
import {
	fileUpload,
	KonchatNotification,
} from '../../../ui';
import {
	keyCodes,
	isRTL,
	modal,
} from '../../../ui-utils';
import './messageBoxAudioMessage';
import './messageBoxFriendlyUI.html';

Template.messageBoxFriendlyUI.onCreated(function() {
	this.isSendIconVisible = new ReactiveVar(false);
	this.replyMessageData = new ReactiveVar();
	this.isAttachmentSectionVisible = new ReactiveVar(false);
	this.canGetGeolocation = new ReactiveVar(false);

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

	Tracker.autorun(() => {
		const isMapViewEnabled = settings.get('MapView_Enabled') === true;
		const isGeolocationCurrentPositionSupported = navigator.geolocation && navigator.geolocation.getCurrentPosition;
		const googleMapsApiKey = settings.get('MapView_GMapsAPIKey');
		this.canGetGeolocation.set(isMapViewEnabled && isGeolocationCurrentPositionSupported && googleMapsApiKey && googleMapsApiKey.length);
	});
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
	isAttachmentSectionVisible() {
		return Template.instance().isAttachmentSectionVisible.get();
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

const getGeolocationPermission = () => new Promise((resolve) => {
	if (!navigator.permissions) { resolve(true); }
	navigator.permissions.query({ name: 'geolocation' }).then(({ state }) => { resolve(state); });
});

const getGeolocationPosition = () => new Promise((resolvePos) => {
	navigator.geolocation.getCurrentPosition(resolvePos, () => { resolvePos(false); }, {
		enableHighAccuracy: true,
		maximumAge: 0,
		timeout: 10000,
	});
});

const getCoordinates = async () => {
	const status = await getGeolocationPermission();
	if (status === 'prompt') {
		let resolveModal;
		const modalAnswer = new Promise((resolve) => { resolveModal = resolve; });
		modal.open({
			title: t('You_will_be_asked_for_permissions'),
			confirmButtonText: t('Continue'),
			showCancelButton: true,
			closeOnConfirm: true,
			closeOnCancel: true,
		}, async (isConfirm) => {
			if (!isConfirm) {
				resolveModal(false);
			}
			const position = await getGeolocationPosition();
			if (!position) {
				const newStatus = getGeolocationPermission();
				resolveModal(newStatus);
			}
			resolveModal(position);
		});
		const position = await modalAnswer;
		return position;
	}

	if (status === 'denied') {
		return status;
	}

	const position = await getGeolocationPosition();
	return position;
};

const handleUpload = async (event, instance, rid, tmid, $input) => {
	const { mime } = await import('../../../utils/lib/mimeTypes');
	const filesToUpload = [...event.target.files].map((file) => {
		Object.defineProperty(file, 'type', {
			value: mime.lookup(file.name),
		});
		return {
			file,
			name: file.name,
		};
	});
	fileUpload(filesToUpload, $('.js-input-message-friendly', instance.firstNode).get(0), { rid, tmid });
	$input.remove();
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
	'click .js-emoji-picker-friendly'(event, instance) {
		event.stopPropagation();
		event.preventDefault();

		if (!getUserPreference(Meteor.userId(), 'useEmojis')) {
			return;
		}

		if (EmojiPicker.isOpened()) {
			EmojiPicker.close();
			return;
		}

		EmojiPicker.open(instance.source, (emoji) => {
			const emojiValue = `:${ emoji }: `;

			const { input } = instance;

			const caretPos = input.selectionStart;
			const textAreaTxt = input.value;

			input.focus();
			if (!document.execCommand || !document.execCommand('insertText', false, emojiValue)) {
				instance.set(textAreaTxt.substring(0, caretPos) + emojiValue + textAreaTxt.substring(caretPos));
				input.focus();
			}

			input.selectionStart = caretPos + emojiValue.length;
			input.selectionEnd = caretPos + emojiValue.length;
		}, true);
	},
	'click .js-attachment-icon'(event, instance) {
		instance.isAttachmentSectionVisible.set(!instance.isAttachmentSectionVisible.get());
	},
	'click .js-camera'(event, instance) {
		event.preventDefault();
		const { rid, tmid } = Template.currentData();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			capture: 'camera',
			accept: 'image/*',
		});

		$(document.body).append($input);

		$input.one('change', (event) => {
			handleUpload(event, instance, rid, tmid, $input);
		});

		$input.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
	'click .js-photo'(event, instance) {
		event.preventDefault();
		const { rid, tmid } = Template.currentData();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			multiple: 'multiple',
			accept: 'image/png,image/jpeg',
		});

		$(document.body).append($input);

		$input.one('change', (event) => {
			handleUpload(event, instance, rid, tmid, $input);
		});

		$input.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
	'click .js-gif'(event, instance) {
		event.preventDefault();
		const { rid, tmid } = Template.currentData();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			multiple: 'multiple',
			accept: 'image/gif',
		});

		$(document.body).append($input);

		$input.one('change', (event) => {
			handleUpload(event, instance, rid, tmid, $input);
		});

		$input.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
	'click .js-file'(event, instance) {
		event.preventDefault();
		const { rid, tmid } = Template.currentData();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			multiple: 'multiple',
		});

		$(document.body).append($input);

		$input.one('change', (event) => {
			handleUpload(event, instance, rid, tmid, $input);
		});

		$input.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
	async 'click .js-location'(event) {
		event.preventDefault();
		const { rid, tmid } = Template.currentData();
		const position = await getCoordinates();

		if (!position) {
			return;
		}

		if (position === 'denied') {
			modal.open({
				title: t('Cannot_share_your_location'),
				text: t('The_necessary_browser_permissions_for_location_sharing_are_not_granted'),
				confirmButtonText: t('Ok'),
				closeOnConfirm: true,
			});
			return;
		}

		const { coords: { latitude, longitude } } = position;
		const text = `<div class="upload-preview"><div class="upload-preview-file" style="background-size: cover; box-shadow: 0 0 0px 1px #dfdfdf; border-radius: 2px; height: 250px; width:100%; max-width: 500px; background-image:url(https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=500x250&markers=color:gray%7Clabel:%7C${ latitude },${ longitude }&key=${ settings.get('MapView_GMapsAPIKey') })" ></div></div>`;

		modal.open({
			title: t('Share_Location_Title'),
			text,
			showCancelButton: true,
			closeOnConfirm: true,
			closeOnCancel: true,
			html: true,
		}, function(isConfirm) {
			if (isConfirm !== true) {
				return;
			}
			Meteor.call('sendMessage', {
				_id: Random.id(),
				rid,
				tmid,
				msg: '',
				location: {
					type: 'Point',
					coordinates: [longitude, latitude],
				},
			});
		});
	},
});
