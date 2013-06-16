
// @name			Google Music Lyrics
// @version			0.9.3
// @namespace		        http://www.radicalpi.net/
// @author			Chris Hendry
// @include			http*://play.google.com/music/listen*
// @match			http://play.google.com/music/listen*
// @match			https://play.google.com/music/listen*
// @icon			http://radicalpi.net/upload/gMusic/gMusic.png
// @description		        Adds a lyrics panel that automatically fetches lyrics in                              Google Music.
// ==/UserScript==

var version = "0.9.3";
var lyricsURL = " ";
var songTitle = "";
var songArtist = "";
var reload = false;
var winWidth = 0;
var winHeight = 0;


i = 0;
data = "";
while(i<0) {
	data+="<song>\n";
	data+="<id>"+localStorage.key(i)+"</id>\n";
	data+="<lyrics>"+localStorage.getItem(localStorage.key(i))+"</lyrics>\n";
	data+="</song>\n";
	i++;
}
//window.location = "data:ocet-stream;charset=utf-8,"+data;
download = "data:x-application/external;charset=utf-8,"+data;

function fetchNowPlaying() {

	playerDiv = document.getElementById('playerSongInfo').innerHTML;

	var newSongTitle = "";
	var newSongArtist = "";

	if(playerDiv != null && playerDiv.length > 0)
	{

	if(document.getElementById('lyrics').style.visibility == "visible") {
		document.getElementById('editLyrics').style.visibility = "visible";
		document.getElementById('reloadLyrics').style.visibility = "visible";
	}


	newSongTitle = $("#playerSongTitle").text();
	newSongArtist = $("#player-artist").text();
	var artists = newSongArtist.split("/");
	if(artists[0].indexOf("Various Artists") != -1) {artists[0] = artists[1];}
		newSongArtist = artists[0];

	}

	if((songTitle != newSongTitle || songArtist != newSongArtist) || reload) {
		songTitle = newSongTitle;
		songArtist = newSongArtist;

		localLyrics = localStorage.getItem(escape(songArtist+'|'+songTitle));


		if(localLyrics === null || localLyrics.length < 1 || reload) {
			reload = false;
			document.getElementById('lyrics').innerHTML = "<div id='lyricsLoader' style='text-align:center;'><img src='http://play.google.com/music/Spinner_48.gif' style='vertical-align:middle;'></div>";
			document.getElementById('lyricsLoader').style.height = (window.innerHeight-237)+'px';
			document.getElementById('lyricsLoader').style.lineHeight = (window.innerHeight-237)+'px';

			var url1 = 'http://www.google.com/search?q='+escape(songTitle+' '+songArtist+' site:songlyrics.com');
			chrome.extension.sendRequest({'action' : 'lyric_search', 'url1': url1}, function(response) {
				try {
					var lyrics = response.split('<p id="songLyricsDiv"')[1].split('">')[1].split("</p>")[0];
					if(lyrics === '' || lyrics === null) { lyrics = "<p>Sorry, we cannot find the lyrics for this song.</p>"; }
					document.getElementById('lyrics').innerHTML = lyrics;
					localStorage.setItem(escape(songArtist+'|'+songTitle),lyrics);
				}
				catch(Exception) {
					document.getElementById('lyrics').innerHTML = "";
				}
				window.setTimeout(fetchNowPlaying,500);
			});

		}
		else {
			document.getElementById('lyrics').innerHTML = localLyrics; window.setTimeout(fetchNowPlaying,500);
		}
	}
	else { window.setTimeout(fetchNowPlaying,500); }
}

function resizeWindow() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

less = 523;
if(document.getElementById('lyrics').style.visibility == "hidden") less -= 299;

document.getElementById('main').style.width = (winWidth-less)+'px';
document.getElementById('lyrics').style.height = (winHeight-269)+'px';
// document.getElementById('breadcrumbs').style.width = (winWidth-less)+'px';
// document.getElementById('songs_songHeaders').style.width = (winWidth-less)+'px';

BG = document.getElementById('modalBG').style;
BG.width = winWidth+'px';
BG.height = winHeight+'px';

settingsWin = document.getElementById('settings').style;
settingsWin.top = ((winHeight-parseInt(settingsWin.height))/2)+'px';
settingsWin.left = ((winWidth-parseInt(settingsWin.width))/2)+'px';

