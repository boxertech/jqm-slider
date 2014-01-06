
controllers.SliderDemoController = function SliderDemoController($scope) {

  $scope.init = function () {
    $scope.slider = {};
    $scope.slider.Value = 1;
  };

  $scope.init();

  $scope.$watch('slider', function (newSlider, oldSlider) {
      var slidernewvalue = newSlider;
  }, true);

};

