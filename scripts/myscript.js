var last_fm_logo = chrome.extension.getURL('images/lastfm.gif');
var amazon_logo = chrome.extension.getURL('images/amazon.jpeg');
var notificaiton_html = 'popup.html';

var consoleLog = function(msg){
	// uncomment for "dev mode"
	console.log(msg);
};

// if (localStorage['download'] == 'true' && window.location.host == 'play.google.com') {
//  consoleLog('insert download button');
//  insert_download_button();
// }



function restore_settings() {
	chrome.extension.sendRequest({'action' : 'return_settings'}, function(response) {
		$.each(response, function(key, value) {
			localStorage[key] = value;
		});
	});
}

function check_url() {
	consoleLog('check url');
	restore_settings();
	if (window.location.host == 'play.google.com') {
		consoleLog('setting tab id');
		chrome.extension.sendRequest({'action' : 'set_tab_id'}, function(response) {
			localStorage["tabID"] = response;
			consoleLog('tab id is ' + response);
		});
		if (window.location.hash !== '' && localStorage['bios'] == 'true') {
			var type = parse_hash();
			if (type == 'ar' || type == 'al') {
				prepare_fetch(type);
			}
			else {
				return;
			}
		}
	}
	else if (localStorage['support'] == 'true') {
		$(document).ready(function() {
			// global_shortcuts();
			ama_links();
		});
	}
}

// last.fm api key: a7c555c150c11623a0fced6e11c1f4fe
function prepare_fetch(type) {
	consoleLog('prepare fetch');
	var api_key = 'a7c555c150c11623a0fced6e11c1f4fe';
	var last_url = '';
	var last_url2 = '';
	var artist;
	if (type == 'ar') {
		artist = $('.tab-text a')[0].innerText;
		last_url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + encodeURIComponent(artist) + '&api_key=' + api_key;
	}
	else if (type == 'al') {
		consoleLog('searching album info as well');
		var artist_and_album = ($('.tab-text a')[0].innerText);
		artist = artist_and_album.split(' - ')[0];
		var album = artist_and_album.split(' - ')[1];
		last_url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + encodeURIComponent(artist) + '&api_key=' + api_key;
		last_url2 = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=' + api_key + '&artist=' + encodeURIComponent(artist) + '&album=' + encodeURIComponent(album);
	}
	if (last_url !== '') {
		// alert(last_url);
		chrome.extension.sendRequest({'action' : 'fetch_url', 'url' : last_url}, on_artist_text);
	}
	if (last_url2 !== '') {
		consoleLog('searching album info');
		chrome.extension.sendRequest({'action' : 'fetch_url', 'url' : last_url2}, on_album_text);
	}
}

function on_artist_text(data) {
	// alert(data);
	consoleLog("artist text");
	var xml_doc = $.parseXML(data);
	var $xml = $( xml_doc );
	var container;
	if (parse_hash() == 'al') {
		container = $(".albumViewContainer");
	}
	else if (parse_hash() == 'ar') {
		container = $(".artistViewContainer");
	}
	if ($('#last_fm_info').length === 0) {
		var last_div = '<div id="last_fm_info"></div><div id="hidden_last_fm_info" style="display:none;"></div>';
		if (parse_hash() == 'ar') {
			container.prepend(last_div);
		}
		else {
			if ($('#last_fm_album_info').length == 1) {
				$('#last_fm_album_info').before(last_div);
			}
			else {
				container.append(last_div);
			}
		}
	}
	var img = $xml.find('image[size|="extralarge"]:first').text();
	// var artist_name = $('.albumViewArtistTitle').first().text();
	var artist_name = '<div class="albumViewAlbumTitle songListLink">' + $('.albumViewArtistTitle').first().text() + '</div>';
	var artist_bio = $xml.find("content").text();
	if (artist_bio.length !== 0) {
		artist_bio = strip_links(artist_bio, '#hidden_last_fm_info');
		artist_bio = truncate_bio(artist_bio, 99);
	}
	var similar_artists = $.map($xml.find('similar').find('artist').find('name'), function(a) {
		return a;
	});

	var list = [];
	similar_artists = ($.each(similar_artists, function(key, element) {
		list.push('<a class="songListLink" href="#' + encodeURI(element.textContent) + '_ar" onclick="SJBpost(\'artistSelected\', this, \'' + element.textContent + '\');">' + element.textContent + '</a>');
	}));
	// alert(list.join(', '));

	img = '<div class="artistViewAlbumInfoContainer" style="float:left;"><img src="' + img + '" width="128" class="albumImage" style="margin-right: 4px; margin-bottom: 5px; float:left;"/>' + artist_name + '</div>';
	$('#last_fm_info').html(img + '<div class="bio_text">' + nl2br(artist_bio) + '<br /><br />' +
		'<div id="similar_last_fm_artists"><b>Similar artists:</b> ' + list.join(', ') + '<div class="ext_src">Artist bio from<br /> <a href="http://last.fm" target="_blank"><img src="' + last_fm_logo + '" /></a></div></div>' +
		'<br clear="all" />');
	$("#last_fm_info > div > span.more_bio").click(function() {
		show_all_bio('artist');
	});
	if ($('.artistViewTable > tbody').children().length === 0) {
		$('.artistViewTable').html('You don\'t currently have any music by this artist.<div class="at_amazon">' + $('.tab-text > a').text() + ' MP3s available at <img src="' + amazon_logo + '" height="22px" style="margin-bottom:-9px; margin-left:-1px;" /></div><div id="amazon_links"></div>');
		consoleLog("Search Amazon");
		search_amazon($('.tab-text > a').text());
	}
}

