import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
	RocketChat.settings.addGroup('SMS', function() {
		this.add('SMS_Enabled', false, {
			type: 'boolean',
			i18nLabel: 'Enabled',
		});

		this.add('SMS_Service', 'twilio', {
			type: 'select',
			values: [{
				key: 'twilio',
				i18nLabel: 'Twilio',
			}],
			i18nLabel: 'Service',
		});

		this.section('Twilio', function() {
			this.add('SMS_Twilio_Account_SID', '', {
				type: 'string',
				enableQuery: {
					_id: 'SMS_Service',
					value: 'twilio',
				},
				i18nLabel: 'Account_SID',
			});
			this.add('SMS_Twilio_authToken', '', {
				type: 'string',
				enableQuery: {
					_id: 'SMS_Service',
					value: 'twilio',
				},
				i18nLabel: 'Auth_Token',
			});
		});

		this.section('Invitation', function() {
			this.add('Invitation_SMS_Twilio_From', '', {
				type: 'string',
				i18nLabel: 'Invitation_SMS_Twilio_From',
			});
			this.add('Invitation_SMS_Customized', false, {
				type: 'boolean',
				i18nLabel: 'Custom_SMS',
			});
			return this.add('Invitation_SMS_Customized_Body', '', {
				type: 'code',
				code: 'text',
				multiline: true,
				i18nLabel: 'Body',
				i18nDescription: 'Invitation_SMS_Customized_Body',
				enableQuery: {
					_id: 'Invitation_SMS_Customized',
					value: true,
				},
				i18nDefaultQuery: {
					_id: 'Invitation_SMS_Default_Body',
					value: false,
				},
			});
		});
	});
});
