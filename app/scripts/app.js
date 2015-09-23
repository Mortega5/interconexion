/*global angular, document*/
(function() {

  "use strict";
  var app = angular.module("myApp", []);
  app.controller("myController", ["$scope", function($scope){
    $scope.input = "";

    $scope.elements = document.querySelector("#container").children;

    $scope.addAttribute = function(element, attribute, value) {
      var objective = angular.element(element);
      objective.attr(attribute, value);
      var injector = objective.injector();
      var $compile = injector.get("$compile");
      $compile(objective)(objective.scope());
    };
  }]);
  app.directive('bindPolymer', ['$parse', function($parse) {
    return {
      restrict: 'A',
      scope : false,
      compile: function bindPolymerCompile(el, attr) {
        var attrMap = {};

        for (var prop in attr) {
          if (angular.isString(attr[prop])) {
            var _match = attr[prop].match(/\{\{\s*([\.\w]+)\s*\}\}/);
            if (_match) {
              attrMap[prop] = $parse(_match[1]);
            }
          }
        }
        return function bindPolymerLink(scope, element, attrs) {

          // When Polymer sees a change to the bound variable,
          // $apply / $digest the changes here in Angular
          var observer = new MutationObserver(function polymerMutationObserver(mutations) {
            scope.$apply(function processMutationsHandler() {
              mutations.forEach(function processMutation(mutation) {

                var attributeName, newValue, oldValue, getter;
                attributeName = mutation.attributeName;

                if(attributeName in attrMap) {
                  newValue = element.attr(attributeName);
                  getter = attrMap[attributeName];
                  oldValue = getter(scope);

                  if(oldValue != newValue && angular.isFunction(getter.assign)) {
                    getter.assign(scope, newValue);
                  }
                }
              });
            });
          });

          observer.observe(element[0], {attributes: true});
          scope.$on('$destroy', observer.disconnect.bind(observer));
        }
      }
    };
  }]);


  app.directive("registerVariable", ["$rootScope", function($rootScope) {
    function compile(scope, element, attrs) {
      var polymerElement = element.$$element[0];

      if (!$rootScope.binding) {
       $rootScope.binding = {inputs: {}, outputs: {}};
      }

      if (polymerElement.properties.inputs) {
        $rootScope.binding.inputs[polymerElement.tagName] = polymerElement.properties.inputs.value;
      }
      if (polymerElement.properties.outputs) {
        $rootScope.binding.outputs[polymerElement.tagName] = polymerElement.properties.outputs.value;
      }
    }
    return {compile: compile};
  }]);
})();
