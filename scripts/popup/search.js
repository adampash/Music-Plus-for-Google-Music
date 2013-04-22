    $("#search").change( function () {
        var filter = $(this).val();
        if(filter) {
      console.log(filter);
          // this finds all links in a list that contain the input,
          // and hide the ones not containing the input while showing the ones that do
          $("#navigate").find(".album_row:not(:Contains(" + filter + "))").hide();
          $("#navigate").find(".album_row:Contains(" + filter + ")").show();
        } else {
          $("#navigate").find(".album_row").show();
        }
        return false;
      });
    $("#search").keyup(function(e) {
        // fire the above change event after every letter
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
      console.log($(".album_row.ind_track"));
      if ($(".album_row.ind_track").length == 0) {
        $(".album_row:visible").first().click();
      }
      else {
        $(".album_row:visible").first().dblclick();
      }
      e.preventDefault();
    }
    else {
      $(this).change();
    }
    });
  $("#search").submit(function() {
    console.log('you submitted');
  });

    // custom css expression for a case-insensitive contains()
    jQuery.expr[':'].Contains = function(a,i,m){
        return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
    };

// $("#popup").html("Music is playing");
// $("#slider").click(function(e){
//  console.log('scrub');
//  var x = e.pageX - this.offsetLeft - 173;
//  var y = e.pageY - this.offsetTop;
//
//     console.log('pixels from left: ' + x);
//  var total = 224;
//  var percentage = (x/total);
//  console.log('move to the percentage of :' + (x/total) * 100 + 'percent');
//  chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'scrub', 'percentage' : percentage},
//    function(response) {
//      $('#loadingOverlay').toggle();
//      if (chrome.extension.lastError) {
//        chrome.tabs.create({url: "http://play.google.com/"});
//        console.log('there was an error connecting to the tab');
//        window.close();
//      }
//
//    });