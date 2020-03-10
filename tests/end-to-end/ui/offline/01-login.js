import loginPage from '../../../pageobjects/login.page';

describe('Test login page in Offline', () => {
	before(() => {
		loginPage.useProxy(true);
		loginPage.open();
		loginPage.emailOrUsernameField.waitForVisible(15000);
		loginPage.gotToRegister();
		loginPage.gotBackToLogin();
		loginPage.gotToForgotPassword();
		loginPage.gotBackToLogin();
	});
	after(() => {
		loginPage.useProxy(false);
	});

	describe('[Render]', () => {
		before(() => {
			browser.pause(1000);
			loginPage.offlineMode(true);
            loginPage.open({offline: true});
			loginPage.warningAlert.waitForVisible(15000);
			loginPage.emailOrUsernameField.waitForVisible(15000);
		});

		it('it should show reconnecting alert', () => {
			loginPage.warningAlert.isVisible().should.be.true;
		});

		it('it should show email / username field', () => {
			loginPage.emailOrUsernameField.isVisible().should.be.true;
		});

		it('it should show password field', () => {
			loginPage.passwordField.isVisible().should.be.true;
		});

		it('it should show submit button', () => {
			loginPage.submitButton.isVisible().should.be.true;
		});

		it('it should show register button', () => {
			loginPage.registerButton.isVisible().should.be.true;
		});

		it('it should show forgot password button', () => {
			loginPage.forgotPasswordButton.isVisible().should.be.true;
		});

		it('it should not show name field', () => {
			loginPage.nameField.isVisible().should.be.false;
		});

		it('it should not show email field', () => {
			loginPage.emailField.isVisible().should.be.false;
		});

		it('it should not show confirm password field', () => {
			loginPage.confirmPasswordField.isVisible().should.be.false;
		});

		it('it should not show back to login button', () => {
			loginPage.backToLoginButton.isVisible().should.be.false;
		});
	});

	describe('[Required Fields]', () => {
		before(() => {
			loginPage.submit();
		});

		describe('email / username: ', () => {
			it('it should be required', () => {
				loginPage.emailOrUsernameField.getAttribute('class').should.contain('error');
				loginPage.emailOrUsernameInvalidText.getText().should.not.be.empty;
			});
		});

		describe('password: ', () => {
			it('it should be required', () => {
				loginPage.passwordField.getAttribute('class').should.contain('error');
				loginPage.passwordInvalidText.getText().should.not.be.empty;
			});
		});
	});
});


describe('Test Registration Page in Offline', () => {
	before(() => {
		loginPage.useProxy(true);
		loginPage.gotToRegister();
	});
	after(() => {
		loginPage.useProxy(false);
	});

	describe('render:', () => {
		it('it should show reconnecting alert', () => {
			loginPage.warningAlert.isVisible().should.be.true;
		});

		it('it should show name field', () => {
			loginPage.nameField.isVisible().should.be.true;
		});

		it('it should show email field', () => {
			loginPage.emailField.isVisible().should.be.true;
		});

		it('it should show password field', () => {
			loginPage.passwordField.isVisible().should.be.true;
		});

		it('it should show confirm password field', () => {
			loginPage.confirmPasswordField.isVisible().should.be.true;
		});

		it('it should not show email / username field', () => {
			loginPage.emailOrUsernameField.isVisible().should.be.false;
		});

		it('it should show submit button', () => {
			loginPage.submitButton.isVisible().should.be.true;
		});

		it('it should not show register button', () => {
			loginPage.registerButton.isVisible().should.be.false;
		});

		it('it should not show forgot password button', () => {
			loginPage.forgotPasswordButton.isVisible().should.be.false;
		});

		it('it should show back to login button', () => {
			loginPage.backToLoginButton.isVisible().should.be.true;
		});
	});

	describe('name:', () => {
		it('it should be required', () => {
			loginPage.submit();
			loginPage.nameField.getAttribute('class').should.contain('error');
			loginPage.nameInvalidText.getText().should.not.be.empty;
		});
	});

	describe('email:', () => {
		it('it should be required', () => {
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});

		it('it should be invalid for email without domain', () => {
			loginPage.emailField.setValue('invalid-email');
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});

		it('it should be invalid for email with invalid domain', () => {
			loginPage.emailField.setValue('invalid-email@mail');
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});

		it.skip('it should be invalid for email space', () => {
			loginPage.emailField.setValue('invalid email@mail.com');
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});
	});

	describe('password:', () => {
		it('it should be required', () => {
			loginPage.submit();
			loginPage.passwordField.getAttribute('class').should.contain('error');
			loginPage.passwordInvalidText.getText().should.not.be.empty;
		});
	});

	describe('confirm-password:', () => {
		it('it should be invalid if different from password', () => {
			loginPage.passwordField.setValue('password');
			loginPage.submit();
			loginPage.confirmPasswordField.getAttribute('class').should.contain('error');
			loginPage.confirmPasswordInvalidText.getText().should.not.be.empty;
		});

		it('it should be valid if equal to password', () => {
			loginPage.confirmPasswordField.setValue('password');
			loginPage.submit();
			loginPage.passwordField.getAttribute('class').should.not.contain('error');
			loginPage.passwordInvalidText.getText().should.be.empty;
		});
	});
});

describe('Test Forgot Password in Offline', () => {
	before(() => {
		loginPage.useProxy(true);
        loginPage.open({offline: true});
		loginPage.emailOrUsernameField.waitForVisible(15000);
		loginPage.gotToForgotPassword();
	});
	after(() => {
		loginPage.useProxy(false);
	});

	describe('render:', () => {
		it('it should show reconnecting alert', () => {
			loginPage.warningAlert.isVisible().should.be.true;
		});

		it('it should not show name field', () => {
			loginPage.nameField.isVisible().should.be.false;
		});

		it('it should show email field', () => {
			loginPage.emailField.isVisible().should.be.true;
		});

		it('it should not show password field', () => {
			loginPage.passwordField.isVisible().should.be.false;
		});

		it('it should not show confirm password field', () => {
			loginPage.confirmPasswordField.isVisible().should.be.false;
		});

		it('it should not show email / username field', () => {
			loginPage.emailOrUsernameField.isVisible().should.be.false;
		});

		it('it should show submit button', () => {
			loginPage.submitButton.isVisible().should.be.true;
		});

		it('it should not show register button', () => {
			loginPage.registerButton.isVisible().should.be.false;
		});

		it('it should not show forgot password button', () => {
			loginPage.forgotPasswordButton.isVisible().should.be.false;
		});

		it('it should show back to login button', () => {
			loginPage.backToLoginButton.isVisible().should.be.true;
		});
	});

	describe('email:', () => {
		it('it should be required', () => {
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});

		it('it should be invalid for email without domain', () => {
			loginPage.emailField.setValue('invalid-email');
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});

		it('it should be invalid for email with invalid domain', () => {
			loginPage.emailField.setValue('invalid-email@mail');
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});

		it.skip('it should be invalid for email space', () => {
			loginPage.emailField.setValue('invalid email@mail.com');
			loginPage.submit();
			loginPage.emailField.getAttribute('class').should.contain('error');
			loginPage.emailInvalidText.getText().should.not.be.empty;
		});
	});
});
