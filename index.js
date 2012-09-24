var fs = require('fs')
  , path = require('path');

var cache = {};

var root = process.cwd() + '/lang';

function loadLang(lang) {
	if (lang in cache)
		return cache[lang];
	var contents;
	try {
		contents = fs.readFileSync(path.join(root, lang + '.js'));
	} catch(e) {
		return cache[lang] = null;
	}
	var props = JSON.parse(contents);
	if (props.inherit) {
		var inherited = loadLang(props.inherit);
		for (var key in inherited.strings) {
			if (!(key in props.strings))
				props.strings[key] = inherited.strings[key];
		}
	}
	return cache[lang] = props;
}

exports.version = '0.0.1';

var exports = module.exports = function initRoot(options) {
	root = options || root;
	return exports;
};

var init = exports.init = function init(options) {
	var languages = [];
	if (typeof options == 'string')
		languages.push(options);
	else
		languages = options || languages;
	function getStr(str) {
		for (var i in languages) {
			var lang = loadLang(languages[i]);
			if (!lang || !(str in lang.strings))
				continue;
			return lang.strings[str];
		}
		return str;
	}
	function getProp(prop) {
		for (var i in languages) {
			var lang = loadLang(languages[i]);
			if (!lang || !(prop in lang))
				continue;
			return lang[prop];
		}
	}
	
	var ret = {_: getStr};
	var props = {'language': 'C'};
	for (var prop in props) {
		(function def(prop, fallback) {
			Object.defineProperty(ret, prop, { get: function() {
				return getProp(prop) || fallback;
			}});
		})(prop, props[prop]);
	}
	return ret;
};

exports.middleware = function localizationMiddleware() {
	return function localizationMiddleware(req, res, next) {
		var langstr = (req.headers['accept-language'] || '').toLowerCase();
		var re = /([a-z]{1,8})(-[a-z-]{1,8})?/g;
		var matches;
		var languages = [];
		while ((matches = re.exec(langstr)) != null) {
			languages.push(matches[0]);
			if (matches[2])
				languages.push(matches[1]);
		}
		req.localization = init(languages);
		next();
	};
};
