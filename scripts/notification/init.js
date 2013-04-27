localStorage['notification_visible'] = true;
window.setInterval(set_notification, 1000);
if (localStorage['mini_player'] == 'false') {
  setTimeout(close_notification, 4000);
}
set_notification();
var more_time = false;

$(window).unload(function() {
  localStorage['notification_visible'] = false;
});

function close_notification() {
  if (more_time == true) {
    more_time = false;
    setTimeout(close_notification, 3000);
  }
  else {
    localStorage['notification_visible'] = false;
    window.close();
  }
}

function set_more_time() {
  more_time = true;
}

var title_check = '';

function set_notification() {
  // console.log('sending request to tab to set popup info');
  chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'set_popup', 'url' : "none", 'data' : 'arbs'},
    function(response) {
      if (chrome.extension.lastError) {
        chrome.tabs.create({url: "http://play.google.com/music/"});
        console.log('there was an error connecting to the tab');
        window.close();
      }
      else {
        $("#song_title").html(response.song_title);
        $("#artist").html(response.artist);
        if (response.album_art == 'http://default_album_med.png' || response.album_art == 'http://undefined') {
          response.album_art = 'http://play.google.com/music/default_album_med.png';
        }
        $("#album_art_img").attr('src', response.album_art);
        if (response.status == 'Play') {
          toggle_play('paused');
        }
        else if (response.status == 'Pause') {
          toggle_play('playing');
        }
        if (title_check != response.song_title) {
          set_more_time();
        }
        title_check = response.song_title;
        // chrome.browserAction.setIcon({ path: response.album_art }); // Cool in theory, but button a little too small
      }
    }
  );
}

$(function() {
  $('.prev_song')
    .on('click', function() {
      player_action('prevSong');
      set_more_time();
    });

  $('.play_pause')
    .on('click', function() {
      player_action('playPause');
      set_more_time();
    });

  $('.next_song')
    .on('click', function() {
      player_action('nextSong');
      set_more_time();
    });
});