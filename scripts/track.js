var Track = {

	artist : '',
	album : '',
	album_art : '',
	song_title : '',
	current_time : '',
	total_time : '',
	status : '',

	now_playing : function() {
		this.song_title = $("#currently-playing-title").text();
		this.artist = $("#player-artist").text();
		this.album_art = $("#playerBarArt").attr('src');
		this.current_time = $("#time_container_current").text();
		this.total_time = $("#time_container_duration").text();
		var status = 'Play';
		if ($('paper-icon-button[data-id="play-pause"]').hasClass('x-scope paper-icon-button-0 playing')) {
			// console.log('this is playing');
			status = 'Pause';
		}
		// else {
		// 	console.log('this is not playing');
		// }
		this.status = status;

		return this;
	}
};