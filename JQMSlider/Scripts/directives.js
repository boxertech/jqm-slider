var jqmSliderDirective = {
  'jqmSlider': function () {
    return {
      restrict: 'A',
      transclude: true,
      replace: true,
      templateUrl: '/templates/jqmSlider.html',
      scope: true
    };
  }
};

var jqmSliderHandleDirective = {
  'jqmSliderHandle': function ($window, $document, $dragger, $transformer) {
    return {
      restrict: 'A',
      transclude: true,
      replace: true,
      templateUrl: '/templates/jqmSliderHandle.html',
      scope: {
        //disabled: '@',
        //mini: '@',
        minValue: '@',
        maxValue: '@',
        step: '@',
        ngModel: '='
      },
      require: ['?ngModel', '^?jqmSlider'],
      link: function (scope, element, attr, ctrls) {
        var ngModelCtrl = ctrls[0];
        var bxSliderCtrl = ctrls[1];
        var parsedMax;
        var parsedMin;
        var parsedStep;
        var elm = element;
        var dragger;
        var transformer;
        var dragOn = false;
        //var dragMove = false;

        element.bind('touchmove', function (e) { e.preventDefault(); });
        element.bind('mousemove', function (e) { e.preventDefault(); });
        element.bind('click', function (e) {
          e.preventDefault(); 
        });

        scope.theme = scope.$theme || 'c';
        scope.isMini = isMini;
        scope.maxValue = angular.isDefined(attr.max) ? attr.max : 100;
        scope.minValue = angular.isDefined(attr.min) ? attr.min : 0;
        scope.stepValue = angular.isDefined(attr.step) ? attr.step : 1;

        var bounceBackMinTime = 200;
        var bounceBackDistanceMulti = 1.5;
        //var decelerationRate = 0.001;

        //var bounceBuffer = 40;

        initSliderState();

        function initSliderState() {
          //calculate parameters of slide
          parsedMax = parseInteger(scope.maxValue);
          parsedMin = parseInteger(scope.minValue);
          parsedStep = parseInteger(scope.stepValue);
          calculateWidth();

          //create $dragger and $transformer
          dragger = new $dragger(element);
          dragger.addListener($dragger.DIRECTION_ANY, dragListener);
          transformer = new $transformer(element);

          //calculate data parameters
          scope.midData = (parsedMin + parsedMax) / 2;
          scope.pixelsPerDataUnit = scope.axis.width / (parsedMax - parsedMin);
          scope.midPos = transformer.pos.x;
          scope.minBounds = scope.midPos - (scope.axis.width / 2);
          scope.maxBounds = scope.midPos + (scope.axis.width / 2);

          var initData = (scope.ngModel) ? scope.ngModel : 0;
          //sets value inside slider handle
          //elm[0].children[0].children[0].children[0].textContent = Math.abs(initData);// custom hack to display slider value inside of slider handle.  
          var initDelta = parseInt((initData - scope.midData) * scope.pixelsPerDataUnit);
          var newPos = { x: scope.midPos + initDelta, y: 0 };
          if (outOfBounds(newPos.x)) {
            newPos.x = scope.midPos + floor(initDelta * 0.5);
          }
          transformer.setTo(newPos);
        }

        function sliderSlid(moveData) {
          if (scope.disabled) {
            return;
          }

          if (!ngModelCtrl) {
            return;
          } else {
            scope.ngModel = moveData;
            //elm[0].children[0].children[0].children[0].textContent = Math.abs(moveData);
            ngModelCtrl.$setViewValue(moveData);
          }

        }

        //Returns any parent element that has the specified class, or null
        //Taken from snap.js http://github.com/jakiestfu/snap.js
        function parentWithClass(el, className) {
          while (el.parentNode) {
            if (el.classList.contains(className)) {
              return el;
            }
            el = el.parentNode;
          }

          return null;
        }

        function getSlideAxis(raw) {
          //determine left, right and width of slider
          var style = window.getComputedStyle(raw);
          var offLeft = parseInt(style.getPropertyValue('margin-left'), 10) +
            parseInt(style.getPropertyValue('padding-left'), 10);

          var left = parseInt(style.getPropertyValue('left'), 10);

          var width = parseInt(style.getPropertyValue('width'), 10);
          return {
            left: offLeft + (isNaN(left) ? 0 : left),
            right: offLeft + (isNaN(left) ? 0 : left) + width, //offRight + (isNaN(right) ? 0 : right),
            width: width
          };
        };

        function calculateWidth() {
          if (!scope.axis) {
            scope.axis = getSlideAxis(parentWithClass(elm[0], 'ui-slider-track'));
          }
          var screenWidth = $window.innerWidth;
          if (scope.axis.width < screenWidth) {
            scope.slideWidth = scope.axis.width;
          } else {
            scope.slideWidth = scope.axis.width - screenWidth + scope.axis.left + scope.axis.right;
          }
          return;
        };

        function outOfBounds(pos) {
          if (pos < scope.minBounds) return pos + scope.minBounds;
          if (pos > scope.maxBounds) return pos - scope.maxBounds;
          return false;
        };

        function isMini() {
          return scope.mini || (bxSliderCtrl && bxSliderCtrl.$scope.mini);
        }

        //Quicker than Math.floor
        //http://jsperf.com/math-floor-vs-math-round-vs-parseint/69
        function floor(n) { return n | 0; }

        function parseInteger(value) {
          var intValue = parseInt(value);
          if (intValue == Number.NaN) {
            return 0;
          }

          return intValue;
        }

        function checkBoundaries() {
          calculateWidth();

          var howMuchOut = outOfBounds(transformer.pos.x);
          if (howMuchOut) {
            var newPosition = howMuchOut < 0 ? scope.minBounds : scope.maxBounds;
            transformer.easeTo(newPosition, bounceTime(howMuchOut));
          }
        };

        function bounceTime(howMuchOut) {
          return Math.abs(howMuchOut) + bounceBackDistanceMulti + bounceBackMinTime;
        }

        //function findMomentum(dragData) {
        //  calculateWidth();

        //  var speed = Math.abs(dragData.distance.x) / (dragData.updatedAt - dragData.startedAt);
        //  var newPosition = { x: transformer.pos.x + (speed * speed) / (2 * decelerationRate) * (dragData.distance < 0 ? -1 : 1), y: transformer.pos.y };
        //  var time = speed / decelerationRate;

        //  var howMuchOver = outOfBounds(newPosition.x);
        //  var distance;
        //  if (howMuchOver) {
        //    newPosition.x = newPosition.x - howMuchOver;
        //    distance = Math.abs(howMuchOver - transformer.pos.x);
        //    time = distance / speed;
        //  }

        //  return {
        //    position: newPosition,
        //    time: floor(time)
        //  };
        //};

        function dragListener(dragType, dragData) {
          switch (dragType) {
            case 'start':
              if (transformer.changing) {
                transformer.stop();
              }
              calculateWidth();
              $window.onmouseup = function() {
                dragListener('end', null);
              };
              dragOn = true;
              break;
            case 'move':
              if (dragOn) {
                var newPos = { x: transformer.pos.x + dragData.delta.x, y: 0 };
                if (outOfBounds(newPos.x)) {
                  var reduceDragX = 0;
                  newPos = { x: transformer.pos.x + reduceDragX, y: 0 };
                }
                transformer.setTo(newPos);
                var moveDelta = newPos.x - scope.midPos;
                var moveData = Math.round(scope.midData + (moveDelta / scope.pixelsPerDataUnit));
                //if (moveData > scope.maxValue || moveData < scope.minValue) {
                //  var obData = moveData;
                //}
                sliderSlid(moveData);
              }
                break;
            case 'end':
              if (outOfBounds(transformer.pos.x) || dragData == null || !dragData.active) {
                checkBoundaries();
              }

              $window.onclick = null;
              dragOn = false;
              break;
          }
        }

        if (dragger !== null) {
          elm.bind('$destroy', function () { dragger.removeListener(dragListener); });
        }
      }
    };
  }
};

