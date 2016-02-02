/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	announce: function(req, res) {
		var socketId = sails.sockets.id(req);
		var session = req.session;

		session.users = session.users || {};

		User.create({
			name: 'Client - ' + socketId,
			socketId: socketId
		}).exec(function(err, user) {
				if (err)
					return res.serverError(err);

				console.log('New Client:', user)
				session.users[socketId] = user;
				User.subscribe(req, user, 'message');
				User.watch(req);

				User.publishCreate(user, req);

				res.json(user);
		});

	}
};