function search_amazon(artist) {
	var url = 'http://free.apisigning.com/onca/xml?Service=AWSECommerceService&Version=2010-11-01&Operation=ItemSearch&SearchIndex=MP3Downloads&Keywords=' + encodeURIComponent(artist) + '&ResponseGroup=ItemAttributes,Images,Tracks&AWSAccessKeyId=0YNM9NQ21B7TCP1XDH82';
	// http://free.apisigning.com/onca/xml?Service=AWSECommerceService&Version=2010-11-01&Operation=ItemSearch&SearchIndex=MP3Downloads&Keywords=' + encodeURIComponent(artist) + '&AWSAccessKeyId=0YNM9NQ21B7TCP1XDH82';
	consoleLog(url);
	chrome.extension.sendRequest({'action' : 'fetch_url', 'url' : url}, on_amazon);
}

function on_amazon(data) {
	// alert(data);
	consoleLog("amazon response is here");
	// consoleLog(data);
	var amazon_links = '';
	$(data).find('item').each(function(){
		var id = $(this).find('ASIN').text();
		var title = $(this).find('ItemAttributes > Title').text();
		if (title.length > 45) {
			title = title.substr(0, 45) + "...";
		}
		var artist = $(this).find('ItemAttributes > Creator').text();
		var url = $(this).find('DetailPageURL').text();
		var img = $(this).find('MediumImage > URL').text();
		var type = $(this).find('ItemAttributes > ProductTypeName').text();
		type = type.split('_')[2];
		amazon_links = amazon_links + '<div class="amazon_alb album-container"><a href="' + url + '?tag=adapas02-20" target="_blank" class="fade-out-parent"><img src="' + img + '" height="124" width="124" class="albumImage" style="margin-bottom:-14px;" onmouseover="SJBpost(\'albumArtEnter\', this); onmouseout="SJBpost(\'albumArtLeave\', this);"" /><br /><span class="amazon_text browseAlbumTitle fade-out-content">' + title + '<br /></span><div class="fade-out-effect"></div><span class="browseSubtext" style="float:left;">[' + type + ']</span></div>';
	});
	$('#amazon_links').html(amazon_links);

}

function on_album_text(data) {
	consoleLog('album back');
	var xml_doc = $.parseXML(data);
	var $xml = $( xml_doc );
	var container;
	container = $(".albumViewContainer");
	if ($('#last_fm_album_info').length === 0) {
		container.append('<div id="last_fm_album_info"></div><div id="hidden_last_fm_album_info" style="display:none;"></div>');
	}
	var album_info = $xml.find("content").text();
	if (album_info.length !== 0) {
		album_info = strip_links(album_info, '#hidden_last_fm_album_info');
		$('#last_fm_album_info').html('<b style="float:left;">About this album:<br /></b><div style="margin-left:185px;">' + nl2br(truncate_bio(album_info, 80)) + '<br /><div class="ext_src">Album info from<br /> <a href="http://last.fm" target="_blank"><img src="' + last_fm_logo + '" /></a></div>');

		$("#last_fm_album_info > div > span.more_bio").click(function() {
			show_all_bio('album');
		});
	}
}