lyricsWin = document.getElementById('lyricsEditor').style;
lyricsWinContent = document.getElementById('lyricsEditorContent').style;

lyricsWinContent.height = '400px';
lyricsWinContent.width = '275px';
lyricsWin.top = ((winHeight-parseInt(lyricsWinContent.height)-122)/2)+'px';
lyricsWin.left = ((winWidth-parseInt(lyricsWinContent.width)-52)/2)+'px';

}

function toggleLyrics() {
	var status = document.getElementById('lyrics').style.visibility;

	if(status != "hidden") {
		document.getElementById('lyrics').style.visibility = "hidden";
		document.getElementById('lyricsToolbar').style.visibility = "hidden";
		document.getElementById('editLyrics').style.visibility = "hidden";
		document.getElementById('reloadLyrics').style.visibility = "hidden";
    // document.getElementById('lyricsTab').style.width = '55px';
		document.getElementById('main').style.width = (window.innerWidth-225)+'px';
		// document.getElementById('songs_songHeaders').style.width = (window.innerWidth-225)+'px';
		// document.getElementById('breadcrumbs').style.width = (window.innerWidth-221)+'px';
		localStorage['display_music_plus_lyrics'] = "false";
	} else {
		document.getElementById('lyrics').style.visibility = "visible";
		document.getElementById('lyricsToolbar').style.visibility = "visible";
		document.getElementById('editLyrics').style.visibility = "visible";
		document.getElementById('reloadLyrics').style.visibility = "visible";
    // document.getElementById('lyricsTab').style.width = '295px';
		document.getElementById('main').style.width = (window.innerWidth-523)+'px';
		// document.getElementById('songs_songHeaders').style.width = (window.innerWidth-523)+'px';
		// document.getElementById('breadcrumbs').style.width = (window.innerWidth-523)+'px';
		localStorage['display_music_plus_lyrics'] = "true";
	}
	$(window).resize();
}

function reloadLyrics() {

	localStorage.setItem(escape(songArtist+'|'+songTitle),null);
	reload = true;
	fetchNowPlaying();
}

function editLyrics() {

loadedLyrics = document.getElementById('lyrics').innerHTML;
textLyrics = loadedLyrics.replace(/(\r\n|\n|\r)/gm,"");
textLyrics = textLyrics.replace(/<br>/gi,'\n');


document.getElementById('textLyrics').value = textLyrics;
document.getElementById('lyricsEditor').style.visibility = "visible";
document.getElementById('modalBG').style.visibility = "visible";
}


function saveLyrics() {

textLyrics = document.getElementById('textLyrics').value;
loadedLyrics = textLyrics.replace(/\n/g,'<br>');
localStorage.setItem(escape(songArtist+'|'+songTitle),loadedLyrics);
document.getElementById('lyricsEditor').style.visibility = "hidden";
document.getElementById('modalBG').style.visibility = "hidden";
document.getElementById('lyrics').innerHTML = loadedLyrics;

document.getElementById('editLyrics').src = "http://radicalpi.net/upload/gMusic/edit.png";
document.getElementById('editLyrics').removeEventListener ("click", saveLyrics, true);
document.getElementById('editLyrics').addEventListener ("click", editLyrics, true);

}

function closeLyrics() {
document.getElementById('lyricsEditor').style.visibility = "hidden";
document.getElementById('modalBG').style.visibility = "hidden";
}

function editSettings() {
document.getElementById('settings').style.visibility = "visible";
document.getElementById('modalBG').style.visibility = "visible";
}

function closeSettings() {
document.getElementById('settings').style.visibility = "hidden";
document.getElementById('modalBG').style.visibility = "hidden";
}


