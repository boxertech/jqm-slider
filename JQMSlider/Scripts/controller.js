
controllers.SliderDemoController = function SliderDemoController($scope) {

  $scope.init = function () {
    $scope.slider = {};
    $scope.slider.Value = 0;
  };

  $scope.isDirty = false;
  $scope.init();

  $scope.$watch('slider', function (newSlider, oldSlider) {
  }, true);

};

