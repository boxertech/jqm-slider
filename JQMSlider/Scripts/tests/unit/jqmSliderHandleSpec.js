"use strict";
describe('jqmSliderHandle directives', function() {
    var ng, jqm, ngElement, jqmElement;
    beforeEach(function() {
        ng = testutils.ng;
        jqm = testutils.jqm;
        module('templates/jqmSliderHandle.html');
        module('templates/jqmSliderHandle.html');
    });

    describe('markup compared to jqm', function () {
      function compileAndCompare(opt, opt2) {
        opt2 = opt2 || opt;
        ngElement = ng.init('<div jqm-slider-handle' + opt + '></div>');
        jqmElement = jqm.init('<div data-role="slider-handle" ' + opt2 + '></div>');
        testutils.compareElementRecursive(ngElement, jqmElement);
      }
      it('has same markup without options', function () {
        compileAndCompare('');
      });
      it('has same markup with min value', function () {
        compileAndCompare('data-min="-5"');
      });
      it('has same markup with max value', function () {
        compileAndCompare('data-max="5"');
      });
      it('has same markup with step value', function () {
        compileAndCompare('data-step="1"');
      });
      it('has same markup with all options', function () {
        compileAndCompare('data-min="-5" data-max="5" data-step="1"');
      });
    });

});
