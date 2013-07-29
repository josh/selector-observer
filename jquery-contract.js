!function($) {
  $.fn.contract = function(selector, callback) {
    // call callback for existing elements
    $(selector, this).each(function() {
      callback.call(this)
    })
    
    var observe, observer = new MutationObserver(function(mutations) {
      observer.disconnect()
      
      mutations.forEach(function(mutation) {
        Array.prototype.slice.call(mutation.addedNodes).forEach(function(node) {
          if ($(node).is(selector)) callback.call(node)
          $(selector, node).each(function() {
            callback.call(this)
          })
        })
      })
      
      observe()
    })
 
    observe = observer.observe.bind(observer, this[0], { childList: true, subtree: true })
    observe()
  }
}(jQuery)