import Page from './Page';

class MainContent extends Page {
	get mainContent() { return $('.main-content'); }

	// Main Content Header (Channel Title Area)
	get emptyFavoriteStar() { return $('.js-favorite .rc-header__icon--star'); }

	get favoriteStar() { return $('.js-favorite .rc-header__icon--star-filled'); }

	get channelTitle() { return $('.rc-header__name'); }

	// Main Content Footer (Message Input Area)
	get messageInput() { return $('.js-input-message'); }

	get sendBtn() { return $('.rc-message-box__icon.js-send'); }

	get messageBoxActions() { return $('.rc-message-box__icon'); }

	get recordBtn() { return $('.js-audio-message-record'); }

	get videoCamBtn() { return $('.message-buttons .icon-videocam'); }

	get emojiBtn() { return $('.rc-message-box__icon.emoji-picker-icon'); }

	get messagePopUp() { return $('.message-popup'); }

	get messagePopUpTitle() { return $('.message-popup-title'); }

	get messagePopUpItems() { return $('.message-popup-items'); }

	get messagePopUpFirstItem() { return $('.popup-item.selected'); }

	get mentionAllPopUp() { return $('.popup-item[data-id="all"]'); }

	get joinChannelBtn() { return $('.button.join'); }

	// Messages
	get lastMessageUser() { return $('.message:last-child .title .user-card-message'); }

	get lastMessage() { return $('.message:last-child .body'); }

	get lastMessageDesc() { return $('.message:last-child .body .attachment-description'); }

	get lastMessageRoleAdded() { return $('.message:last-child.subscription-role-added .body'); }

	get beforeLastMessage() { return $('.message:nth-last-child(2) .body'); }

	get lastMessageUserTag() { return $('.message:last-child .role-tag'); }

	get lastMessageImg() { return $('.message:last-child .attachment-image img'); }

	get lastMessageTextAttachment() { return $('.message:last-child .attachment-text'); }

	get beforeLastMessageQuote() { return $('.message:nth-last-child(2)'); }

	get lastMessageQuote() { return $('.message:last-child'); }

	get messageOptionsBtn() { return $('.message:last-child .message-actions__menu'); }

	get messageActionMenu() { return $('.rc-popover .rc-popover__content'); }

	get messageReply() { return $('[data-id="reply-in-thread"][data-type="message-action"]'); }

	get messageEdit() { return $('[data-id="edit-message"][data-type="message-action"]'); }

	get messageDelete() { return $('[data-id="delete-message"][data-type="message-action"]'); }

	get messagePermalink() { return $('[data-id="permalink"][data-type="message-action"]'); }

	get messageCopy() { return $('[data-id="copy"][data-type="message-action"]'); }

	get messageQuote() { return $('[data-id="quote-message"][data-type="message-action"]'); }

	get messageStar() { return $('[data-id="star-message"][data-type="message-action"]'); }

	get messageUnread() { return $('[data-id="mark-message-as-unread"][data-type="message-action"]'); }

	// get messageReaction() { return $('.message-actions__button[data-message-action="reaction-message"]'); }
	get messagePin() { return $('[data-id="pin-message"][data-type="message-action"]'); }
	// get messageClose() { return $('[data-id="rc-popover-close"][data-type="message-action"]'); }

	// Emojis
	get emojiPickerMainScreen() { return $('.emoji-picker'); }

	get emojiPickerPeopleIcon() { return $('.emoji-picker .icon-people'); }

	get emojiPickerNatureIcon() { return $('.emoji-picker .icon-nature'); }

	get emojiPickerFoodIcon() { return $('.emoji-picker .icon-food'); }

	get emojiPickerActivityIcon() { return $('.emoji-picker .icon-activity'); }

	get emojiPickerTravelIcon() { return $('.emoji-picker .icon-travel'); }

	get emojiPickerObjectsIcon() { return $('.emoji-picker .icon-objects'); }

	get emojiPickerSymbolsIcon() { return $('.emoji-picker .icon-symbols'); }

	get emojiPickerFlagsIcon() { return $('.emoji-picker .icon-flags'); }

	get emojiPickerModifierIcon() { return $('.emoji-picker .icon-symbols'); }

	get emojiPickerChangeTone() { return $('.emoji-picker .change-tone'); }

	get emojiPickerCustomIcon() { return $('.emoji-picker .icon-rocket'); }

	get emojiPickerRecentIcon() { return $('.emoji-picker .icon-recent'); }

	get emojiPickerFilter() { return $('.emoji-picker .js-emojipicker-search'); }

