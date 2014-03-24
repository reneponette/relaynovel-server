var env = {
	production: {
		env : 'production',
		db: {
			host      : 'mongodb://localhost/relaynovel',
			port      : 3307,
			user			: 'relaynovel',
			password	: '77977797'
		}
	},
	development: {
		env : 'development',
		db: {
			host      : 'mongodb://localhost/relaynovel',
			port      : 3307,
			user			: 'relaynovel',
			password	: '77977797'
		}
	}
};

module.exports = (function() {
	var node_env = process.env.NODE_ENV || 'development';
	console.log('node_env = ' + node_env);
	return env[node_env];
})();