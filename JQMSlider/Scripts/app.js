var controllers = {};

angular.module('jqmDirectives', [])
  .directive(jqmSliderDirective)
  .directive(jqmSliderHandleDirective);

var sliderDemoApp = angular.module('sliderDemoApp', ['jqm', 'jqmDirectives', 'ajoslin.scrolly.dragger', 'ajoslin.scrolly.transformer']).
  controller(controllers);