	get emojiPickerEmojiContainer() { return $('.emoji-picker .emojis'); }

	get emojiGrinning() { return $('.emoji-picker .emoji-grinning'); }

	get emojiSmile() { return $('.emoji-picker .emoji-smile'); }

	// Popover
	get popoverWrapper() { return $('.rc-popover'); }

	// Sends a message and wait for the message to equal the text sent
	sendMessage(text) {
		this.setTextToInput(text);
		this.sendBtn.click();
		browser.waitUntil(function() {
			browser.waitForDisplayed('.message:last-child .body', 5000);
			return browser.getText('.message:last-child .body') === text;
		}, 5000);
	}

	// adds text to the input
	addTextToInput(text) {
		this.messageInput.waitForDisplayed(5000);
		this.messageInput.addValue(text);
	}

	// Clear and sets the text to the input
	setTextToInput(text) {
		this.messageInput.waitForDisplayed(5000);
		this.messageInput.clearElement();
		this.messageInput.addValue(text);
	}

	// uploads a file in the given filepath (url).
	fileUpload(filePath) {
		this.sendMessage('Prepare for the file');
		this.fileAttachment.chooseFile(filePath);
	}

	waitForLastMessageEqualsText(text) {
		browser.waitUntil(function() {
			browser.waitForDisplayed('.message:last-child .body', 5000);
			return browser.getText('.message:last-child .body') === text;
		}, 5000);
	}

	waitForLastMessageEqualsHtml(text) {
		browser.waitUntil(function() {
			browser.waitForDisplayed('.message:last-child .body', 5000);
			return browser.getHTML('.message:last-child .body', false).trim() === text;
		}, 5000);
	}

	waitForLastMessageTextAttachmentEqualsText(text) {
		browser.waitForDisplayed('.message:last-child .attachment-text', 5000);
		return browser.getText('.message:last-child .attachment-text') === text;
	}

	// Wait for the last message author username to equal the provided text
	waitForLastMessageUserEqualsText(text) {
		browser.waitUntil(function() {
			browser.waitForDisplayed('.message:last-child .user-card-message:nth-of-type(2)', 5000);
			return browser.getText('.message:last-child .user-card-message:nth-of-type(2)') === text;
		}, 5000);
	}

	openMessageActionMenu() {
		this.lastMessage.moveToObject();
		this.messageOptionsBtn.waitForDisplayed(5000);
		this.messageOptionsBtn.click();
		this.messageActionMenu.waitForDisplayed(5000);
		browser.pause(100);
	}

	setLanguageToEnglish() {
		this.settingLanguageSelect.click();
		this.settingLanguageEnglish.click();
		this.settingSaveBtn.click();
	}

	tryToMentionAll() {
		this.addTextToInput('@all');
		this.sendBtn.click();
		this.waitForLastMessageEqualsText('Notify all in this room is not allowed');
	}

	// Do one of the message actions, based on the "action" parameter inserted.
	selectAction(action) {
		switch (action) {
			case 'edit':
				this.messageEdit.waitForDisplayed(5000);
				this.messageEdit.click();
				this.messageInput.addValue('this message was edited');
				break;
			case 'reply':
				this.messageReply.waitForDisplayed(5000);
				this.messageReply.click();
				this.messageInput.addValue(' this is a reply message');
				break;
			case 'delete':
				this.messageDelete.waitForDisplayed(5000);
				this.messageDelete.click();
				break;
			case 'permalink':
				this.messagePermalink.waitForDisplayed(5000);
				this.messagePermalink.click();
				break;
			case 'copy':
				this.messageCopy.waitForDisplayed(5000);
				this.messageCopy.click();
				break;
			case 'quote':
				this.messageQuote.waitForDisplayed(5000);
				this.messageQuote.click();
				this.messageInput.addValue(' this is a quote message');
				break;
			case 'star':
				this.messageStar.waitForDisplayed(5000);
				this.messageStar.click();
				break;
			case 'unread':
				this.messageUnread.waitForDisplayed(5000);
				this.messageUnread.click();
				break;
			case 'reaction':
				this.messageReply.waitForDisplayed(5000);
				this.messageReply.click();
				this.emojiPickerMainScreen.waitForDisplayed(5000);
				this.emojiPickerPeopleIcon.click();
				this.emojiGrinning.waitForDisplayed(5000);
				this.emojiGrinning.click();
				break;
			case 'close':
				this.messageClose.waitForDisplayed(5000);
				this.messageClose.click();
				break;
		}
	}
}

export default new MainContent();
