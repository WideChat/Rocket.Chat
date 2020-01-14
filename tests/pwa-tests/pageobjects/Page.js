import httpProxy from 'http-proxy'
class Page {
	get body() { return browser.$('body'); }

	open(path, offline) {
		// browser.windowHandleSize({
		// 	width: 1600,
		// 	height: 1600,
		// });

		this.offlineMode(offline);
		browser.url(`http://localhost:5000/${ path }`);
		this.body.waitForExist();
	}

	offlineMode(offline) {

		if(offline) {
			browser.stopProxy();  // custom command to stop proxy setup
			browser.setNetworkConditions({ latency: 0, throughput: 0, offline: true });
			console.log('Offline')
		} else {
			browser.startProxy(); // custom command to start proxy setup
			browser.setNetworkConditions({}, 'Good 3G');
			console.log('Online')
		}

	}

	refresh() {
		browser.refresh();
	}
}
export default Page;
