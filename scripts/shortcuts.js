if (localStorage['shortcuts'] == 'true') {
	keyboard_shortcuts();
}

function keyboard_shortcuts() {
	if (localStorage['shortcuts'] == 'true') {
		$(document).bind('keydown', 'ctrl+shift+right', function(e) {
			console.log('you pressed ctrl+shift+right');
			var type = 'nextSong';
			chrome.extension.sendRequest({'action' : 'player_action', 'type' : type}, function(response) {
				console.log(response);
				// console.log('tab id is set to: ' + localStorage["tabID"]);
			});
			call_notification();
			return false;
		});
		$(document).bind('keydown', 'ctrl+shift+left', function(e) {
			console.log('you pressed ctrl+shift+left');
			var type = 'prevSong';
			chrome.extension.sendRequest({'action' : 'player_action', 'type' : type}, function(response) {
				console.log(response);
				// console.log('tab id is set to: ' + localStorage["tabID"]);
			});
			call_notification();
			return false;
	    });
		$(document).bind('keydown', 'ctrl+shift+p', function(e) {
			console.log('you pressed ctrl+shift+p');
			var type = 'playPause';
			chrome.extension.sendRequest({'action' : 'player_action', 'type' : type}, function(response) {
				console.log(response);
				// console.log('tab id is set to: ' + localStorage["tabID"]);
			});
			call_notification();
			return false;
	    });
	}
}
