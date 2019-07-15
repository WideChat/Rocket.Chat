import { settings } from '../../../settings';

export class API {
	constructor() {
		this.adminApi = '/ghost/api/v2/admin';
	}

	buildAPIUrl(type, subtype = '') {
		const base = settings.get('Article_Site_Url').replace(/\/$/, '');
		const dir = `/${ type }/${ subtype }`;
		return base + this.adminApi + dir;
	}

	siteUrl() {
		const base = settings.get('Article_Site_Url').replace(/\/$/, '');
		return `${ base }/ghost`;
	}

	authorUrl(slug) {
		const base = settings.get('Article_Site_Url').replace(/\/$/, '');
		return `${ base }/author/${ slug }`;
	}

	setup() {
		return this.buildAPIUrl('authentication', 'setup');
	}

	session() {
		return this.buildAPIUrl('session');
	}

	rhooks(token) {
		return this.buildAPIUrl('rhooks', token);
	}

	invite() {
		return this.buildAPIUrl('invitesetting');
	}

	createAccount() {
		return this.buildAPIUrl('authentication', 'adduser');
	}

	userExist() {
		return this.buildAPIUrl('userexist');
	}
}
