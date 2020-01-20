import mainContent from '../../pageobjects/main-content.page';
import sideNav from '../../pageobjects/side-nav.page';
import { username, email, password } from '../../../data/user.js';
import { checkIfUserIsValid, publicChannelCreated, privateChannelCreated, directMessageCreated, setPublicChannelCreated, setPrivateChannelCreated, setDirectMessageCreated } from '../../data/checks';

const message = `message from ${ username }`;
let currentTest = 'none';

function messagingTest() {
	describe('Normal message:', () => {
		it('it should send a message in offline', () => {
			mainContent.sendMessage(message);
		});

		it('it should show the last message in offline', () => {
			mainContent.lastMessage.isDisplayed().should.be.true;
		});
	});

}
function messageActionsTest() {
	describe('[Actions]', () => {
		before(() => {
			mainContent.sendMessage('Message for Message Actions Tests');
		});
		describe('Render:', () => {
			before(() => {
				mainContent.openMessageActionMenu();
			});

			after(() => {
				mainContent.popoverWrapper.click();
			});

			it('it should show the message action menu', () => {
				mainContent.messageActionMenu.isDisplayed().should.be.true;
			});

			it('it should show the reply action', () => {
				mainContent.messageReply.isDisplayed().should.be.true;
			});

			it('it should show the edit action', () => {
				mainContent.messageEdit.isDisplayed().should.be.true;
			});

			it('it should show the delete action', () => {
				mainContent.messageDelete.isDisplayed().should.be.true;
			});

			it('it should show the permalink action', () => {
				mainContent.messagePermalink.isDisplayed().should.be.true;
			});

			it('it should show the copy action', () => {
				mainContent.messageCopy.isDisplayed().should.be.true;
			});

			it('it should show the quote the action', () => {
				mainContent.messageQuote.isDisplayed().should.be.true;
			});

			it('it should show the star action', () => {
				mainContent.messageStar.isDisplayed().should.be.true;
			});

			if (currentTest === 'general') {
				it('it should not show the pin action', () => {
					mainContent.messagePin.isDisplayed().should.be.false;
				});
			}

			it('it should not show the mark as unread action', () => {
				mainContent.messageUnread.isDisplayed().should.be.false;
			});
		});
	});
}

describe('[Message]', () => {
	before(() => {
		checkIfUserIsValid(username, email, password);
	});

	describe('[GENERAL Channel]', () => {
		before(() => {
			sideNav.openChannel('general');
			currentTest = 'general';
			mainContent.setOfflineMode();
		});
		it('it should show reconnecting alert', () => {
			mainContent.warningAlert.waitForDisplayed(10000);
			mainContent.warningAlert.isDisplayed().should.be.true;
		});
		messagingTest();
		messageActionsTest();
	});
});

