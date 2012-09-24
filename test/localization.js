var l = require('../')(__dirname.'/lang');

var assert = require('assert');
var connect = require('connect');
var request = require('supertest');

var server = connect();
server.use(l.middleware())
server.use(function (req, res, next) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	var _ = req.localization._;
	var language = req.localization.language;
	res.write(_('Cauliflower') + "\n");
	res.write(_('Good morning') + "\n");
	res.end(language);
});

module.exports = {
	'test nolang': function() {
		var t = l.init('foo');
		assert.equal(t._('Cauliflower'), 'Cauliflower');
		assert.equal(t.language, 'C');
	},
	'test normal': function() {
		var t = l.init('de');
		assert.equal(t._('Cauliflower'), 'Blumenkohl');
		assert.equal(t.language, 'Deutsch');
	},
	'test inherit': function() {
		var t = l.init('de-at');
		assert.equal(t._('Cauliflower'), 'Karfiol');
		assert.equal(t._('Good morning'), 'Guten Morgen');
		assert.equal(t.language, 'Österreichisch');
	},
	'test nofallback': function() {
		var t = l.init(['hu']);
		assert.equal(t._('Cauliflower'), 'Cauliflower');
		assert.equal(t._('Good morning'), 'Jó reggelt');
		assert.equal(t.language, 'Magyar');
	},
	'test fallback': function() {
		var t = l.init(['hu', 'de-at']);
		assert.equal(t._('Cauliflower'), 'Karfiol');
		assert.equal(t._('Good morning'), 'Jó reggelt');
		assert.equal(t.language, 'Magyar');
	},
	'test middleware detect': function(done) {
		request(server)
			.get('/')
			.set('Accept-Language', 'de')
			.expect('Blumenkohl\nGuten Morgen\nDeutsch', done);
	},
	'test middleware detect case': function(done) {
		request(server)
			.get('/')
			.set('Accept-Language', 'DE')
			.expect('Blumenkohl\nGuten Morgen\nDeutsch', done);
	},
	'test middleware specific fallback': function(done) {
		request(server)
			.get('/')
			.set('Accept-Language', 'de-DE')
			.expect('Blumenkohl\nGuten Morgen\nDeutsch', done);
	},
	'test middleware fallback': function(done) {
		request(server)
			.get('/')
			.set('Accept-Language', 'hu;q=1,de-at;q=0.7')
			.expect('Karfiol\nJó reggelt\nMagyar', done);
	},
	'test middleware no header': function(done) {
		request(server)
			.get('/')
			.expect('Cauliflower\nGood morning\nC', done);
	},
	// TODO: plural(), zeroplural(), q= handling?, set language via session
	// TODO: maybe other internationalization support like number, currency and
	// Date formatting? (Timezone handling?)
};
