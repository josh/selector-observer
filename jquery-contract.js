!function($) {
  $.fn.contract = function(selector, callback) {
    // call callback for existing elements
    $(selector, this).each(function() {
      callback.call(this)
    })
    
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // console.log(mutation)
        Array.prototype.slice.call(mutation.addedNodes).forEach(function(node) {
          if ($(node).is(selector)) callback.call(node)
          $(selector, node).each(function() {
            callback.call(this)
          })
        })
      })
    })
 
    observer.observe(this[0], { childList: true, subtree: true })
  }
}(jQuery)