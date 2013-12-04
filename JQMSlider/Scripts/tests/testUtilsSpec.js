"use strict";
describe('testutils', function () {
    var $ = angular.element;

    function checkCompareError(callback, expectedErr) {
        var err, errMsg;
        try {
            callback();
        } catch (e) {
            err = e;
            errMsg = e.toString();
        }
        if (!expectedErr) {
            if (err) {
                throw err;
            }
        } else {
            expectedErr = 'Error: compareElement: ' + expectedErr;
            expect(errMsg).toBe(expectedErr);
            if (errMsg !== expectedErr) {
                throw err;
            }
        }
    }

    function textNode(string) {
        return window.document.createTextNode(string);
    }

    function commentNode(string) {
        return window.document.createComment(string);
    }

    describe('compareElement', function () {
        function createCompareSpec(differenceType, expectedError, el1, el2) {
            it(differenceType, function () {
                checkCompareError(function () {
                    testutils.compareElement(el1, el2);
                }, expectedError);
            });
        }
        createCompareSpec('detects empty and filled element', 'node does not exist on other side. <div> [null]', $('<div></div>'), $());
        createCompareSpec('detects empty and filled element with null', 'node does not exist on other side. <div> [null]', $('<div></div>'), null);

        createCompareSpec('detects different element type', 'node types differ. <div> [text:test]', $('<div></div>'), $(textNode('test')));
        createCompareSpec('detects different text for text nodes', 'text differs. [text:a] [text:b]', $(textNode('a')), $(textNode('b')));

        createCompareSpec('detects different element name', 'node names differ. <div> <span>', $('<div></div>'), $('<span></span>'));
        createCompareSpec('detects different class name', 'classes differ: b. <div class="a"> <div class="b">', $('<div class="a"></div>'), $('<div class="b"></div>'));
        createCompareSpec('detects same classes without order', null, $('<div class="a b"></div>'), $('<div class="b a"></div>'));
        createCompareSpec('detects same classes without spaces', null, $('<div class=" a   b "></div>'), $('<div class="b a"></div>'));
        createCompareSpec('detects same class diffs with ng- classes', null, $('<div class="ng-a"></div>'), $('<div class="ng-b"></div>'));
        createCompareSpec('detects same class diffs with jqm* classes', null, $('<div class="jqmA"></div>'), $('<div class="jqmB"></div>'));
        createCompareSpec('detects same same elements', null, $('<div class="a">test</div>'), $('<div class="a">test</div>'));
        createCompareSpec('detects same trimmed text', null, $(textNode('a')), $(textNode(' a ')));
        createCompareSpec('ignores children', null, $('<div><div></div></div>'), $('<div><span></span></div>'));
    });
    describe('compareElementRecursive', function () {
        function createCompareSpec(differenceType, expectedError, el1, el2) {
            it(differenceType, function () {
                checkCompareError(function () {
                    testutils.compareElementRecursive(el1, el2);
                }, expectedError);
            });
        }

        createCompareSpec('detects different elements', 'node names differ. <div> <span>', $('<div></div>'), $('<span></span>'));
        createCompareSpec('detects different child elements', 'node names differ. <div> <span>', $('<h1><div></div></h1>'), $('<h1><span></span></h1>'));
        createCompareSpec('detects different child element number', 'node does not exist on other side. <div> [null]', $('<h1><div></div></h1>'), $('<h1></h1>'));
        createCompareSpec('detects same text children for interpolated text', null, $('<h1>someLabel</h1>'), $('<h1><span class="ng-scope">someLabel</span></h1>'));
        createCompareSpec('ignores empty trimmed text nodes', '', $('<h1></h1>').append($(textNode(' '))), $('<h1></h1>'));
        createCompareSpec('ignores comment nodes', '', $('<h1></h1>').append($(commentNode('hello'))), $('<h1></h1>'));
    });
    describe('fireEvent', function () {
        it('fires an event on an element', function () {
            var el = angular.element('<div></div>'),
                spy = jasmine.createSpy();
            el.bind('click', spy);
            testutils.fireEvent(el, 'click');
            expect(spy).toHaveBeenCalled();
        });
        it('merges the given props into the event', function () {
            var el = angular.element('<div></div>'),
                spy = jasmine.createSpy(),
                evt = {a: 1},
                realEvt;
            el.bind('click', spy);
            testutils.fireEvent(el, 'click', evt);
            expect(spy).toHaveBeenCalled();
            realEvt = spy.mostRecentCall.args[0];
            expect(realEvt.a).toBe(1);
        });
    });
    describe('ng', function () {
        var api;
        beforeEach(function () {
            api = testutils.ng;
        });
        createCommonTests('ng');
    });
    describe('jqm', function () {
        var api;
        beforeEach(function () {
            api = testutils.jqm;
        });
        createCommonTests('jqm');
        describe('tick - further test cases', function () {
            it('does not control timeouts in the main window', function () {
                var spy = jasmine.createSpy();
                window.setTimeout(spy, 1000);
                expect(spy).not.toHaveBeenCalled();
                api.tick(1000);
                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    function createCommonTests(apiName) {
        var api, emptyPageStr;
        beforeEach(function () {
            api = testutils[apiName];
            emptyPageStr = '<div ' + api.pageAttr + '><div jqm-content data-role="content"></div>';
        });
        describe('tick', function () {
            it('controls timeouts in the corresponding window', function () {
                var spy = jasmine.createSpy();
                api.win.setTimeout(spy, 1000);
                expect(spy).not.toHaveBeenCalled();
                api.tick(1000);
                expect(spy).toHaveBeenCalled();
            });
        });
        describe('activePage', function () {
            it('returns the children of the viewport', function () {
                var page = api.init(emptyPageStr);
                expect(api.activePage()[0]).toBe(page[0]);
                expect(api.activePage().hasClass("ui-page")).toBe(true);
            });
        });
        describe('init', function () {
            it('compiles simple elements within an implicit page and returns them', function () {
                var el = api.init('<div id="test"></div>');
                expect(el.attr("id")).toBe("test");
                expect(api.activePage().hasClass("ui-page")).toBe(true);
                expect(api.activePage().children().children()[0]).toBe(el[0]);
            });
            it('compiles pages and returns them', function () {
                var el = api.init(emptyPageStr);
                expect(el[0]).toBe(api.activePage()[0]);
                expect(el.hasClass("ui-page")).toBe(true);
            });
            it('compiles multiple pages and returns the viewPort', function () {
                var viewPort = api.init({
                    '': {
                        template: '<div ' + api.pageAttr + '><div jqm-content data-role="content">firstPage</div></div>'
                    },
                    '/page2': {
                        template: '<div ' + api.pageAttr + '><div jqm-content data-role="content">secondPage</div></div>'
                    }
                });
                expect(viewPort.hasClass('ui-viewport'));
                expect(viewPort[0]).toBe(api.viewPort[0]);
                expect(api.activePage().text()).toBe('firstPage');
            });
        });
        describe('beginTransitionTo', function () {
            it('switches between pages if there are no animations', function () {
                var viewPort = api.init({
                    '': {
                        template: '<div ' + api.pageAttr + '><div jqm-content data-role="content">firstPage</div></div>'
                    },
                    '/page2': {
                        template: '<div ' + api.pageAttr + '><div jqm-content data-role="content">secondPage</div></div>'
                    }
                });
                expect(api.activePage().text()).toBe('firstPage');
                api.beginTransitionTo('/page2');
                api.tick(10);
                expect(api.activePage().text()).toBe('secondPage');
            });
        });
        describe('fireAnimationEndEvents', function () {
            it('triggers animationend listeners for elements with .in classes', function () {
                var spy = jasmine.createSpy();
                var el = api.init('<div class="in"></div>');
                el.bind('animationend', spy);
                api.fireAnimationEndEvents();
                expect(spy).toHaveBeenCalled();
            });
            it('triggers animationend listeners for elements with .out classes', function () {
                var spy = jasmine.createSpy();
                var el = api.init('<div class="out"></div>');
                el.bind('animationend', spy);
                api.fireAnimationEndEvents();
                expect(spy).toHaveBeenCalled();
            });
        });
    }
});
