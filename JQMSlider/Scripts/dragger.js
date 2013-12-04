
/**
 * @ngdoc object
 * @name ajoslin.scrolly.$draggerProvider
 *
 * @description
  Used for configuring drag options. 
 *
 */

angular.module('boxer.bxdragger', [])
.provider('$bxdragger', function () {

  var _shouldBlurOnDrag = true;
  this.shouldBlurOnDrag = function (shouldBlur) {
    arguments.length && (_shouldBlurOnDrag = !!shouldBlur);
    return _shouldBlurOnDrag;
  };
  var _allowedDragAngle = 40;
  this.allowedDragAngle = function (newDragAngle) {
    arguments.length && (_allowedDragAngle = newDragAngle);
    return _allowedDragAngle;
  };

  var _maxTimeMotionless = 300;
  this.maxTimeMotionless = function (newMaxTimeMotionless) {
    arguments.length && (_maxTimeMotionless = newMaxTimeMotionless);
    return _maxTimeMotionless;
  };

  this.$get = function ($window, $document) {
    var DIRECTION_VERTICAL = $dragger.DIRECTION_VERTICAL = 1;
    var DIRECTION_HORIZONTAL = $dragger.DIRECTION_HORIZONTAL = 2;
    var DIRECTION_ANY = $dragger.DIRECTION_ANY = 3;

    //Creates a dragger for an element
    function $dragger(elm, draggerDirection) {
      draggerDirection = draggerDirection || DIRECTION_VERTICAL;

      var self = {};
      var raw = elm[0];

      var listeners = [];
      self.state = {};

      elm.bind('touchstart', dragStart);
      elm.bind('touchmove', dragMove);
      elm.bind('touchend touchcancel', dragEnd);
      elm.bind('mousedown', dragStart);
      elm.bind('mousemove', dragMove);
      elm.bind('mouseup', dragEnd);
      elm.bind('$destroy', function () {
        listeners.length = 0;
      });

      //var dragActive;
      //function mapEvent(e, eventname) {
      //  if (e.touches.length > 1) {
      //    return; //multitouch event
      //  }

      //  var point = e.changedTouches[0];
      //  var newEvent = document.createEvent("MouseEvent");
      //  newEvent.initMouseEvent(eventname, true, true, window, 1, point.screenX, point.screenY, point.clientX, point.clientY, false, false, false, false, 0, null);
      //  //if (point.target.dispatchEvent) {
      //    point.target.dispatchEvent(newEvent);
      //  //} else {
      //  //  dragEnd(e);
      //  //}
        
      //  e.stopImmediatePropagation();
      //  e.stopPropagation();
      //  e.preventDefault();
      //}
      //function touchStart(e) {
      //  e = e.originalEvent || e; //for jquery

      //  //check for webkit browser, default processing otherwise
      //  if (!("ontouchend" in document)) {
      //    //dragStart(e);
      //  }

      //  if (dragActive) {
      //    //dragStart(e);
      //  }
      //  dragActive = true;

      //  //mapEvent(e, "mouseover");
      //  //mapEvent(e, "mousemove");
      //  mapEvent(e, "mousedown");
      //}
      //function touchMove(e) {
      //  e = e.originalEvent || e; //for jquery

      //  if (!dragActive) {
      //    //dragMove(e);
      //  }
      //  mapEvent(e, "mousemove");
      //}
      //function touchEnd(e) {
      //  e = e.originalEvent || e; //for jquery

      //  if (!dragActive) {
      //    dragMove(e);
      //  }
      //  mapEvent(e, "mouseup");
      //  //mapEvent(e, "mouseout");
      //  dragActive = false;
      //}

      function dragStart(e) {
        e = e.originalEvent || e; //for jquery
        

        var target = angular.element(e.target || e.srcElement);
        //Ignore element or parents with scrolly-drag-ignore
        if (target.controller('scrollyDraggerIgnore')) {
          return;
        }


        e.preventDefault();
        e.stopPropagation();
        var point = e.touches ? e.touches[0] : e;


        //No drag on ignored elements
        //This way of doing it is taken straight from snap.js
        //Ignore this element if it's within a 'dragger-ignore' element


        //Blur stuff on scroll if the option says we should
        if (_shouldBlurOnDrag && isInput(target)) {
          document.activeElement && document.activeElement.blur();
        }


        self.state = startDragState({ x: point.pageX, y: point.pageY });


        dispatchEvent('start');
      }
      function dragMove(e) {
        e = e.originalEvent || e; //for jquery


        if (self.state.active) {
          e.preventDefault();
          e.stopPropagation();


          var point = e.touches ? e.touches[0] : e;
          point = { x: point.pageX, y: point.pageY };
          var timeSinceLastMove = Date.now() - self.state.updatedAt;


          //If the user moves and then stays motionless for enough time,
          //the user 'stopped'.  If he starts dragging again after stopping,
          //we pseudo-restart his drag.
          if (timeSinceLastMove > _maxTimeMotionless) {
            self.state = startDragState(point);
          }
          moveDragState(self.state, point);


          var deg = findDragDegrees(point, self.state.origin) % 180;
          if (deg < 90 + _allowedDragAngle && deg > 90 - _allowedDragAngle) {
            self.state.direction = DIRECTION_VERTICAL;
          } else if (deg < _allowedDragAngle && deg > -_allowedDragAngle) {
            self.state.direction = DIRECTION_HORIZONTAL;
          } else {
            self.state.direction = DIRECTION_ANY;
          }


          if (draggerDirection === DIRECTION_ANY || draggerDirection === self.state.direction) {
            dispatchEvent('move');
          }
        }
      }
      function dragEnd(e) {


        if (self.state.active) {
          e = e.originalEvent || e; // for jquery
          e.stopPropagation();


          self.state.updatedAt = Date.now();
          self.state.stopped = (self.state.updatedAt - self.state.startedAt) > _maxTimeMotionless;


          dispatchEvent('end');
          self.state = {};
        }
      }
      function dragMouseUp(e) {
        var evt = e;
        dragEnd(evt);
      }

      function dispatchEvent(eventType) {
        var eventData = angular.copy(self.state); // don't want to give them exact same data
        for (var i = 0, ii = listeners.length; i < ii; i++) {
          listeners[i](eventType, eventData);
        }
      }


      function findDragDegrees(point2, point1) {
        var theta = Math.atan2(-(point1.y - point2.y), point1.x - point2.x);
        if (theta < 0) {
          theta += 2 * Math.PI;
        }
        var degrees = Math.floor(theta * (180 / Math.PI) - 180);
        if (degrees < 0 && degrees > -180) {
          degrees = 360 - Math.abs(degrees);
        }
        return Math.abs(degrees);
      }


      //Restarts the drag at the given position
      function startDragState(point) {
        return {
          origin: { x: point.x, y: point.y },
          pos: { x: point.x, y: point.y },
          distance: { x: 0, y: 0, magnitude: 0 },
          delta: { x: 0, y: 0, magnitude: 0 },


          startedAt: Date.now(),
          updatedAt: Date.now(),


          stopped: false,
          active: true
        };
      }


      function moveDragState(state, point) {
        state.delta = distanceBetween(point, state.pos);
        state.distance = distanceBetween(point, state.origin);
        state.pos = { x: point.x, y: point.y };
        state.updatedAt = Date.now();
      }

      function distanceBetween(p2, p1) {
        var dist = {
          x: p2.x - p1.x,
          y: p2.y - p1.y
        };
        dist.magnitude = Math.sqrt(dist.x * dist.x + dist.y * dist.y);
        return dist;
      }


      function isInput(raw) {
        return raw && (raw.tagName === "INPUT" ||
          raw.tagName === "SELECT" ||
          raw.tagName === "TEXTAREA");
      }


      self.addListener = function (callback) {
        if (!angular.isFunction(callback)) {
          throw new Error("Expected callback to be a function, instead got '" +
            typeof callback + '".');
        }
        listeners.push(callback);
      };
      self.removeListener = function (callback) {
        if (!angular.isFunction(callback)) {
          throw new Error("Expected callback to be a function, instead got '" +
            typeof callback + '".');
        }
        var index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };

      //Allow setting with setTo(x,y) or setTo({x:x, y:y})
      self.startDrag = function (e) {
        dragStart(e);
      };

      return self;
    }


    return $dragger;


  };
});
