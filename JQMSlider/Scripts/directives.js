var jqmSliderDirective = {
    'jqmSlider': function () {
        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            priority: 1,
            templateUrl: '/templates/jqmSlider.html',
            scope: {
                shadow: '@',
                corners: '@',
                mini: '@',
                min: '@',
                max: '@',
                step: '@'
            },
            controller: function ($scope){
                this.$scope = $scope;
            }
        };
    }
};

var jqmSliderHandleDirective = {
    'jqmSliderHandle': function ($window, $document, $dragger, $transformer) {
        return {
            restrict: 'A',
            transclude: true,
            priority: 0,
            scope: false,
            require: ['^?ngModel','^jqmSlider'],
            link: function (scope, element, attr, ctrls) {
                var ngModelCtrl = ctrls[0];
                var jqmSliderCtrl = ctrls[1];
                var parsedMax;
                var parsedMin;
                var parsedStep;
                var elm = element;
                var dragger;
                var transformer;
                var dragOn = false;
                var bounceBackMinTime = 200;
                var bounceBackDistanceMulti = 1.5;

                function isMini() {
                    return scope.mini || (jqmSliderCtrl && jqmSliderCtrl.$scope.mini);
                }

                element.bind('touchmove', function (e) { e.preventDefault(); });
                element.bind('mousemove', function (e) { e.preventDefault(); });
                element.bind('click', function (e) {
                    e.preventDefault();
                });

                scope.theme = scope.$theme || 'c';
                scope.isMini = isMini;

                initSliderState();
                
                function initSliderState() {
                    //calculate parameters of slide
                    parsedMax = parseInteger(scope.max || 100);
                    parsedMin = parseInteger(scope.min || 0);
                    parsedStep = parseInteger(scope.step || 1);
                    calculateWidth();

                    //create $dragger and $transformer
                    dragger = $dragger(element);
                    dragger.addListener($dragger.DIRECTION_ANY, dragListener);
                    transformer = $transformer(element);

                    //calculate data parameters
                    scope.midData = (parsedMin + parsedMax) / 2;
                    scope.pixelsPerDataUnit = scope.axis.width / (parsedMax - parsedMin);
                    scope.midPos = transformer.pos.x;
                    scope.minBounds = scope.midPos - (scope.axis.width / 2);
                    scope.maxBounds = scope.midPos + (scope.axis.width / 2);

                    //get slider initial value
                    var initData;
                    if (ngModelCtrl && !isNaN(ngModelCtrl.$viewValue)) {
                        initData = ngModelCtrl.$viewValue;
                    } else {
                        initData = scope.midData;
                    }

                    //set slider to initial value
                    var initDelta = parseInt((initData - scope.midData) * scope.pixelsPerDataUnit);
                    var newPos = { x: scope.midPos + initDelta, y: 0 };
                    if (outOfBounds(newPos.x)) {
                        newPos.x = scope.midPos + floor(initDelta * 0.5);
                    }
                    transformer.setTo(newPos);
                    
                    //ngModelCtrl.$render = function () {
                    //    scope.sliderValue = ngModelCtrl.$viewValue;
                    //};
                }

                ngModelCtrl.$formatters.push(function (value) {
                    if (value === undefined || isNaN(value)) {
                        return value;
                    }
                    scope.sliderValue = value;
                    return modelMove(scope.sliderValue);
                });

                scope.inputChange = function () {
                    if (scope.sliderValue === undefined || isNaN(scope.sliderValue)) {
                        return;
                    }
                    setViewValue(modelMove(parseInt(scope.sliderValue)));
                    return;
                };

                function sliderSlid(moveData) {
                    if (scope.disabled) {
                        return;
                    }

                    if (!ngModelCtrl) {
                        return;
                    } else {
                        scope.sliderValue = moveData;
                        setViewValue(moveData);
                        scope.$apply();
                    }
                }
                
                function modelMove(value) {
                    if (value === undefined || isNaN(value)) {
                        return value;
                    }

                    //set slider to new model value
                    var moveDelta = parseInt((value - scope.midData) * scope.pixelsPerDataUnit);
                    var newPos = { x: scope.midPos + moveDelta, y: 0 };
                    if (outOfBounds(newPos.x)) {
                        newPos.x = scope.midPos + floor(moveDelta * 0.5);
                    }
                    transformer.setTo(newPos);
                    
                    return value;
                }
                
                function setViewValue(value) {
                    if (ngModelCtrl) {
                        if (value && value != ngModelCtrl.$viewValue) {
                            ngModelCtrl.$setViewValue(value);
                        }
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
                    //var screenWidth = $window.innerWidth;
                    //if (scope.axis.width < screenWidth) {
                        scope.slideWidth = scope.axis.width;
                    //} else {
                    //    scope.slideWidth = scope.axis.width - screenWidth + scope.axis.left + scope.axis.right;
                    //}
                    return;
                };

                function outOfBounds(pos) {
                    if (pos < scope.minBounds) return pos + scope.minBounds;
                    if (pos > scope.maxBounds) return pos - scope.maxBounds;
                    return false;
                };

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

                function dragListener(dragType, dragData) {
                    switch (dragType) {
                        case 'start':
                            if (transformer.changing) {
                                transformer.stop();
                            }
                            calculateWidth();
                            $window.onmouseup = function () {
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


