  var firstRun = (localStorage['firstRun.0.3'] === undefined);
  if (firstRun) {
    // Open the options page if this is the first run
    localStorage['firstRun.0.3'] = 'false';
    localStorage['notification_visible'] = false;
    chrome.tabs.create({url: chrome.extension.getURL("options.html"), selected: true});
  }

  function history_listener() {
    chrome.history.onVisited.addListener(function(result) {
      if (localStorage["last_visit_time"] !== undefined) {
        if (new Date().getTime() - localStorage["last_visit_time"] > 100) {
          // localStorage["most_recent_page"] = '';
            chrome.tabs.executeScript(null,
                                     {code:"check_url()"});
        }
      }
      localStorage["last_visit_time"] = new Date().getTime();
    });
  }

function fetch_url(last_url, callback) {
  // alert('fetch from last fm now');
  var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          data = xhr.responseText;
          callback(data);
        } else {
          callback(null);
        }
      }
    };
    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    var url = last_url;
    xhr.open('GET', url, true);
    xhr.send();
}

function lyric_search(url1, callback) {
  var xhr = new XMLHttpRequest();
  var not_found = '<p id="songLyricsDiv">No lyrics found.</p>';
  xhr.onreadystatechange = function(data) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
      response = xhr.responseText;
      url = response.split('"')[3];
      try {
        lyricsURL = response.split('<div id="search"')[1].split('<a href="')[1].split('"')[0];

      } catch(Exception) { lyricsURL = "";  }
      var xhr2 = new XMLHttpRequest();
      xhr2.onreadystatechange = function(data) {
        if (xhr2.readyState == 4) {
          if (xhr2.status == 200) {
          response = xhr2.responseText;
          //send response back to script
          callback(response);
        }
        } else {

          }
        }
      }
      // Note that any URL fetched here must be matched by a permission in
      // the manifest.json file!
      xhr2.open('GET', lyricsURL, true);
      xhr2.send();

      } else {

    }
  }
  // Note that any URL fetched here must be matched by a permission in
  // the manifest.json file!
  xhr.open('GET', url1, true);
  xhr.send();
}

function createNotificationInstance() {
  if (localStorage['notification_visible'] != 'true') {
    var notification = webkitNotifications.createHTMLNotification('notification.html');
    notification.show();
  }
}

function onRequest(request, sender, callback) {
    if (request.action == 'fetch_url') {
      fetch_url(request.url, callback);
    }
    else if (request.action == 'set_tab_id') {
      chrome.tabs.getSelected(null, function(tab) {
        localStorage["tabID"] = tab.id;
        callback(tab.id);
      });
    }
    else if (request.action == 'player_action') {
      chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'playback_action', 'type' : request.type},
        function(response) {
          // popup_prep();
        }
      );
    }
    else if (request.action == 'create_notification') {
      createNotificationInstance();
      callback();
    }
    else if (request.action == 'return_settings') {
      callback(localStorage);
    }
    else if (request.action == 'lyric_search') {
      lyric_search(request.url1, callback);
    }
}

      // Wire up the listener.
      chrome.extension.onRequest.addListener(onRequest);

$('body').ready(function() {
  history_listener();
});