if (localStorage['lyrics'] == 'true' && window.location.host == 'play.google.com') {
	$(document).ready(function(e) {
		$('#action_bar_container').append('<button class="button small" data-id="lyrics-toggle" id="lyrics_toggle_button">Lyrics</button>');
		// $('#action_bar_container').append('<li><a><span class="nav-option" id="lyrics_toggle_button">Lyrics</span></a></li>');
		$('#main').append('<div id="coloredBar222"></div>');
		document.getElementById('coloredBar222').innerHTML += "<div id='lyricsToolbar' style=\"z-index:2; position:fixed; top:157px; right:17px; width:278px; height:22px; padding:0px; \"></div>";
		document.getElementById('lyricsToolbar').innerHTML += "<img id='reloadLyrics' style='position:relative; top:2px; left:2px; width:18px; height:18px; visibility:hidden;' src='http://radicalpi.net/upload/gMusic/refresh.png'>";
		document.getElementById('lyricsToolbar').innerHTML += "<img id='editLyrics' style='position:relative; top:2px; left:8px; width:18px; height:18px; visibility:hidden;' src='http://radicalpi.net/upload/gMusic/edit.png'>";
		document.getElementById('lyricsToolbar').innerHTML += "<img id='editSettings' style='position:relative; top:2px; left:220px; width:18px; height:18px;' src='http://radicalpi.net/upload/gMusic/gear.png'>";


		document.getElementById('coloredBar222').innerHTML += "<div id='lyrics' style=\"z-index:1; visibility:visible; position:absolute; top:5px; right:0px; padding:10px; padding-top:24px; width:275px; overflow-x:auto; overflow-y:scroll; background-color:#ffffff; line-height:16px; font-height:12px; text-align:center;\"><i style=\"color: #aaa\">Lyrics will display when a song is playing.</i></div>";

		document.getElementById('coloredBar222').innerHTML += "<div id='modalBG' class='modal-dialog-bg' style='opacity:0.5; visibility:hidden;'></div>";

		document.getElementById('coloredBar222').innerHTML += "\
		<div id='lyricsEditor' class='modal-dialog' style='visibility:hidden; height:600px;'>\
			<div class='modal-dialog-title'><span id='lyricsEditorTitle' class='modal-dialog-title-text'>Lyrics Editor</span></div>\
			<div id='lyricsEditorContent' class='modal-dialog-content'>\
				<textarea id='textLyrics' style='resize:none; height:100%; width:100%; text-align:center; font:14px sans;'></textarea>\
			</div>\
			<div class='modal-dialog-buttons'><button id='cancelLyrics'>Cancel</button><button id='saveLyrics'>Save</button></div>\
		</div>";

		document.getElementById('coloredBar222').innerHTML += "\
		<div id='settings' class='modal-dialog' style='visibility:hidden; height:300px; width:600px;'>\
			<div class='modal-dialog-title'>\
				<span class='modal-dialog-title-text'>Lyrics Settings</span>\
			</div>\
			<div class='modal-dialog-content'>\
				Google Play Music Lyrics v"+version+"\
				<br><a href='"+download+"'></a>\
				</div>\
			<div class='modal-dialog-buttons'>\
				<button id='cancel'>Cancel</button>\
				<button id='ok'>Save</button>\
			</div>\
		</div>";

				//Settings:\
				//<div class='settings-dialog-subtext'><input type='checkbox'>Cache Lyrics</div>\
				//<br>Lyric Sources:\
				//<div class='settings-dialog-subtext'><input type='checkbox'>Lyrics.com <input type='checkbox'>Other</div>\



    // document.getElementById('coloredBar222').innerHTML += "<div id='lyricsTab' class='nav-tab' style='z-index:10; position:absolute; top:175px; right:0px; width:295px;'><span id='lyricsTabText' class='tab-text'>LYRICS</span></div>";
    // document.getElementById('lyricsTabText').addEventListener ("click", toggleLyrics, true);
		document.getElementById('lyrics_toggle_button').addEventListener ("click", toggleLyrics, true);
		document.getElementById('reloadLyrics').addEventListener ("click", reloadLyrics, true);
		document.getElementById('editLyrics').addEventListener ("click", editLyrics, true);
		document.getElementById('editSettings').addEventListener ("click", editSettings, true);

		document.getElementById('saveLyrics').addEventListener ("click", saveLyrics, true);
		document.getElementById('cancelLyrics').addEventListener ("click", closeLyrics, true);


		document.getElementById('cancel').addEventListener ("click", closeSettings, true);

    if (localStorage['display_music_plus_lyrics'] == "false" || localStorage['display_music_plus_lyrics'] === undefined) {
      toggleLyrics();
    }
		fetchNowPlaying();
		resizeWindow();
		$(window).resize(resizeWindow);
		$(window).ready(function() {
			winWidth = $(document).width();
			winHeight = $(document).height();
		})

	});
}