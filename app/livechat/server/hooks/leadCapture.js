import { callbacks } from '../../../callbacks';
import { LivechatVisitors } from '../../../models';
import { settings } from '../../../settings';

function validateMessage(message, room) {
	// skips this callback if the message was edited
	if (message.editedAt) {
		return false;
	}

	// message valid only if it is a livechat room
	if (!(typeof room.t !== 'undefined' && room.t === 'l' && room.v && room.v.token)) {
		return false;
	}

	// if the message hasn't a token, it was NOT sent from the visitor, so ignore it
	if (!message.token) {
		return false;
	}

	// if the message has a type means it is a special message (like the closing comment), so skips
	if (message.t) {
		return false;
	}

	return true;
}

callbacks.add('afterSaveMessage', function(message, room) {
	if (!validateMessage(message, room)) {
		return message;
	}

	const phoneRegexp = new RegExp(settings.get('Livechat_lead_phone_regex'), 'g');
	const msgPhones = message.msg.match(phoneRegexp);

	const emailRegexp = new RegExp(settings.get('Livechat_lead_email_regex'), 'gi');
	const msgEmails = message.msg.match(emailRegexp);

	if (msgEmails || msgPhones) {
		LivechatVisitors.saveGuestEmailPhoneById(room.v._id, msgEmails, msgPhones);

		callbacks.run('livechat.leadCapture', room);
	}

	return message;
}, callbacks.priority.LOW, 'leadCapture');

callbacks.add('beforeSaveMessage', function(message, room) {
	if (settings.get('Livechat_kill_switch')) {
		if (room && room.lastMessage.msg !== settings.get('Livechat_kill_switch_message')) {
			message.msg = settings.get('Livechat_kill_switch_message');
			message.avatar = '';
			message.u._id = room.servedBy._id;
			message.u.username = room.servedBy.username;
		}
	}
}, callbacks.priority.LOW, 'leadCapture');
