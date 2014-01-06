"use strict";
describe(' jqmSlider directive', function() {
    var ng, jqm, ngElement, jqmElement;
    beforeEach(function() {
        ng = testutils.ng;
        jqm = testutils.jqm;
        module('templates/jqmSlider.html');
    });

    describe(' markup compared to jqm', function() {
        function compileAndCompare(opt, opt2) {
            opt2 = opt2 || opt;
            ngElement = ng.init('<div jqm-slider '+opt+'></div>');
            jqmElement = jqm.init('<div data-role="slider" '+opt2+'></div>');
            testutils.compareElementRecursive(ngElement, jqmElement);
        }
        it(' has same markup without options', function() {
            compileAndCompare('');
        });
    });
});
