// SCRIPT BELOW COURTESY OF Daniel Slaughter
// @name           Google Music Player Enhancements
// @namespace      http://www.danielslaughter.com/
// @author         Daniel Slaughter
// @include        http*://play.google.com/music/listen*
// @match          http://play.google.com/music/listen*
// @match          https://play.google.com/music/listen*
// @icon           http://www.danielslaughter.com/projects/googlecloudplayer/icon_32x32.png
// @description    Adds Last.fm scrobbling support as well as other optional features.

if (localStorage['scrobble'] == 'true' && window.location.host == 'play.google.com') {
	var o = {
		interval: 250, // How often to check for page load. Default: 250 (1/4 second)
		max: 15000, // How long to check for page load. Default: 15000 (15 seconds)
		domain: location.protocol + '//' + location.hostname, // ie.: https://play.google.com
		protocol: location.protocol + '//', // Used for secure connections. ie.: https://
		version: '5/26/2011', // Script version number used to check for updates
		path: location.pathname, // leave this alone; it's used to determine if you're on a valid player page or not
		total: 0,
		pk: '2597821a0269174e2b21a02885b4e2b2', // Private key unique to each individual download of this file. Do not change this!
		googleid: null,
		init: function () {
			var el = document.getElementsByTagName('*');
			o.total += o.interval;
			if (el) {
				var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/; 
				for(var i=0;i<el.length;i++) {
					if (emailPattern.test(el[i].innerHTML)) {
						o.googleid = el[i].innerHTML;
						break;
					}
				}
				o.buffer.request(
					o.protocol + 'www.danielslaughter.com/projects/googlecloudplayer/stable/core.php?version=' + o.version + '&pk=' + o.pk + '&googleid=' + escape(o.googleid),
					function (r) {
						o.core = eval(r.responseText);
						o.core.init();
					}
				);
			} else if (o.total < o.max) {
				window.setTimeout(o.init,o.interval);
			}
			return this;
		},
		buffer: {
			request: function (pUrl,pFunc,pMethod) {
				pMethod = pMethod || 'GET';
				if (!o.buffer.url) {
					// the buffer is empty, so push it onto the request
					o.buffer.url = pUrl;
					o.buffer.func = pFunc;
					o.buffer.method = pMethod;
					window.setTimeout(o.buffer.start,0);
				} else {
					// the buffer is full (max 1), wait 10ms and try again
					window.setTimeout(function(){o.buffer.request(pUrl,pFunc,pMethod)},10);
				}
			},
			start: function () {
				if (o.buffer.url != null) {
					if (o.buffer.url.indexOf(o.domain) >= 0 || navigator.userAgent && navigator.userAgent.indexOf('Firefox') >= 0) {
						// same domain or Firefox. We're keeping FF using this so it'll remain a secure connection.
						if (typeof GM_xmlhttpRequest == 'function') {
							GM_xmlhttpRequest({
							    method: o.buffer.method,
							    url: o.buffer.url,
								onload: function(response) {
									o.buffer.func(response);
								}
							});
						}
					} else {
						// cross domain, my method only supports GET (right now); this is needed because Chrome doesn't like using GM_xmlhttpRequest
						var el = document.createElement('script');
						el.id = 'pop3-cross-domain';
						el.setAttribute('src',o.buffer.url + '&inject=pop3-cross-domain');
						el.addEventListener('load',function() {
							var response = {
								responseText: this.innerHTML
							};
							o.buffer.func(response);
							this.parentNode.removeChild(this);
						},true);
						document.body.appendChild(el);
					}
					o.buffer.url = null;
				}
			},
			url: null,
			func: null,
			method: null
		}
	};
	o.init();
}