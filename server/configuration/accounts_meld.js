import _ from 'underscore';
import { Accounts } from 'meteor/accounts-base';

const orig_updateOrCreateUserFromExternalService = Accounts.updateOrCreateUserFromExternalService;

Accounts.updateOrCreateUserFromExternalService = function(serviceName, serviceData = {}, ...args /* , options*/) {
	const services = [
		'facebook',
		'github',
		'gitlab',
		'google',
		'meteor-developer',
		'linkedin',
		'twitter',
		'sandstorm',
	];

	if (services.includes(serviceName) === false && serviceData._OAuthCustom !== true) {
		return;
	}

	if (serviceName === 'meteor-developer') {
		if (Array.isArray(serviceData.emails)) {
			const primaryEmail = serviceData.emails.sort((a) => a.primary !== true).filter((item) => item.verified === true)[0];
			serviceData.email = primaryEmail && primaryEmail.address;
		}
	}

	if (serviceName === 'linkedin') {
		serviceData.email = serviceData.emailAddress;
	}

	if (serviceData.email) {
		let user = RocketChat.models.Users.findOneByEmailAddress(serviceData.email);
		if (user != null) {
			const findQuery = {
				address: serviceData.email,
				verified: true,
			};

			if (!_.findWhere(user.emails, findQuery)) {
				RocketChat.models.Users.resetPasswordAndSetRequirePasswordChange(user._id, true, 'This_email_has_already_been_used_and_has_not_been_verified__Please_change_your_password');
			}

			RocketChat.models.Users.setServiceId(user._id, serviceName, serviceData.id);
			RocketChat.models.Users.setEmailVerified(user._id, serviceData.email);
		} else {
			// WIDECHAT
			user = RocketChat.models.Users.findOneByUsername(serviceData.userid);
			if (user != null) {
				RocketChat.models.Users.setServiceId(user._id, serviceName, serviceData.id);
				RocketChat.models.Users.setEmail(user._id, serviceData.email);
				RocketChat.models.Users.setEmailVerified(user._id, serviceData.email);
				RocketChat.models.Users.setName(user._id, serviceData.userid);
			}
		}
	}

	return orig_updateOrCreateUserFromExternalService.apply(this, [serviceName, serviceData, ...args]);
};
