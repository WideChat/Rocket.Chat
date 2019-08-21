import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import { handleError, t } from '../../../utils';
import { callbacks } from '../../../callbacks';
import './serviceAccountSidebarLogin.html';
import { popover, modal } from '../../../ui-utils';

Template.serviceAccountSidebarLogin.helpers({
	loading() {
		return Template.instance().loading.get();
	},
	users() {
		return Template.instance().users.get();
	},
	hasServiceAccounts() {
		return Template.instance().users.get() && Template.instance().users.get().length > 0;
	},
	owner() {
		return Meteor.user() && Meteor.user().u;
	},
	showOwnerAccountLink() {
		return localStorage.getItem('serviceAccountForceLogin') && Meteor.user() && !!Meteor.user().u;
	},
	receivedNewMessage(username) {
		if (Template.instance().notifiedServiceAccount) {
			return username === Template.instance().notifiedServiceAccount.get();
		}
		return false;
	},
});

Template.serviceAccountSidebarLogin.events({
	'click .js-login'(e) {
		e.preventDefault();
		let { username } = this;
		if (Meteor.user() && Meteor.user().u) {
			username = Meteor.user().u.username;
		}
		Meteor.call('getLoginToken', username, function(error, token) {
			if (error) {
				return handleError(error);
			}
			if (Meteor.user() && !Meteor.user().u) {
				localStorage.setItem('serviceAccountForceLogin', true);
			} else {
				localStorage.removeItem('serviceAccountForceLogin');
			}
			const user = Meteor.user();
			Meteor.logout(() => {
				callbacks.run('afterLogoutCleanUp', user);
				Meteor.call('logoutCleanUp', user, document.cookie);
				FlowRouter.go('home');
				popover.close();
				Meteor.loginWithToken(token.token, (err) => {
					if (err) {
						return handleError(err);
					}
				});
			});
		});
	},
	'click .js-add'(e) {
		e.preventDefault();
		popover.close();
		modal.open({
			title: t('Service_account_title'),
			content: 'createServiceAccount',
			data: {
				onCreate() {
					modal.close();
				},
			},
			modifier: 'modal',
			showConfirmButton: false,
			showCancelButton: false,
			confirmOnEnter: false,
		});
	},
});

Template.serviceAccountSidebarLogin.onCreated(function() {
	const instance = this;
	this.ready = new ReactiveVar(true);
	this.users = new ReactiveVar([]);
	this.loading = new ReactiveVar(true);
	this.notifiedServiceAccount = new ReactiveVar('');
	instance.notifiedServiceAccount.set(Session.get('saMessageReceiver'));
	Session.delete('saMessageReceiver');
	Session.delete('saNotification');
	this.autorun(() => {
		instance.loading.set(true);
		Meteor.call('getLinkedServiceAccounts', function(err, serviceAccounts) {
			if (err) {
				this.loading.set(false);
				return handleError(err);
			}
			instance.users.set(serviceAccounts);
			instance.loading.set(false);
		});
	});
});
