/*global angular, document*/

/**
  * @ngdoc object
  * @name myApp
  * @description
  * 
  * This is the module for MyApp. It used something
  **/
var app = angular.module("myApp", []);

app.factory("Binding", function(){
  "use strict";


  var _isEmpty = function(){
    // null and undefined are "empty"
    if (this == null){
      return true;
    }
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (this.length > 0) {
      return false;
    }
    if (this.length === 0){
      return true;
    }

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in this) {
      if (hasOwnProperty.call(this, key) && key.charAt(0) !== "_" ){
        return false;
      }
    }

    return true;
  };
  var _toList = function() {
    var list = [];
    for (var key in this) {
      if (key.charAt(0) !== "_") {
        list.push(this[key]);
      }
    }
    return list;
  };
  // instantiate our initial object
  var Binding = function() {
    this.inputs = {
      _isEmpty: _isEmpty,
      _toList: _toList
    };
    this.outputs = {
      _isEmpty: _isEmpty,
      _toList: _toList
    };
  };


  return Binding;
});
app.run(function($rootScope, Binding){
  "use strict";
  $rootScope.binding = new  Binding();
});

/**
  * @ngdoc controller
  * @name myApp.controller:myController
  * @description
  *
  * This is the main controller. We used it for interconnect elements
  */
app.controller("myController", ["$scope", function($scope){
  "use strict";

  $scope.elements = document.querySelector("#container").children;

  $scope.interconexion = function(nameInput, nameOutput) {
    var splited = nameInput.split(" --> ");
    var element = document.querySelector(splited[0]);
    var attributeObjective = splited[1];
    splited = nameOutput.split(" --> ");
    var bindingAttr = $scope.pizarra[splited[0]][splited[1]].bindingAttr;
    $scope.addAttribute(element, attributeObjective, bindingAttr);
  };
  /**
     * @brief  Funcion para realizar el binding entre el atributo a conectar con otro. Requiere de la ayuda de angularjs para recompilar el elementoy realizarel binding
     * @param in html_element element  Elemento sobre el que se añade
     * @param in String attribute Nombre del atributo sobre el que se el que se añade el binding
     * @param in String value Nombre de la variable sobre la que se publican los datos
     */

  $scope.addAttribute = function(element, attribute, value) {

    // Temporal
    var objective = angular.element(element);
    value = "{{" + value + "}}";
    objective.attr(attribute, value);
    var injector = objective.injector();
    var $compile = injector.get("$compile");
    $compile(objective)(objective.scope());
  };

}]);


/**
 * @ngdoc directive
 * @name MyApp.directive: bindPolymer
 * @restrict A
 * @priority 1000
 * @description
 *
 * This is the main directive of the application. Its is restrict to attributes
 **/
app.directive("bindPolymer", ["$parse", function($parse) {
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


app.directive("registerVariable", ["$rootScope", "$compile", function($rootScope, $compile) {
  "use strict";
  function link(scope, element) {
    var isEmpty = function(obj) {

      // null and undefined are "empty"
      if (obj == null){
        return true;
      }
      // Assume if it has a length property with a non-zero value
      // that that property is correct.
      if (obj.length > 0) {
        return false;
      }
      if (obj.length === 0){
        return true;
      }

      // Otherwise, does it have any properties of its own?
      // Note that this doesn't handle
      // toString and valueOf enumeration bugs in IE < 9
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)){
          return false;
        }
      }

      return true;

    };
    /*FUTURE ¿utilizar esto en una factoria para generar mas estructurado los elementos añadidos a binding? */
    var polymerElement = element[0];
    /* 1) Para primera prueba: guardamos todos los datos en una variable, tanto inputs como outputs*/

    /* Nombramos al elemento por los atributos*/
    var elementNameRegister = polymerElement.tagName.toLowerCase();
    elementNameRegister += "_" + document.querySelectorAll(polymerElement.tagName).length;


    /* @attrs: attributos de  input o outputs
       * @name: una referencia al nombre del elemento dentro del dashboard
       * indicando nombre de la etiqueta + nº de elementos con el mismo tag en el dashboard (id.unico)
       * @element: referencia al elemento dentro del dashboard
       */
    if (polymerElement.properties.inputs && isEmpty(polymerElement.properties.inputs.value)) {
      $rootScope.binding.inputs[elementNameRegister] = {
        attrs: polymerElement.properties.inputs.value,
        element: element[0],
        name: elementNameRegister
      };
    }
    if (polymerElement.properties.outputs && isEmpty(polymerElement.properties.outputs.value)) {
      $rootScope.binding.outputs[elementNameRegister] = {
        attrs: polymerElement.properties.inputs.value,
        element: element[0],
        name: elementNameRegister
      };
    }

    /*2) Segundo modelo para intentar la idea de pizarra */

    /* Fase 1: registrar las variables en la pizarra para saber quien esta produciendo datos y por donde */
    var componentName = polymerElement.tagName.toLowerCase();
    if (!$rootScope.pizarra) {
      $rootScope.pizarra = {};
    }
    var outputs = polymerElement.properties.outputs.value;

    if (!isEmpty(outputs)) {
      $rootScope.pizarra[componentName] = {};
      for (var output in outputs) {
        $rootScope.pizarra[componentName][output] = {type: outputs[output], bindingAttr: output};
      }

    }
    /* Fase 2: Añadir atributos al componente para que empiece a emitir información por esa variable */
    var objective = angular.element(polymerElement);
    for (var output in outputs) {
      var bindingAttr = $rootScope.pizarra[componentName][output].bindingAttr;
      objective.attr(output, "{{" + bindingAttr + "}}");
    }
    objective.removeAttr("register-variable");
    $compile(element)(scope);
  }
  return {link: link};
}]);
