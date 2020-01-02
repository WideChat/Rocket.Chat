const Page = require('./Page');

class LoginPage extends Page {
	get registerButton() { return $('button.register'); }

	get forgotPasswordButton() { return $('.forgot-password'); }

	get backToLoginButton() { return $('.back-to-login'); }

	get submitButton() { return $('.login'); }

	get emailOrUsernameField() { return $('[name=emailOrUsername]'); }

	get nameField() { return $('[name=name]'); }

	get emailField() { return $('[name=email]'); }

	get passwordField() { return $('[name=pass]'); }

	get confirmPasswordField() { return $('[name=confirm-pass]'); }

	get reasonField() { return $('[name=reason]'); }

	get inputUsername() { return $('form#login-card input#username'); }

	get emailOrUsernameInvalidText() { return $('[name=emailOrUsername]~.input-error'); }

	get nameInvalidText() { return $('[name=name]~.input-error'); }

	get emailInvalidText() { return $('[name=email]~.input-error'); }

	get passwordInvalidText() { return $('[name=pass]~.input-error'); }

	get confirmPasswordInvalidText() { return $('[name=confirm-pass]~.input-error'); }

	get registrationSucceededCard() { return $('#login-card h2'); }

	open() {
		super.open('', false);
	}

	openInOffline() {
		super.open('', true);
	}
	
	setOfflineMode() {
		super.offlineMode(true);
	}

	setOnlineMode() {
		super.offlineMode(false)
	}

	refresh() {
		super.refresh();
	}

	gotToRegister() {
		this.registerButton.waitForDisplayed(5000);
		this.registerButton.click();
		this.nameField.waitForDisplayed(15000);
	}

	gotToForgotPassword() {
		this.forgotPasswordButton.waitForDisplayed(5000);
		this.forgotPasswordButton.click();
		this.emailField.waitForDisplayed(15000);
	}

	registerNewUser({ username, email, password }) {
		this.nameField.waitForDisplayed(5000);
		this.nameField.setValue(username);
		this.emailField.setValue(email);
		this.passwordField.setValue(password);
		this.confirmPasswordField.setValue(password);

		this.submit();
	}

	registerNewAdmin({ adminUsername, adminEmail, adminPassword }) {
		this.nameField.waitForDisplayed(5000);
		this.nameField.setValue(adminUsername);
		this.emailField.setValue(adminEmail);
		this.passwordField.setValue(adminPassword);
		this.confirmPasswordField.setValue(adminPassword);

		this.submit();
	}

	login({ email, password }) {
		this.emailOrUsernameField.waitForDisplayed(5000);
		this.emailOrUsernameField.setValue(email);
		this.passwordField.setValue(password);

		this.submit();
	}

	submit() {
		this.submitButton.waitForDisplayed(5000);
		this.submitButton.click();
	}
}

module.exports = new LoginPage();
