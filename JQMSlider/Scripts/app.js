var controllers = {};

angular.module('bxDirectives', [])
  .directive(jqmSliderDirective)
  .directive(jqmSliderHandleDirective)
  .directive(ngTapDirective)
  .directive(ngFastButtonDirective);

var sliderDemoApp = angular.module('sliderDemoApp', ['jqm', 'bxDirectives', 'ajoslin.scrolly.dragger', 'ajoslin.scrolly.transformer']).
  controller(controllers);