function strip_links(text, div) {
	$(div).html(text);
	$(div + ' a').each(function() {
		$(this).before($(this).text()).remove();
	});
	text = $(div).html();
	$(div).html(" ");
	var user_cont_text = "User-contributed text is available under the Creative Commons By-SA License and may also be available under the GNU FDL.";
	if (text.indexOf(user_cont_text) != -1) {
		text = text.split(user_cont_text)[0] + '<span class="small_cc">' + user_cont_text + text.split(user_cont_text)[1] + '</span>';
	}
	return text;
}

function truncate_bio(text, words) {
	var first_snippet = text.split(" ").slice(0, words).join(' ') + '<span class="more_bio">... <span style="cursor:pointer; font-weight:bold;">More &raquo;</span></span>';
	var remaining = '<span class="remaining_bio" style="display:none;">' + text.split(" ").slice(words).join(' ') + '</span>';
	return first_snippet + remaining;
}

function show_all_bio(type) {
	if (type == 'artist') {
		$("#last_fm_info > div > span.remaining_bio").slideToggle();
		$("#last_fm_info > div > span.more_bio").html(" ");
	}
	else if (type == 'album') {
		$("#last_fm_album_info > div > span.remaining_bio").slideToggle();
		$("#last_fm_album_info > div > span.more_bio").html(" ");
	}
}

function parse_hash() {
	return window.location.hash.split('_')[window.location.hash.split('_').length - 1];
}

function nl2br (str, is_xhtml) {
	var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}


function scrobble() {
	var ts = Math.round((new Date()).getTime() / 1000);
}

function set_popup(data, callback) {
	Track.now_playing();
	consoleLog(Track.status);
	callback({'song_title': Track.song_title, 'artist' : Track.artist, 'album_art' : Track.album_art, 'current_time' : Track.current_time, 'total_time' : Track.total_time, 'status' : Track.status});
}


