/*global angular, document*/

/**
  * @ngdoc object
  * @name myApp
  * @description
  * 
  * This is the module for MyApp. It used something
  **/
var module = angular.module("ngBinding", ['ng']);
// TODO falta comprobación de errores para evitar bugs
module.factory("BindingFactory", function(){
  "use strict";

  var _isEmpty = function(){
    if (this == null){
      return true;
    }
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
  var _getTypeOfAttr = function(element, attrToSearch) {
    for (var key in this) {
      if (key.charAt(0) !== "_" && this[key].element === element) {
        for (var attr in this[key].attrs) {
          if (attr === attrToSearch) {
            return this[key].attrs[attr];
          }
        }
      }
    }
  };
  // instantiate our initial object
  var BindingFactory = function() {
    this.inputs = {
      _isEmpty: _isEmpty,
      _toList: _toList,
      _getTypeOfAttr: _getTypeOfAttr
    };
    this.outputs = {
      _isEmpty: _isEmpty,
      _toList: _toList,
      _getTypeOfAttr: _getTypeOfAttr

    };
  };


  return BindingFactory;
});
module.factory("Blackboard", function(){
  "use strict";
  var Blackboard = function(){};

  Blackboard.prototype._isEmpty = function(){
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
  Blackboard.prototype._toList = function() {
    var list = [];
    for (var key in this) {
      if (key.charAt(0) !== "_") {
        list.push(this[key]);
      }
    }
    return list;
  };
  Blackboard.prototype._getTypeOfBindingAttr = function(bindingName) {
    var list = this._toList();

    for (var index in list) {
      for (var attr in list[index]) {
        if (attr.charAt(0) !== "_"  && list[index][attr].bindingAttr === bindingName){
          return list[index][attr].type
        }
      }
    }
  };


module.run(function($rootScope, BindingFactory, Blackboard){
  "use strict";
  $rootScope.__binding = new  BindingFactory();
  $rootScope.__blackboard = new Blackboard();
});
/**
 * @ngdoc directive
 * @name MyApp.directive: bindPolymer
 * @restrict A
 * @priority 1000
 * @description
 *
 * This is the main directive of the application. Its is restrict to attributes
 **/
module.directive("bindPolymer", ["$parse", function($parse) {
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

module.directive("registerVariable", ["$rootScope", "$compile", function($rootScope, $compile) {
  "use strict";

  // TODO filtros para los elementos elegibles (¿delegar en el usuario?)
  function link(scope, element) {
    var isEmpty = function(obj) {

      if (obj == null){
        return true;
      }
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

    scope.__addAttribute = function(objetive, attribute, bindingAttrName) {
      //Check type of element
      var inputType = scope.__binding.inputs._getTypeOfAttr(element, attribute);
      var outputType = scope.__blackboard._getTypeOfBindingAttr(bindingAttrName);
      if (inputType !== outputType) {
        throw "Input and output type are not equals: " + inputType + " vs " + outputType;
      }
      var interpolationName = "{{" + bindingAttrName + "}}";
      objetive.attr(attribute, interpolationName);
      var injector = objetive.injector();
      var $compile = injector.get("$compile");
      $compile(objetive)(objetive.scope());
    };

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
    if (polymerElement.properties.inputs && !isEmpty(polymerElement.properties.inputs.value)) {
      $rootScope.__binding.inputs[elementNameRegister] = {
        attrs: polymerElement.properties.inputs.value,
        element: element,
        name: elementNameRegister,
        _toListAttrs: function() {
          var list = [];
          for (var key in this.attrs) {
            if (key.charAt(0) !== "_") {
              list.push(key);
            }
          }
          return list;
        }
      };

    }
    if (polymerElement.properties.outputs && !isEmpty(polymerElement.properties.outputs.value)) {
      $rootScope.__binding.outputs[elementNameRegister] = {
        attrs: polymerElement.properties.outputs.value,
        element: element[0],
        name: elementNameRegister,
        _toListAttrs: function() {
          var list = [];
          for (var key in this.attrs) {
            if (key.charAt(0) !== "_") {
              list.push(key);
            }
          }
          return list;
        }
      };
    }

    /*2) Segundo modelo para intentar la idea de blackboard */

    /* Fase 1: registrar las variables en la blackboard para saber quien esta produciendo datos y por donde */

    var outputs = polymerElement.properties.outputs.value;

    if (!isEmpty(outputs)) {
      $rootScope.__blackboard[elementNameRegister] = {};
      // TODO bindingAttr debe ser unico, usar algo parecido al elementNameRegister
      for (var output in outputs) {
        $rootScope.__blackboard[elementNameRegister][output] = {type: outputs[output], bindingAttr: output};
      }

    }
    /* Fase 2: Añadir atributos al componente para que empiece a emitir información por esa variable */
    var objective = angular.element(polymerElement);
    for (var output in outputs) {
      var bindingAttr = $rootScope.__blackboard[elementNameRegister][output].bindingAttr;
      objective.attr(output, "{{" + bindingAttr + "}}");
    }
    objective.attr('pseudo-name', elementNameRegister);
    objective.removeAttr("register-variable");
    $compile(element)(scope);
  }
  return {link: link};
}]);




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



