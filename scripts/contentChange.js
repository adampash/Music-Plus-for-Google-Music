jQuery.fn.contentChange = function(callback){
  var elms = jQuery(this);
  elms.each(
    function(i){
      var elm = jQuery(this);
      elm.data("lastContents", elm.html());
      window.watchContentChange = window.watchContentChange ? window.watchContentChange : [];
      window.watchContentChange.push({"element": elm, "callback": callback});
    }
  )
  return elms;
}
setInterval(function(){
  if(window.watchContentChange){
    for( i in window.watchContentChange){
      if(window.watchContentChange[i].element.data("lastContents") != window.watchContentChange[i].element.html()){
        window.watchContentChange[i].callback.apply(window.watchContentChange[i].element);
        window.watchContentChange[i].element.data("lastContents", window.watchContentChange[i].element.html())
      };
    }
  }
},500);