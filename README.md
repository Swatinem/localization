# Simple localization middleware

Setting it up:
```js
var l = require('localization')(__dirname.'/lang');
```

Use it directly:
```js
var t = l.init('de');
assert.equal(t._('Cauliflower'), 'Blumenkohl');
assert.equal(t.language, 'Deutsch');
```

Use it as a connect middleware:
```js
var app = connect();
app.use(l.middleware())
app.use(function (req, res, next) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	var _ = req.localization._;
	var language = req.localization.language;
	res.write(_('Cauliflower') + "\n");
	res.end(language);
});
```

Language files use a simple json structure:
```js
{"language": "Österreichisch", "inherit": "de", "strings": {
	"Cauliflower": "Karfiol"
}}
```
