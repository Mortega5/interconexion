/*global angular, document*/
(function() {

  "use strict";
  var app = angular.module("myApp", []);
  app.controller("myController", ["$scope", function($scope){

    /* Lista de elementos que tenemos en el dashboard */
    $scope.elements = document.querySelector("#container").children;
   
    $scope.interconexion = function(nameInput, nameOutput) {
      var splited = nameInput.split(" --> ");
      var element = document.querySelector(splited[0]);
      var attributeObjective = splited[1];
      
      splited = nameOutput.split(" --> ");
      
      var prueba = $scope.pizarra[splited[0]][splited[1]].bindingAttr;
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
    
    /**
     * @brief Devuelve si una lista esta vacia. Entendiendo como no vacía, si tiene atributos dentro.
     * @param in Object obj Objeto a comprobar si esta vacío.
     * @return Booleano que indica si la lista está vacía.
     */
    $scope.isEmpty = function(obj) {

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
   
    /**
     * @brief Devuelve un Array de los elementos del objeto
     * @param in Object object Objeto del cual se quere obtener la lista de elementos no vacios.
     * @return Array de la lista de elementos del objeto pasado.
     */
    $scope.toList = function(object) {
      var list = [];
      for (var key in object) {
        if (object.hasOwnProperty(key) && !$scope.isEmpty(object[key])) {
            for (var attr in object[key]) {
              list.push(key + " --> " + attr);
            }
        }
      }
      return list;
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


  app.directive("registerVariable", ["$rootScope", "$compile", function($rootScope, $compile) {
    function link(scope, element, attrs) {

      var isEmpty = function(obj) {
        for (var key in obj) {
          if(hasOwnProperty.call(obj, key)){
            return false;
          }
        }
        return true;
      };
      var polymerElement = element[0];
      /* 1) Para primera prueba: guardamos todos los datos en una variable, tanto inputs como outputs*/
      if (!$rootScope.binding) {
        $rootScope.binding = {inputs: {}, outputs: {}};
      }

      if (polymerElement.properties.inputs) {
        $rootScope.binding.inputs[polymerElement.tagName.toLowerCase()] = polymerElement.properties.inputs.value;
      }
      if (polymerElement.properties.outputs) {
        $rootScope.binding.outputs[polymerElement.tagName.toLowerCase()] = polymerElement.properties.outputs.value;
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
        var bindingAttr = $rootScope.pizarra[componentName][output].bindingAttr
        objective.attr(output, "{{" + bindingAttr + "}}");
      }
      objective.removeAttr("register-variable");
      $rootScope[bindingAttr] = "hola";
      $compile(element)(scope);
    }
    return {link: link};
  }]);
})();