var ngTapDirective = {
  'ngTap': function () {
    return function (scope, element, attrs) {
      var tapping;
      tapping = false;
      element.bind('touchstart', function (e) {
        element.addClass('active');
        tapping = true;
      });
      element.bind('touchmove', function (e) {
        element.removeClass('active');
        tapping = false;
      });
      element.bind('touchend', function (e) {
        if (tapping) {
          scope.$apply(attrs['ngTap'], element);
        }
        //bx.clickbuster.preventGhostClick(startX, startY);
      });
    };
  }
};

var ngFastButtonDirective = {
  'ngFastButton': function () {
    return function (scope, element, attrs) {
      var tapping;
      var startX;
      var startY;
      //tapping = false;
      element.bind('touchstart', function (e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        //element.addClass('active');
        tapping = true;
      });
      element.bind('mousedown', function (e) {
        this.startX = e.clientX;
        this.startY = e.clientY;
        element.addClass('active');
        tapping = true;
      });
      element.bind('touchmove', function (e) {
        if (Math.abs(e.touches[0].clientX - this.startX) > 10 ||
            Math.abs(e.touches[0].clientY - this.startY) > 10) {
          tapping = false;
        }
        //element.removeClass('active');
      });
      element.bind('mousemove', function (e) {
        if (Math.abs(e.clientX - this.startX) > 10 ||
            Math.abs(e.clientY - this.startY) > 10) {
          tapping = false;
        }
        element.removeClass('active');
      });
      element.bind('touchend', function (e) {
        if (tapping) {
          scope.$apply(attrs['ngFastButton'], element);
        }
        e.stopPropagation();
        e.preventDefault();
        bx.clickbuster.preventGhostClick(startX, startY);
      });
      element.bind('mouseup', function (e) {
        if (tapping) {
          scope.$apply(attrs['ngFastButton'], element);
        }
        e.stopPropagation();
        e.preventDefault();
        bx.clickbuster.preventGhostClick(startX, startY);
      });
      //element.bind('click', function (e) {
      //  scope.$apply(attrs['ngFastButton'], element);
      //  e.stopPropagation();
      //  e.preventDefault();
      //  alert('click caught in directive');
      //});
    };
  }
};

