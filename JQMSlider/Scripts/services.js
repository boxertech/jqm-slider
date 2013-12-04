//services.modalService = function modalService($modal) {
//  var modalDefaults = {    
//    backdrop: false,
//    keyboard: true,
//    modalFade: true,
//    template: ''
//  };

//  var modalOptions = {};

//  this.showModal = function(customModalDefaults, customModalOptions) {
//    if (!customModalDefaults) customModalDefaults = {};
//    customModalDefaults.backdrop = 'static';
//    return this.show(customModalDefaults, customModalOptions);
    
//  };

//  this.show = function(customModalDefaults, customModalOptions) {
//    //Create temp objects to work with since we're in a singleton service
//    var tempModalDefaults = {};
//    var tempModalOptions = {};
    
//    //Map angular-ui modal custom defaults to modal defaults defined in service
//    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
    
//    //Map modal.html $scope custom properties to defaults defined in service
//    angular.extend(tempModalOptions, modalOptions, customModalOptions);
    
//    if (!tempModalDefaults.controller) {
//      tempModalDefaults.controller = function($scope, $modalInstance) {
//        $scope.modalOptions = tempModalOptions;
//        $scope.modalOptions.ok = function (result) {
//          $modalInstance.close(result);
//        };
//        $scope.modalOptions.close = function (result) {
//          $modalInstance.dismiss('cancel');
//        };
//      };
//    }

//    return $modal.open(tempModalDefaults).result;
    
//  };

//};


/**
* Taken directly from ajoslin.scrolly.scroller
**/

//angular.module('boxer.sliderHandle', ['boxer.dragger', 'boxer.transformer', 'boxer.desktop'])
//  .provider('$sliderHandle', function () {
//    var decelerationRate = 0.001;
//    this.decelerationRate = function(newDecelerationRate) {
//      arguments.length && (decelerationRate = newDecelerationRate);
//      return decelerationRate;
//    };
    
//    /**
//     * @ngdoc method
//     * @name boxer.$sliderProvider#supportDesktop
//     * @methodOf boxer.$sliderProvider
//     *
//     * @description
//     * Sets/gets whether the slider should support desktop events (mousewheel, 
//     * arrow keys, etc).  Default true.
//     *
//     * @param {boolean=} newSupport New value to set for desktop support.
//     * @returns {boolean} support Current desktop support.
//     */
//    var supportDesktop = true;
//    this.supportDesktop = function (newSupport) {
//      supportDesktop = !!newSupport;
//      return supportDesktop;
//    };

//    /**
//     * @ngdoc method
//     * @name boxer.$sliderProvider#bounceBuffer
//     * @methodOf boxer.$sliderProvider
//     *
//     * @description
//     * Sets/gets the buffer allowed for the scroll to 'bounce' past the actual
//     * content area.  Set this to 0 to effectively disable bouncing.
//     *
//     * @param {number=} newBounceBuffer The new bounce buffer to set.
//     * @returns {number} bounceBuffer The current bounce buffer.
//     */
//    var bounceBuffer = 40;
//    this.bounceBuffer = function (newBounceBuffer) {
//      arguments.length && (bounceBuffer = newBounceBuffer);
//      return bounceBuffer;
//    };

//    /**
//     * @ngdoc method
//     * @name boxer.$sliderProvider#bounceBackDistanceMulti
//     * @methodOf boxer.$sliderProvider
//     *
//     * @description
//     * When the user scrolls past the content area into the bounce buffer, 
//     * we need to bounce back.  To decide how long the bounce back animation will
//     * take, there are two factors: a minimum time, in milliseconds, and a 
//     * distance multiplier.  
//     *
//     * The equation for deciding how much time the animation to bounce back to
//     * the main content area should take, we do the following:
//     *
//     * <pre>
//     * function getBounceTime(distancePastContent) {
//     *   return bounceBackMinTime + distancePastContent * bounceBackDistanceMulti;
//     * }
//     * </pre>
//     *
//     * This makes it so the farther away the user has scrolled from the content
//     * area, the longer the animation to bring the content back into view will
//     * take. The minimum time exists so even short distances still take a little 
//     * bit of time.
//     *
//     * @param {number=} newDistanceMulti The new bounce back distance multiplier.
//     * @returns {number} bounceBackDistanceMulti The current bounce back distance multiplier.
//     */

//    var bounceBackMinTime = 200;
//    var bounceBackDistanceMulti = 1.5;

//    this.bounceBackMinTime = function(newBounceBackMinTime) {
//      arguments.length && (bounceBackMinTime = newBounceBackMinTime);
//      return bounceBackMinTime;
//    };
//    this.bounceBackDistanceMulti = function(newBounceBackDistanceMult) {
//      arguments.length && (bounceBackDistanceMulti = newBounceBackDistanceMult);
//      return bounceBackDistanceMulti;
//    };

//    //Quicker than Math.floor
//    //http://jsperf.com/math-floor-vs-math-round-vs-parseint/69
//    function floor(n) { return n | 0; }

//    //Returns any parent element that has the specified class, or null
//    //Taken from snap.js http://github.com/jakiestfu/snap.js
//    function parentWithClass(el, className) {
//      while (el.parentNode) {
//        if (el.classList.contains(className)) {
//          return el;
//        }
//        el = el.parentNode;
//      }

//      return null;
//    }

//    //Returns any parent element that has the specified class, or null
//    //Taken from snap.js http://github.com/jakiestfu/snap.js
//    function childWithClass(el, className) {
//      if (el.classList.contains(className)) {
//        return el;
//      }

