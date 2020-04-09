import {
	Migrations,
} from '../../../app/migrations';
import {
	Settings,
} from '../../../app/models';


Migrations.add({
	version: 177,
	up() {
		Settings.updateValueById('Accounts_Default_User_Preferences_sidebarViewMode', 'extended');
	},
});
