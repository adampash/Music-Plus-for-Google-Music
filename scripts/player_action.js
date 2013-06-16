function player_action(type) {
	chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'playback_action', 'type' : type},
		function(response) {
			// popup_prep();
		}
	);
	if (type == 'playPause' && $("#playPause").attr('title') == "Play") {
		toggle_play('playing');
	}
	else if (type == 'playPause' && $("#playPause").attr('title') == "Pause") {
		toggle_play('paused');
	}
}

function toggle_play(status) {
	if (status == 'playing') {
		$('#playPause').addClass('goog-flat-button-checked');
		$('#song_indicator').addClass('playing-indicator');
		$('#song_indicator').removeClass('paused-indicator');
		$("#playPause").attr('title', 'Pause');
	}
	else if (status == 'paused') {
		// console.log('paused');
		$('#playPause').removeClass('goog-flat-button-checked');
		$('#song_indicator').addClass('paused-indicator');
		$('#song_indicator').removeClass('playing-indicator');
		$("#playPause").attr('title', 'Play');
	}

}
