import Page from './Page';

class SideNav extends Page {
	// New channel
	get channelType() { return browser.$('.create-channel__content .rc-switch__button'); }

	get channelName() { return browser.$('.create-channel__content input[name="name"]'); }

	get saveChannelBtn() { return browser.$('.rc-modal__content [data-button="create"]'); }

	// Account box
	getPopOverContent() { return browser.$('.rc-popover__content'); }

	get accountBoxUserName() { return browser.$('.sidebar__account-username'); }

	get accountBoxUserAvatar() { return browser.$('.sidebar__account .avatar-image'); }

	get accountMenu() { return browser.$('.sidebar__account'); }

	get sidebarHeader() { return browser.$('.sidebar__header'); }

	get sidebarUserMenu() { return browser.$('.sidebar__header .avatar'); }

	get sidebarMenu() { return browser.$('.sidebar__toolbar-button-icon--menu'); }

	get popOverContent() { return browser.$('.rc-popover__content'); }

	get statusOnline() { return browser.$('.rc-popover__item--online'); }

	get statusAway() { return browser.$('.rc-popover__item--away'); }

	get statusBusy() { return browser.$('.rc-popover__item--busy'); }

	get statusOffline() { return browser.$('.rc-popover__item--offline'); }

	get account() { return browser.$('[data-id="account"][data-type="open"]'); }

	get admin() { return browser.$('[data-id="administration"][data-type="open"]'); }

	get logout() { return browser.$('[data-id="logout"][data-type="open"]'); }

	get sideNavBar() { return browser.$('.sidebar'); }

	// Toolbar
	get spotlightSearchIcon() { return browser.$('.sidebar__toolbar-button-icon--magnifier'); }

	get spotlightSearch() { return browser.$('.toolbar__search input'); }

	get spotlightSearchPopUp() { return browser.$('.rooms-list__toolbar-search'); }

	get newChannelBtnToolbar() { return browser.$('.sidebar__toolbar-button-icon--edit-rounded'); }

	get newChannelBtn() { return browser.$('.rc-popover__icon-$--hashtag'); }

	get newDiscussionBtn() { return browser.$('.rc-popover__icon-$--discussion'); }

	get newChannelIcon() { return browser.$('.toolbar__icon.toolbar__search-create-channel'); }

	// Rooms List
	get general() { return this.getChannelFromList('general'); }

	get channelLeave() { return browser.$('.leave-room'); }

	get channelHoverIcon() { return browser.$('.rooms-list > .wrapper > ul [title="general"] .icon-eye-off'); }

	get moreChannels() { return browser.$('.rooms-list .more-channels'); }

	// Account
	get preferences() { return browser.$('[href="/account/preferences"]'); }

	get profile() { return browser.$('[href="/account/profile"]'); }

	get avatar() { return browser.$('[href="/changeavatar"]'); }

	get preferencesClose() { return browser.$('.sidebar-flex__close-button[data-action="close"]'); }

	get burgerBtn() { return browser.$('.burger'); }

	get sidebarWrap() { return browser.$('.sidebar-wrap'); }

	get firstSidebarItem() { return browser.$('.sidebar-item'); }

	get firstSidebarItemMenu() { return browser.$('.sidebar-item__menu'); }

	get popoverOverlay() { return browser.$('.rc-popover.rc-popover--sidebar-item'); }

	// Opens a channel via rooms list
	openChannel(channelName) {
		browser.$(`.sidebar-item__ellipsis=${ channelName }`).waitForDisplayed(10000);
		browser.$(`.sidebar-item__ellipsis=${ channelName }`).click();
		browser.$('.js-input-message').waitForDisplayed(5000);
		browser.$('.rc-header').waitForDisplayed(5000);
		browser.waitUntil(function() {
			browser.$('.rc-header__name').waitForDisplayed(8000);
			return browser.$('.rc-header__name').getText() === channelName;
		}, 10000);
	}

}

module.exports = new SideNav();
