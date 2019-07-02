import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { handleError } from '../../../utils';
import './serviceAccountSidebarLogin.html';

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
		return Meteor.user().u;
	},
	showOwnerAccountLink() {
		return localStorage.getItem('serviceAccountForceLogin') && !!Meteor.user().u;
	},
});

Template.serviceAccountSidebarLogin.events({
	'click .js-login'(e) {
		e.preventDefault();
		let { username } = this;
		if (Meteor.user().u) {
			username = Meteor.user().u.username;
		}
		Meteor.call('getLoginToken', username, function(error, token) {
			if (error) {
				return handleError(error);
			}
			FlowRouter.go('/home');
			Meteor.loginWithToken(token.token, (err) => {
				if (err) {
					return handleError(err);
				}
				document.location.reload(true);
				if (Meteor.user().u) {
					localStorage.setItem('serviceAccountForceLogin', true);
				} else {
					localStorage.removeItem('serviceAccountForceLogin');
				}
			});
		});
	},
});

Template.serviceAccountSidebarLogin.onCreated(function() {
	const instance = this;
	this.ready = new ReactiveVar(true);
	this.users = new ReactiveVar([]);
	this.loading = new ReactiveVar(true);
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
