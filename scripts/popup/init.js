    var CONTENT_SCRIPT_TAB_ID = localStorage["tabID"];
    var timeout;
    localStorage['notification_visible'] = true;
    $(window).unload(function() {
      localStorage['notification_visible'] = false;
    });
    window.setInterval(popup_prep, 1000);
    popup_prep();

    function open_g_music() {
      localStorage['notification_visible'] = false;
      chrome.tabs.create({url: "http://play.google.com/music"});
      window.close();
    }

    function popup_prep() {
      // $("#popup").html("Music is playing1");
      // localStorage["tabID"] = 'closed';
      // console.log(localStorage["tabID"]);
      if (localStorage["tabID"] === undefined || localStorage["tabID"] == 'closed') {
        console.log("Open a new tab: " + localStorage["tabID"]);
        $('#artist').html('You need to <a href="#">open a new Google Play Music tab</a>.');
        $('#artist a')
          .on('click', function() {
            open_g_music();
            return false;
          });
        // chrome.tabs.create({url: "http://play.google.com/"});
        // chrome.tabs.onRemoved.addListener(function(integer tabId, object removeInfo)
        // window.close();
      }
      else {
        // console.log('sending request to tab to set popup info');
        chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'set_popup', 'url' : "none", 'data' : 'arbs'},
          function(response) {
            if (chrome.extension.lastError) {
              $('#artist').html('You need to <a href="#">open a new Google Play Music tab</a>.');
              $('#artist a')
                .on('click', function() {
                  open_g_music();
                  return false;
              });
              // chrome.tabs.create({url: "http://play.google.com/"});
              console.log('there was an error connecting to the tab');
              // window.close();
            }
            else {
              // console.log("response is back " + response.song_title);
              // $("#popup").html(response.artist + " - " + response.song_title + " " + response.album_art);
              $("#song_title").html(response.song_title);
              $("#artist").html(response.artist);
              if (response.album_art.split('default_album_med').length > 1 || response.album_art == 'http://undefined') {
                response.album_art = 'http://play.google.com/music/default_album_med.png';
              }
              // console.log('response.status: ' + response.status);
              if (response.status == 'Play') {
                toggle_play('paused');
              }
              else if (response.status == 'Pause') {
                toggle_play('playing');
              }
              $("#album_art_img").attr('src', response.album_art);
              $("#current_time").html(response.current_time);
              $("#total_time").html(response.total_time);
              set_slider(response.current_time, response.total_time);
              // chrome.browserAction.setIcon({ path: response.album_art }); // Cool in theory, but button a little too small
            }
          }
        );
      }
    }

    function set_status(status) {
      console.log('swap play and pause buttons');

    }

    function set_slider(current_time, total_time) {
      var total_width = 223;
      var total_secs = (parseInt(total_time.split(":")[0]) * 60) + parseInt(total_time.split(":")[1]);
      var current_secs = (parseInt(current_time.split(":")[0]) * 60) + parseInt(current_time.split(":")[1]);
      var width = Math.round((current_secs/total_secs) * total_width);
      $('#played_slider').attr('style', 'width:' + (width - 2) + 'px;');
      $('.goog-slider-thumb').attr('style', 'left:' + (width) + 'px;');
      $('.goog-slider-thumb').show();
    }

    function onRequest(request, sender) {
          // if (request.action == 'set_tab_id') {
          //   set_tab_id(request.tabID);
          // }
    };

    // Wire up the listener.
    chrome.extension.onRequest.addListener(onRequest);

    var breadcrumb = [];
    function toggle_navigation() {
      console.log(breadcrumb);
      breadcrumb.pop();
      console.log(breadcrumb);
      if (breadcrumb.length < 1) {
        if ($("#navigate").is(':visible') && $('.tab-text').text() == "My Library") {
          close_nav();
        }
        else {
          $('.tab-text').text("My Library");
          $('#navigate').html('<div class="album_row bold artists" title="artists">Artists</div>' +
          '<div class="album_row bold albums" title="albums">Albums</div>');
          $("#navigate").slideDown();
          $('#close_nav').show();
          prep_nav();
          activate_search();
        }
      }
      else {
        var nav_back = breadcrumb.pop();
        fetch_nav_item(nav_back[0], nav_back[1], nav_back[2], true);
      }
    }

    function close_nav() {
      $('.tab-text').html('<span onclick="player_action(\'currently_playing\')">Now Playing</span>');
      $("#navigate").slideUp();
      $('#close_nav').hide();
      breadcrumb = [];
      $('#search').hide();
    }

    function fetch_nav_item(type, id, display_type, go_back) {
      console.log('time to fetch nav item');
      $('#loadingOverlay').toggle();
      $('.tab-text').text(decodeURIComponent(display_type));
      breadcrumb.push([type, id, display_type]);
      if (id == '') {
        id = -1;
      }
      chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'nav_to', 'type' : type, 'id' : id, 'go_back' : go_back},
        function(response) {
          $('#loadingOverlay').toggle();
          if (chrome.extension.lastError) {
            chrome.tabs.create({url: "http://play.google.com/music/"});
            console.log('there was an error connecting to the tab');
            window.close();
          }
          else if (response.indexOf('"albums":') != -1) {
            activate_search();
            // console.log("response is: " + response);
            var albums = $.parseJSON(response);
            console.log('call back');
            // console.log(albums.albums);
            $('#navigate').html(" ");
            $('#navigate').scrollTop(0);
            $.each(albums.albums, function(index, album) {
              // console.log(album.album.title);
              if (album.album.art.split('default_album_med').length > 1) album.album.art = 'play.google.com/music/default_album_med.png';
              // console.log(album.album.id);
              var row = '<div class="album_row album" data-id="' + escape(album.album.id) + '"><img width="32" height="32" src="http://' + decodeURI(album.album.art) + '" /><b>' + decodeURIComponent(album.album.title) + '</b><br>' + decodeURI(album.album.artist) + '</div>';
              $('#navigate').append(row);
            });
          }
          else if (response.indexOf('"artists":') != -1) {
            // console.log('here now');
            activate_search();
            // console.log(response);
            var artists = $.parseJSON(response);
            $('#navigate').html(" ");
            $('#navigate').scrollTop(0);
            $.each(artists.artists, function(index, artist) {
              if (artist.artist.title == '') {
                return;
              }
              var row = '<div class="album_row artist" data-id="' + decodeURI(artist.artist.id) + '" data-title="' + decodeURI(artist.artist.title) + '"><img width="64" height="32" src="http://' + decodeURI(artist.artist.art) + '" /><b>' + decodeURIComponent(artist.artist.title) + '</b><br></div>';
              $('#navigate').append(row);
            });
          }
          else {
            console.log('no matches');
          }
          prep_nav();
        }
      );
      console.log('new request made');
      $('#search').hide();
    }

    function activate_search() {
      $('#search').show();
      $("#search").select();
    }

    function fetch_album(id) {
      $('#loadingOverlay').toggle();
      activate_search();
      breadcrumb.push(['', id, '']);
      // script_text = script_text.replace(/&quote;/g, "'");
      // console.log(id);
      chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'nav_to', 'id' : id, 'type' : 'albumSelected'},
        function(response) {
          $('#loadingOverlay').toggle();
          if (chrome.extension.lastError) {
            chrome.tabs.create({url: "http://play.google.com/music/"});
            console.log('there was an error connecting to the tab');
            window.close();
          }
          else {
            console.log(response);
            var album = $.parseJSON(response);
            // console.log(album);
            $('#navigate').html(" ");
            $('#navigate').scrollTop(0);
            var album_page = '<div class="big_art" style="position:fixed; margin:10px;">' +
                      '<img src="http:' + decodeURI(album.album.art) + '" height="128" width="128">' +
                    '</div>' +
                    '<div class="track_list">';
            $.each(album.album.tracks, function(index, track) {
              album_page += '<div class="album_row ind_track" id="' + track.track.song_id + '">' + decodeURI(track.track.title) + '</div>';
            });
            album_page += '</div>';
            $('#navigate').append(album_page);
            prep_nav();
            $('.tab-text').text(decodeURI(album.album.title));
          }
        }
      );
    }

    function play_selected_track(obj) {
      console.log('play selected ');
      // console.log($(obj).id);
      var song_id = $(obj).attr('id');
      var script_text = "SJBpost('playSelected')";
      chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'select_and_play', 'script' : script_text, 'song_id' : song_id},
        function(response) {
          console.log('response from calling the play selected track method');
          // popup_prep();
        });
    }

function prep_nav() {
  $('.album_row.artists')
    .on('click', function() {
      fetch_nav_item('artists', '', 'Artists', false);
    });

  $('.album_row.albums')
    .on('click', function() {
      fetch_nav_item('albums', '', 'Albums', false);
    });

  $('.album_row.album')
    .on('click', function() {
      fetch_album($(this).attr('data-id'));
    });

  $('.album_row.artist')
    .on('click', function() {
      fetch_nav_item('artistSelected', $(this).attr('data-id'), $(this).attr('data-title'), false);
    });

  $('.album_row.ind_track')
    .on('click', function() {
      play_selected_track(this);
    });

}

$(function() {
    $('#playPause')
    .on('click', function() {
      player_action('playPause');
    });

    $('#rew')
      .on('click', function() {
        player_action('prevSong');
      });

    $('#ff')
      .on('click', function() {
        player_action('nextSong');
      });

    $('.breadcrumb-part')
      .on('click', function() {
        toggle_navigation();
      });

    $('#close_nav')
      .on('click', function() {
        close_nav();
      });

});