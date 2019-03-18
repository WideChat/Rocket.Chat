import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { check } from 'meteor/check';
import { hasPermission } from '../../authorization';
import { placeholders } from '../../utils';
import _ from 'underscore';
const settings = require('../../settings');
const SMS = require('../../sms');

const supportedLanguages = ['en', 'es'];

Meteor.methods({
	sendInvitationSMS(phones, language) {
		const twilioService = SMS.getService('twilio');
		if (!SMS.enabled || !twilioService) {
			throw new Meteor.Error('error-twilio-not-active', 'Twilio service not active', {
				method: 'sendInvitationSMS',
			});
		}

		const messageFrom = settings.get('Invitation_SMS_Twilio_From');
		if (!twilioService.accountSid || ! twilioService.authToken || !messageFrom) {
			throw new Meteor.Error('error-twilio-not-configured', 'Twilio service not configured', {
				method: 'sendInvitationSMS',
			});
		}

		check(phones, [String]);
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'sendInvitationSMS',
			});
		}

		// to be replaced by a seperate permission specific to SMS later
		if (!hasPermission(Meteor.userId(), 'bulk-register-user')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'sendInvitationSMS',
			});
		}
		const phonePattern = /^\+?[1-9]\d{1,14}$/;
		const validPhones = _.compact(_.map(phones, function(phone) {
			if (phonePattern.test(phone)) {
				return phone;
			}
		}));
		const user = Meteor.user();
		let body;
		if (settings.get('Invitation_SMS_Customized')) {
			body = settings.get('Invitation_SMS_Customized_Body');
		} else {
			let lng = user.language || settings.get('language') || 'en';
			if (supportedLanguages.indexOf(language) > -1) {
				lng = language;
			}
			body = TAPi18n.__('Invitation_SMS_Default_Body', {
				lng,
			});
		}
		body = placeholders.replace(body);
		validPhones.forEach((phone) => {
			try {
				twilioService.send(messageFrom, phone, body);
			} catch ({ message }) {
				throw new Meteor.Error('error-sms-send-failed', `Error trying to send SMS: ${ message }`, {
					method: 'sendInvitationSMS',
					message,
				});
			}
		});
		return validPhones;
	},
});