var last_nav_request;
var last_callback;
function nav_to(request, callback) {
	if (typeof(request) == 'undefined') {
		request = last_nav_request;
		callback = last_callback;
	}
	var type = request.type;
	var id = decodeURI(unescape(request.id));
	consoleLog(type);
	consoleLog(id);
	// consoleLog(script_text);
	// append_script(script_text);
	// consoleLog(script);
	var element = null;
	if (request.go_back) {
		consoleLog('this is a history request');
		history.back();
	}
	else {
		if (id != -1) {
			consoleLog('get element by id');
			if (type == 'artistSelected') {
				element = $('[data-id="' + id + '"] .details .title')[0];
			}
			else {
				element = $('[data-id="' + id + '"]')[0];
			}
			// element = document.getElementById(id);
		}
		else if (type == 'artists' || type == 'albums') {
			console.log('arsits or albums');
			element = $('#browse-tabs div[data-type="' + type + '"]')[0];
		}
		else {
			consoleLog('get element by type');
			element = document.getElementById(type);
		}
		if (type == 'albumSelected') {
			element = $('[data-id="' + id + '"] .title')[0];
		}
		dispatchMouseEvent(element, 'click', true, true);
	}
	consoleLog(element);
	consoleLog("navigate to " + type);
	if (type == 'albums') {
		var albums = '{"albums": [';
		if ($('#main .card').length === 0) {
			consoleLog('no albums available');
			last_nav_request = request;
			last_callback = callback;
			setTimeout(function(request, callback) {
				nav_to(last_nav_request, last_callback);
			}, 1000);
			return false;
		}
		$('#main .card').each(function(index, element) {
			var title = $(element).find('.details .title').text();
			var artist = $(element).find('.sub-title').text();
			var art = $(element).find('.image-inner-wrapper img').attr('src');
			var id = $(element).attr('data-id');
			if (title === '') {
				return;
			}
			albums += '{"album":{"title" : "' + encodeURI(title) + '", "artist" : "' + encodeURI(artist) + '", "art" : "' + encodeURI(art) + '", "id" : "' + encodeURI(id) + '"}},';
		});
		albums = albums.slice(0, albums.length - 1);
		albums += ']}';
		callback(albums);
	}
	else if (type == 'albumSelected') {
		consoleLog('you just clicked a specific album');
		var album = $('.breadcrumbs span:first').text();
		var artist = $('.breadcrumbs span:last').text();
		var art = $('.cover .card img.image').attr('src');
		// consoleLog(art);
		album = '{"album": {' +
						'"title" : "' + encodeURI(album) + '",' +
						'"artist" : "' + encodeURI(artist) + '",' +
						'"art" : "' + encodeURI(art) + '",' +
						'"tracks": [';
		$('#main .song-row').each(function(index, element) {
			var title = $(element).find('td[data-col="title"] .content').text();
			var time = $(element).find('td[data-col="duration"]').text();
			var song_id = $(element).attr('data-id');
			album += '{"track":{"title" : "' + encodeURI(title) + '", "time" : "' + time + '", "song_id" : "' + song_id + '"}},';
		});
		album = album.slice(0, album.length - 1);
		album += ']}}';
		callback(album);
	}
	else if (type == 'artists') {
		consoleLog('artists selected');
		var artists = '{"artists": [';
		if ($('#main .card').length === 0) {
			consoleLog('no artists available');
			last_nav_request = request;
			last_callback = callback;
			setTimeout(function(request, callback) {
				nav_to(last_nav_request, last_callback);
			}, 1000);
			return false;
		}
		$('#main .card').each(function(index,element) {
			var artist = $(element).find(".details .title").text();
			var art = $(element).find('.image-inner-wrapper img').attr('src');
			console.log("ART", art);
			var id = $(element).attr('data-id');
			artists += '{"artist":{"title" : "' + encodeURIComponent(artist) + '", "art" : "' + encodeURI(art) + '", "id" : "' + encodeURI(id) + '"}},';
		});
		artists = artists.slice(0, artists.length - 1);
		artists += ']}';
		callback(artists);
	}
	else if (type == "artistSelected") {
		consoleLog('artist selected');
		var artist = $('#breadcrumbs span.tab-text:first').text();
		var albums = '{"albums": [';
		$('.card').each(function(index, element) {
			var title = $(element).find('.details .title').text();
			var art = $(element).find('.image-inner-wrapper img').attr('src');
			var id = $(element).attr('data-id'); //$(element).find('.albumViewAlbumTitle'); // need to figure this out; these don't have ids
			console.log(id);
			// $(element).attr('id', id);
			if (title === '') {
				return;
			}
			albums += '{"album":{"title" : "' + encodeURI(title) + '", "artist" : "' + encodeURI(artist) + '", "art" : "' + encodeURI(art) + '", "id" : "' + encodeURI(id) + '"}},';
		});
		albums = albums.slice(0, albums.length - 1);
		albums += ']}';
		callback(albums);

	}
	last_nav_request = request;
	last_callback = callback;
}


function playback_action(type, callback) {
	if (type == 'playPause') {
		element = document.getElementById('playPause');
	}
	else if (type == 'nextSong') {
		element = document.getElementById('ff');
	}
	else if (type == 'prevSong') {
		element = document.getElementById('rew');
	}
	else if (type == 'currently_playing') {
		element = document.getElementById('playerSongInfo').childNodes[0];
	}
	if ($(element).hasClass('goog-flat-button-disabled')) {
		element = document.getElementById('start_shuffle_all');
		dispatchMouseEvent(element, 'click', true, true);
	}
	else {
		dispatchMouseEvent(element, 'mouseover', true, true);
		dispatchMouseEvent(element, 'mousedown', true, true);
		dispatchMouseEvent(element, 'mouseup', true, true);
	}
	callback();
}

function onRequest(request, sender, callback) {
    if (request.action == 'set_popup') {
			set_popup(request, callback);
    }
		else if (request.action == 'playback_action') {
			consoleLog('playback action');
			playback_action(request.type, callback);
		}
		else if (request.action == 'nav_to') {
			console.log('NAV TO REQUEST');
			nav_to(request, callback);
		}
		else if (request.action == 'select_and_play') {
			consoleLog('handle select and play request');
			var element = $('tr[data-id="' + request.song_id + '"] .content')[0];
			// console.log(request.song_id, element)
			dispatchMouseEvent(element, 'click', true, true);
			dispatchMouseEvent(element, 'dblclick', true, true);
			callback();
		}
		else if (request.action == 'scrub') {
			var element = document.getElementById('slider');
			var offset_top = element.offsetTop;
			var offset_left = element.offsetLeft;
		}
		else if (request.action == 'restore_settings') {
			consoleLog('changing settings');
			restore_settings();
			callback('calling back');
		}
	}
// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);


// add amazon affiliate links to URLs
function ama_links() {
	consoleLog('ama links');
	var allLinks = document.getElementsByTagName("a");
	var asin = '';
	for (i = 0; i < allLinks.length; i++) {
		var href = allLinks[i].href;
		if (href.match(/amazon\./i) && !href.match(/tag/i) && !href.match(/nosim/i)) {
			asin = getASIN(href);
			if (asin !== null) {
				domain = getDomain(href);
				var associate_id = associateID;
				if ( domain.match(/amazon\./i) ) {
					if (domain.indexOf('co.uk') != -1) {
						associate_id = ukAssociateID;
					}
					allLinks[i].setAttribute("href", "http://" + domain + "/o/ASIN/" + asin + "?tag="+associate_id);
				}
			}
		}
	}
}

var associateID = 'adapas02-20';
var ukAssociateID = 'adapas-21';

function getASIN(href) {
	var asinMatch;
	asinMatch = href.match(/\/exec\/obidos\/ASIN\/(\w{10})/i);
	if (!asinMatch) { asinMatch = href.match(/\/gp\/product\/(\w{10})/i); }
	if (!asinMatch) { asinMatch = href.match(/\/exec\/obidos\/tg\/detail\/\-\/(\w{10})/i); }
	if (!asinMatch) { asinMatch = href.match(/\/dp\/(\w{10})/i); }
	if (!asinMatch) { return null; }
	return asinMatch[1];
}

function getDomain(href) {
	var d = '';
	if (href.substring(0,11)=='http://www.') {
		d = href.replace('http://www.', '');
	} else {
		if ((href.substring(0,7)=='http://'))
			d = href.replace('http://', '');
	}
	d = d.substring(0, d.indexOf('/'));

	return d;
}

var dispatchMouseEvent = function(target, var_args) {
  var e = document.createEvent("MouseEvents");
  // If you need clientX, clientY, etc., you can call
  // initMouseEvent instead of initEvent
  e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
  target.dispatchEvent(e);
};

// (function() {
//     var script = document.createElement("script");
//     script.src = "http://code.jquery.com/jquery-1.6.1.min.js";
//     document.body.appendChild( script );
// })()

(function() {
$("#playerSongInfo").contentChange(function() {
	if (localStorage['notifications'] == 'true') {
		chrome.extension.sendRequest({'action' : 'create_notification'}, function(response) {
			consoleLog(response);
			// consoleLog('tab id is set to: ' + localStorage["tabID"]);
		});
	}
});
})();

function call_notification() {
	if (localStorage['notifications'] == 'true') {
		consoleLog('show a notification');
		chrome.extension.sendRequest({'action' : 'create_notification'}, function(response) {
			consoleLog(response);
			// consoleLog('tab id is set to: ' + localStorage["tabID"]);
		});
	}
}




// DOWNLOAD SCRIPT BELOW COURTESY OF Chris Hendry
// @name           Google Music Downloader
// @version			0.9.0
// @namespace      http://www.radicalpi.net/
// @author		   Chris Hendry
// @description    Allows you to download your music from Google Music Beta

function insert_download_button() {
	document.getElementById('coloredBar').innerHTML += "<div id='downloadSongHolder' style='position:fixed; bottom:12px; right:254px; display:none; cursor:pointer;'>	<img id='downloadSong' src='http://radicalpi.net/upload/gMusic/download.png'>	</div>";
	document.getElementById('downloadSong').addEventListener("click", download, false);
	setTimeout(toggleDisplay,1000);

}

function download() {

	var id = document.getElementById('song_indicator').parentNode.parentNode.parentNode.id;
	if(id === "") id = document.getElementById('song_indicator').parentNode.parentNode.id;
	id = id.split("_")[1];
	var url = 'http://t.doc-0-0-sj.sj.googleusercontent.com/download?id=351aa6be1b30b901&itag=25&source=skyjam&tid='+id+'&pt=e';
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
			response = xhr.responseText;
			url = response.split('"')[3];
			window.open(url,'Download');
        } else {
          callback(null);
        }
      }
    };
    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    xhr.open('GET', url, true);
    xhr.send();
}

function toggleDisplay() {

document.getElementById('downloadSongHolder').style.display = document.getElementById('thumbsUpPlayer').style.display;

setTimeout(toggleDisplay,1000);
}