//      if (el.hasChildNodes) {
//        var children = el.childNodes;
//        for (var i = 0, len = children.length; i < len; i++) {
//          var childElm = el.children[i];
//          var classedChildElm = childWithClass(childElm, className);
//          if (classedChildElm !== null) {
//            return classedChildElm;
//          }
//        }
//      }

//      return null;
//    }

//    this.$get = function ($dragger, $transformer, $window, $document, $desktopSlider) {
//      $slider.getSlideAxis = function (raw) {
//        //determine left, right and width of slider
//        var style = window.getComputedStyle(raw);
//        var offLeft = parseInt(style.getPropertyValue('margin-left'), 10) +
//          parseInt(style.getPropertyValue('padding-left'), 10);
//        var offRight = parseInt(style.getPropertyValue('margin-right'), 10) +
//          parseInt(style.getPropertyValue('padding-right'), 10);

//        var left = parseInt(style.getPropertyValue('left'), 10);
//        var right = parseInt(style.getPropertyValue('right'), 10);

//        var width = parseInt(style.getPropertyValue('width'), 10);
//        return {
//          left: offLeft + (isNaN(left) ? 0 : left),
//          right: offRight + (isNaN(right) ? 0 : right),
//          width: width
//        };
//      };
      
//      function bounceTime(howMuchOut) {
//        return Math.abs(howMuchOut) + bounceBackDistanceMulti + bounceBackMinTime;
//      }

//      /**
//       * @ngdoc object
//       * @name boxer.$sliderProvider
//       * @description
//       * A factory for creating a slide-manipulator on an element. Once called
//       * on an element, it will listen to drag events and use those to change
//       * the element's transform appropriately to simulate sliding. 
//       * Intended to look as close as possible to native iOS sliding.
//       *
//       * @param {element} element Element to attach slider to.
//       * @returns {object} Newly created slider object.
//       *
//       */

//      function $sliderHandle(elm) {
//        var self = {};
//        var currentSlider = elm.data('$boxer.sliderHandle');
//        if (currentSlider) {
//          return currentSlider;
//        } else {
//          elm.data('$boxer.sliderHandle', self);
//        }


//        //var trackElm = childWithClass(elm[0], 'ui-slider-track');
//        //var handleElm = childWithClass(elm[0], 'ui-slider-handle');
//        //var trackRaw = trackElm[0];
//        var transformer = self.transformer = new $transformer(elm);
//        var dragger = self.dragger = new $dragger(elm);
//        //TODO: handle desktop events
//        //if (supportDesktop) {
//        //  var desktopSlider = new $desktopSlider(elm, self);
//        //}

//        self.calculateWidth = function () {
//          if (!$slider.axis) {
//            $slider.axis = $slider.getSlideAxis(parentWithClass(elm[0], 'ui-slider-track'));
//          }
//          //var axis = $slider.getSlideAxis(parentWithClass(elm[0],'ui-slider-track'));
//          var screenWidth = $window.innerWidth;
//          if ($slider.axis.width < screenWidth) {
//            self.slideWidth = $slider.axis.width;
//          } else {
//            self.slideWidth = $slider.axis.width - screenWidth + $slider.axis.left + $slider.axis.right;
//          }
//          return self.slideWidth;
//        };

//        self.outOfBounds = function(pos) {
//          if (pos > 0) return pos;
//          if (pos < -self.slideWidth) return pos + self.slideWidth;
//          return false;
//        };
        
//        function dragListener(dragData) {
//          switch(dragData.type) {
//            case 'start':
//              if (transformer.changing) {
//                transformer.stop();
//              }
//              self.calculateWidth();
//              break;
//            case 'move':
//              var newPos = transformer.pos + dragData.delta;
//              if (self.outOfBounds(newPos)) {
//                newPos = transformer.pos + floor(dragData.delta * 0.5);
//              }
//              transformer.setTo(newPos);
//              break;
//            case 'end':
//              if (self.outOfBounds(transformer.pos) || dragData.inactiveDrag) {
//                self.checkBoundaries();
//              } else {
//                var momentum = self.momentum(dragData);
//                if (momentum.position !== transformer.pos) {
//                  transformer.easeTo(
//                    momentum.position,
//                    momentum.time,
//                    self.checkBoundaries
//                  );
//                }
//              }
//              break;
//          }
//        }

//        self.checkBoundaries = function() {
//          self.calculateWidth();

//          var howMuchOut = self.outOfBounds(transformer.pos);
//          if (howMuchOut) {
//            var newPosition = howMuchOut > 0 ? 0 : -self.slideWidth;
//            transformer.easeTo(newPosition, bounceTime(howMuchOut));
//          }
//        };

//        self.momentum = function(dragData) {
//          self.calculateWidth();

//          var speed = Math.abs(dragData.distance) / dragData.duration;
//          var newPos = transformer.pos + (speed * speed) / (2 * decelerationRate) * (dragData.distance < 0 ? -1 : 1);
//          var time = speed / decelerationRate;

//          var howMuchOver = self.outOfBounds(newPos);
//          var distance;
//          if (howMuchOver) {
//            if (howMuchOver > 0) {
//              newPos = Math.min(howMuchOver, bounceBuffer);
//            } else if (howMuchOver < 0) {
//              newPos = Math.max(newPos, -(self.slideWidth + bounceBuffer));
//            }

//            distance = Math.abs(newPos - transformer.pos);
//            time = distance / speed;
//          }

//          return {
//            position: newPos,
//            time: floor(time)
//          };
//        };

//        dragger.addListener(dragListener);
//        elm.bind('$destroy', function() {
//          dragger.removeListener(dragListener);
//        });

//        return self;

//      }

//      return $sliderHandle;

//    }; //close this.$get


//  }); //close provider