function FastButton(element, handler, useCapture, tap) {
    var isTouch = "ontouchstart" in window;

    function addListener(el, type, listener, useCapture) {
        if (el.addEventListener) { 
            el.addEventListener(type, listener, useCapture);
            return { 
                destroy: function() { el.removeEventListener(type, listener, useCapture); } 
            };
        } else {      
            var handler = function(e) { listener.handleEvent(window.event, listener); }
            el.attachEvent('on' + type, handler);
      
            return { 
                destroy: function() { el.detachEvent('on' + type, handler); }
            };
        }   
    }

    var events = [];
    var touchEvents = [];
    //var element = inElement;
    //var handler = inHandler;
    //var useCapture = inUseCapture;
    var startX;
    var startY;
    
    if (isTouch) {
        events.push(addListener(element, 'touchstart', this, useCapture));
    } else {
        events.push(addListener(element, 'click', this, useCapture));
    }

    this.destroy = function destroy() {
        for (i = events.length - 1; i >= 0; i -= 1) {
          this.events[i].destroy();    
        }
        events = touchEvents = element = handler = null;
    }
  
    this.handleEvent = function handleEvent(event) {
        switch (event.type) {
            case 'touchstart': this.onTouchStart(event); break;
            case 'touchmove': this.onTouchMove(event); break;
            case 'touchend': this.onClick(event); break;
            case 'click': this.onClick(event); break;
        }
    }

    this.onTouchStart = function onTouchStart(event) {
        event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
        touchEvents.push(addListener(element, 'touchend', this, useCapture));
        touchEvents.push(addListener(document.body, 'touchmove', this, useCapture));
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    }
  
    this.onTouchMove = function onTouchMove(event) {
        if (Math.abs(event.touches[0].clientX - startX) > 10 || Math.abs(event.touches[0].clientY - startY) > 10) {
          this.reset(); //if he did, then cancel the touch event
        }
    }
  
    this.onClick = function onClick(event) {
        event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
        console.log(event.stopPropagation ? 'tem' : 'nao tem');
        this.reset();
 
        var color = element.style.backgroundColor;
        
        if (tap) {
            element.style.backgroundColor = '#C0C0C0';
        }
                
        setTimeout(function () {
                       handler.call(element, event);
                       
                       element.style.backgroundColor = color;                    
                   }, 100);
                   
        if (event.type == 'touchend') {
            clickbuster.preventGhostClick(startX, startY);    
        }
    }
  
    this.reset = function reset() {
        for (i = touchEvents.length - 1; i >= 0; i -= 1) {
          touchEvents[i].destroy();    
        }

        this.touchEvents = [];
    }
  
    var clickbuster = function clickbuster() {}
  
    clickbuster.preventGhostClick = function preventGhostClick(x, y) {
        clickbuster.coordinates.push(x, y);
        window.setTimeout(clickbuster.pop, 2500);
    }
  
    clickbuster.pop = function pop() {
        clickbuster.coordinates.splice(0, 2);
    }
  
    clickbuster.onClick = function onClick(event) {
        for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
            var x = clickbuster.coordinates[i];
            var y = clickbuster.coordinates[i + 1];
            if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
                event.preventDefault ? event.preventDefault() : (event.returnValue=false);
            }
        }
    }
    
    if (isTouch) {
        document.addEventListener('click', clickbuster.onClick, true);
        clickbuster.coordinates = [];
    }
}