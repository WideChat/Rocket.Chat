import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { MessageTypes } from '../../ui-utils/client';
import { Markdown } from '../../markdown/client';
import './messageThread';
import { escapeHTML } from '../../../lib/escapeHTML';
import { renderMentions } from '../../mentions/client/client';
import { renderMessageBody } from '../../../client/lib/renderMessageBody';
import { settings } from '../../settings/client';
import './messageBubble.html';

const renderBody = (msg, settings) => {
	const searchedText = msg.searchedText ? msg.searchedText : '';
	const isSystemMessage = MessageTypes.isSystemMessage(msg);
	const messageType = MessageTypes.getType(msg) || {};

	if (messageType.render) {
		msg = messageType.render(msg);
	} else if (messageType.template) {
		// render template
	} else if (messageType.message) {
		msg.msg = escapeHTML(msg.msg);
		msg = TAPi18n.__(messageType.message, { ...typeof messageType.data === 'function' && messageType.data(msg) });
	} else if (msg.u && msg.u.username === settings.Chatops_Username) {
		msg.html = msg.msg;
		msg = renderMentions(msg);
		msg = msg.html;
	} else {
		msg = renderMessageBody(msg);
	}

	if (isSystemMessage) {
		msg.html = Markdown.parse(msg.html);
	}

	if (searchedText) {
		msg = msg.replace(new RegExp(searchedText, 'gi'), (str) => `<mark>${ str }</mark>`);
	}

	return msg;
};

Template.messageBubble.helpers({
	unread() {
		const { msg, subscription } = this;
		return subscription?.tunread?.includes(msg._id);
	},
	body() {
		const { msg, settings } = this;
		return Tracker.nonreactive(() => renderBody(msg, settings));
	},
	attachmentsClass() {
		const { msg } = this;

		if (msg.attachments?.length) {
			return 'attachment';
		}

		if (msg.urls?.length) {
			return 'url';
		}
	},
	hasAttachments() {
		const { msg } = this;
		return msg.attachments?.length;
	},
	own() {
		const { msg, u = {} } = this;
		return (msg.u && msg.u._id === u._id) ? 'own' : 'notOwn';
	},
	timestamp() {
		const { msg } = this;
		return +msg.ts;
	},
	hasOembed() {
		const { msg, settings } = this;
		// there is no URLs, there is no template to show the oembed (oembed package removed) or oembed is not enable
		if (!(msg.urls && msg.urls.length > 0) || !Template.oembedBaseWidget || !settings.API_Embed) {
			return false;
		}
		// check if oembed is disabled for message's sender
		if ((settings.API_EmbedDisabledFor || '').split(',').map((username) => username.trim()).includes(msg.u && msg.u.username)) {
			return false;
		}
		return true;
	},
	injectMessage(data, { _id, rid }) {
		data.msg = { _id, rid };
	},
	injectIndex(data, index) {
		data.index = index;
	},
	injectSettings(data, settings) {
		data.settings = settings;
	},
	actionContext() {
		const { msg } = this;
		return msg.actionContext;
	},
	shouldHideBody() {
		const { msg: { tmid, actionContext }, settings: { showreply }, context } = this;
		return showreply && tmid && !(actionContext || context);
	},
	readReceipt() {
		if (!settings.get('Message_Read_Receipt_Enabled')) {
			return;
		}

		return {
			readByEveryone: (!this.msg.unread && 'read') || 'color-component-color',
		};
	},
});

const hasTempClass = (node) => node.classList.contains('temp');

const getPreviousSentMessage = (currentNode) => {
	if (hasTempClass(currentNode)) {
		return currentNode.previousElementSibling;
	}
	if (currentNode.previousElementSibling != null) {
		let previousValid = currentNode.previousElementSibling;
		while (previousValid != null && (hasTempClass(previousValid) || !previousValid.classList.contains('message'))) {
			previousValid = previousValid.previousElementSibling;
		}
		return previousValid;
	}
};

const isNewDay = (currentNode, previousNode, forceDate, showDateSeparator) => {
	if (!showDateSeparator) {
		return false;
	}

	if (forceDate || !previousNode) {
		return true;
	}

	const { dataset: currentDataset } = currentNode;
	const { dataset: previousDataset } = previousNode;
	const previousMessageDate = new Date(parseInt(previousDataset.timestamp));
	const currentMessageDate = new Date(parseInt(currentDataset.timestamp));

	if (previousMessageDate.toDateString() !== currentMessageDate.toDateString()) {
		return true;
	}

	return false;
};

const isSequential = (currentNode, previousNode, forceDate, period, showDateSeparator, shouldCollapseReplies) => {
	if (!previousNode) {
		return false;
	}

	if (showDateSeparator && forceDate) {
		return false;
	}

	const { dataset: currentDataset } = currentNode;
	const { dataset: previousDataset } = previousNode;
	const previousMessageDate = new Date(parseInt(previousDataset.timestamp));
	const currentMessageDate = new Date(parseInt(currentDataset.timestamp));

	if (showDateSeparator && previousMessageDate.toDateString() !== currentMessageDate.toDateString()) {
		return false;
	}

	if (!shouldCollapseReplies && currentDataset.tmid) {
		return previousDataset.id === currentDataset.tmid || previousDataset.tmid === currentDataset.tmid;
	}

	if (previousDataset.tmid && !currentDataset.tmid) {
		return false;
	}

	if ([previousDataset.groupable, currentDataset.groupable].includes('false')) {
		return false;
	}

	if (previousDataset.username !== currentDataset.username) {
		return false;
	}

	if (previousDataset.alias !== currentDataset.alias) {
		return false;
	}

	if (parseInt(currentDataset.timestamp) - parseInt(previousDataset.timestamp) <= period) {
		return true;
	}

	return false;
};

const processSequentials = ({ index, currentNode, settings, forceDate, showDateSeparator = true, groupable, shouldCollapseReplies }) => {
	if (!showDateSeparator && !groupable) {
		return;
	}
	// const currentDataset = currentNode.dataset;
	const previousNode = (index === undefined || index > 0) && getPreviousSentMessage(currentNode);
	const nextNode = currentNode.nextElementSibling;

	if (!previousNode) {
		setTimeout(() => {
			currentNode.dispatchEvent(new CustomEvent('MessageGroup', { bubbles: true }));
		}, 100);
	}
	if (isSequential(currentNode, previousNode, forceDate, settings.Message_GroupingPeriod, showDateSeparator, shouldCollapseReplies)) {
		currentNode.classList.add('sequential');
	} else {
		currentNode.classList.remove('sequential');
	}

	if (isNewDay(currentNode, previousNode, forceDate, showDateSeparator)) {
		currentNode.classList.add('new-day');
	} else {
		currentNode.classList.remove('new-day');
	}

	if (nextNode && nextNode.dataset) {
		if (isSequential(nextNode, currentNode, forceDate, settings.Message_GroupingPeriod, showDateSeparator, shouldCollapseReplies)) {
			nextNode.classList.add('sequential');
		} else {
			nextNode.classList.remove('sequential');
		}

		if (isNewDay(nextNode, currentNode, forceDate, showDateSeparator)) {
			nextNode.classList.add('new-day');
		} else {
			nextNode.classList.remove('new-day');
		}
	}
};

Template.messageBubble.onRendered(function() {
	const currentNode = this.firstNode;
	this.autorun(() => processSequentials({ currentNode, ...Template.currentData() }));
});
