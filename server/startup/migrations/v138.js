RocketChat.Migrations.add({
	version: 138,
	up() {
		RocketChat.models.Users.update({}, {
			$set: {
				publicUsername: true,
			},
		}, {
			multi:true,
		});
	},
});
