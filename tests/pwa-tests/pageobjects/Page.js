class Page {
	get body() { return browser.$('body'); }

	open(path, offline) {
		// browser.windowHandleSize({
		// 	width: 1600,
		// 	height: 1600,
		// });

		this.offlineMode(offline)
		browser.url(`http://localhost:3000/${ path }`);

		this.body.waitForExist();
	}

	offlineMode(offline) {
		if(offline) {
			browser.setNetworkConnection({ type: 1 }) //airplane mode
		} else {
			browser.setNetworkConnection({ type: 6 }) //wifi mode
		}
	}

	refresh() {
		browser.refresh();
	}
}
module.exports = Page;
