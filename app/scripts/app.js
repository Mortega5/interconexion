/*global angular, document*/

var app = angular.module("myApp", ["ngBinding"]);
app.controller("myController", ["$scope", function($scope){
  "use strict";

  $scope.elements = document.querySelector("#container").children;

  $scope.interconexion = function(data) {
    var element = $scope.__binding.inputs[data.inputElement].element;
    var bindingAttr = $scope.__blackboard[data.outputElement][data.outputAttr].bindingAttr;
    element.scope().__addAttribute(element, data.inputAttr, bindingAttr);
  };

}]);



