!function($) {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
  var Observer = function(target, selector, callback) {
    var self = this
    this.target = target
    this.selector = selector
    this.callback = callback
    this.observer = new MutationObserver(function(mutations) {
      setTimeout(function() {        
        var contracts = self.target.data('contracts')
        contracts.forEach(function(contract) {
          contract.disconnect()
        })
      
        var childsOnly = self.selector[0] === '>'
          , search = childsOnly ? self.selector.substr(1) : self.selector
      
        mutations.forEach(function(mutation) {
          Array.prototype.slice.call(mutation.addedNodes).forEach(function(node) {
            if (childsOnly && self.target[0] !== $(node).parent()[0]) return
            if ($(node).is(search)) self.callback.call(node)
            if (childsOnly) return
            $(selector, node).each(function() {
              self.callback.call(this)
            })
          })
        })

        contracts.forEach(function(contract) {
          contract.observe()
        })
      })
    })
    
    // call callback for existing elements
    $(selector, target).each(function() {
      self.callback.call(this)
    })
    
    this.observe()
  }
  
  Observer.prototype.disconnect = function() {
    this.observer.disconnect()
  }
  
  Observer.prototype.observe = function() {
    this.observer.observe(this.target[0], { childList: true, subtree: true })
  }
  
  $.fn.observe = function(selector, callback) {
    var contracts = this.data('contracts')
    if (!contracts) contracts = []
    var contract = contracts.filter(function(c) { return c.selector === selector })
    if (contract.length) {
      contract[0].callback = callback
      return
    }
    var observer = new Observer(this, selector, callback)
    contracts.push(observer)
    this.data('contracts', contracts)
  }
}(window.Zepto || window.jQuery)
