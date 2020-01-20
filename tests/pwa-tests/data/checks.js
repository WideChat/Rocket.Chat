import loginPage from '../pageobjects/login.page';
import mainContent from '../pageobjects/main-content.page';
import sideNav from '../pageobjects/side-nav.page';


export let publicChannelCreated = false;
export let privateChannelCreated = false;
export let directMessageCreated = false;

export function setPublicChannelCreated(status) {
	publicChannelCreated = status;
}

export function setPrivateChannelCreated(status) {
	privateChannelCreated = status;
}

export function setDirectMessageCreated(status) {
	directMessageCreated = status;
}

export function checkIfUserIsValid(username, email, password) {
	if (!sideNav.sidebarHeader.isDisplayed()) {
		console.log('	User not logged. logging in...');
		loginPage.open();
		loginPage.login({ email, password });
		try {
			mainContent.mainContent.waitForExist(5000);
		} catch (e) {
			console.log('	User dont exist. Creating user...');
			loginPage.gotToRegister();
			loginPage.registerNewUser({ username, email, password })
			var usernameFormField = browser.$('form#login-card input#username')
			usernameFormField.waitForExist(5000);
			loginPage.submitButton.click();
			mainContent.mainContent.waitForExist(5000);
		}
	} else if (browser.execute(() => Meteor.user().username).value !== username) {
		console.log('	Wrong logged user. Changing user...');
		sideNav.sidebarUserMenu.waitForDisplayed(5000);
		sideNav.sidebarUserMenu.click();
		sideNav.logout.waitForDisplayed(5000);
		sideNav.logout.click();

		loginPage.open();
		mainContent.mainContent.waitForExist(5000);
	} else {
		console.log('	User already logged');
	}
}
