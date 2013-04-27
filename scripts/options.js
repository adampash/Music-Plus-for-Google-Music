// Saves options to localStorage.
    function save_options() {
      var select = document.getElementById("color");
      var color = select.children[select.selectedIndex].value;
      localStorage["favorite_color"] = color;

      // Update status to let user know options were saved.

      setTimeout(function() {
        status.innerHTML = "";
      }, 750);
    }

    // Restores select box state to saved value from localStorage.
    function restore_options() {
      $('input:checkbox').click(function() {
        localStorage[this.id] = this.checked;
        chrome.tabs.sendRequest(parseInt(localStorage["tabID"]), {'action' : 'restore_settings'}, function(response) {

        });
        show_success();
        if (this.id == 'notifications') {
          $('#mini_player').attr('disabled', !this.checked);
          $('#mini_player').parents('blockquote').toggleClass('disabled');
        }
      });
      $('input:checkbox').each(function(index) {
        if (localStorage[this.id] === undefined && this.id != 'support' && this.id != 'mini_player') {
          // console.log('first run, setting to true');
          localStorage[this.id] = 'false';
        }
        if (localStorage[this.id] == 'true') {
          this.checked = true;

        }
        else {
          this.checked = false;
        }
      });

    }

    function show_success() {
      $("#notification").text("Option saved. You may have to refresh your Google Play Music tab before the change takes effect.").show();
    }

    $(function() {
      restore_options();
      $('#mini_player').attr('disabled', !$('#notifications')[0].checked);
      if (!$('#notifications')[0].checked) {
        $('#mini_player').parents('blockquote').addClass('disabled');
      }
      $('.enable_all')
        .click(function() {
          $('input:checkbox').each(function(index, element) {
            element.checked = true;
            localStorage[element.id] = 'true';
          });
          $('#mini_player').attr('disabled', false);
          $('#mini_player').parents('blockquote').removeClass('disabled');
          show_success();
          return false;
        });
      });