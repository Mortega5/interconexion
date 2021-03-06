"use strict";

/**
   * @ngdoc overview
   * @name ngBinding
   * @description
   *
   * # ngBinding
   *
   *
   * The `ngBinding` provides the posibility to interconnect polymer element using directives.
   *
   *
   * This module use a $rootScope with two main variables  `__binding`  and  `__blackboard`
   *
   * `Blackboard` will be used to register the producer element of data.
   *
   * `Binding` will have all the information about the elements that produce and consume data.
   *  
   * <pre>
   * <my-element bind-polymer register-variable></my-element>
   * </pre>
   */
angular.module("ngBinding", ["ng"]).
/**
     * @ngdoc service
     * @name ngBinding.BindingFactory
     * @description
     * Use `BindingFactory` to create a new Binding object.
     */
factory("BindingFactory", function () {

  /*** AUXILIAR FUNCTION ****/
  // Check if `this` is empty
  var _isEmpty = function () {
    if (this === null) {
      return true;
    }
    if (this.length > 0) {
      return false;
    }
    if (this.length === 0) {
      return true;
    }

    // Otherwise, does it have any properties of its own?
    // that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in this) {
      if (hasOwnProperty.call(this, key) && key.charAt(0) !== "_") {
        return false;
      }
    }

    return true;
  };
  // Return an array with all the elements in an Object (input or output). it doesnt return _ and $ functions.
  var _toList = function () {
    var list = [];
    for (var key in this) {
      if (key.charAt(0) !== "_" && key.charAt(0) !== "$") {
        list.push(this[key]);
      }
    }
    return list;
  };
  // Return the type of a couple element-attr
  var _getTypeOfAttr = function (element, attrToSearch) {
    for (var key in this) {
      if (key.charAt(0) !== "_" && this[key].element === element && key.charAt(0) !== "$") {
        for (var attr in this[key].attrs) {
          if (attr === attrToSearch) {
            return this[key].attrs[attr].type;
          }
        }
      }
    }
  };
  /** Return the index of the couple from-fromAttr in the list
    *
    *@params {string} from The element searched
    *@params {string} fromAttr The searched attribute of the element
    *@params {string} list List where it'll search the couple from-fromAttr
    *
    *@return {integer} i Index of the couple from-fromAttr in the list
    */
  var _searchBinding = function (from, fromAttr, list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].elementName === from && list[i].toAttr === fromAttr) {
        return i;
      }
    }
    return -1;
  };

  /**
       * @ngdoc
       * @name ngBinding.BindingFactory#BindingFactory
       * @methodOf ngBinding.BindingFactory
       * @description
       *
       * The constructor of the new Object. It provides two new elements into the object.
       *
       *
       * <pre>
       * BindingFactory: {
       *		inputs: {
       *			_isEmpty: function(),
       *			_toList: function(),
       *			_getTypeOfAttr: function(elementTarget, attrToGet),
       *			my-list_1: {
       *				attrs: {
       *					filter: {
			 *						description: "filter description",
			 *						name: "filter",
			 *						type: "String"
			 *					}
       *					items: {
			 *						description: "item description",
			 *						name: "items",
			 *						type: Object
			 *					}
       *				},
       *				//Angular element that represent this component.
       *				element: Object,
       *				name: "my-list_1",
			 *				consumerOf: Array
       *			}
       *		},
       *		outputs: {
       *			_isEmpty: function(),
       *			_toList: function(),
       *			_getTypeOfAttr: function(elementTarget, attrToGet),
       *			input-text_1: {
       *				attrs: {
       *					text: {
			 *						description: "text description",
			 *						name: "text",
			 *						type: "String"
			 *					}
       *				},
       *				//Angular element that represent this component.
       *				element: Object,
       *				name: "input-text_1",
			 *				produceTo: Array
       *			}
       *		}
       *}
       * </pre>
       *	- **inputs**: is the list of the html elements with input attributes. This attributes consume data of someone type.
       *	- **outputs**: is the list of html elements with output attributes. This attributes consume data of someone type.
       * <br><br>
       *
       * Either provides three auxiliar function to make easier access and check information about the inputs.
       *	- `_isEmpty()`: return if the list (inputs or outputs) is empty.
       *	- `_toList()`: return an array with all the component. You can use it in ng-repeat
       *	- `_getTypeOfAttr(elementTarget, attrToGet)`: return the type of the attribute `attrToGet`. It needs the 
       * angular element `elementTarget` for look for the attribute in this component.
       * <br><br>
       *
       * The component are added in the correct structure when the HTML tag that reference this componente has the directives
       * `bind-polymer` and `register-variable`
       */
  var BindingFactory = function () {
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
  /**
       * @ngdoc function
       * @name ngBinding.BindingFactory#_removeElement
       * @methodOf ngBinding.BindingFactory
       * 
 			 *
 			 * @description Deletes a element in the `binding` attribute by element name (`pseudo-name`).
			 * It will be deleted from `inputs` and `outputs`.
			 * All bindings with this element will be deleted too.
			 *
			 * Use `_removeBindingInfo`
			 * @param {string} elementName The new name of the element (pseudo-name).
			 */
  BindingFactory.prototype._removeElement = function (elementName) {
    //FUTURE quiza mandar información a los nodos a los que estaba enlazado para realizar accion  
    var bindingList;
    //Delete element in inputs
    if (this.inputs[elementName]) {
      bindingList = this.inputs[elementName].consumeOf;
      while(bindingList.length > 0) {
        this._removeBindingInfo(elementName, bindingList[0].elementName, bindingList[0].myAttr, bindingList[0].toAttr);
      }
      delete this.inputs[elementName];
    }

    //Delete element in outputs
    if (this.outputs[elementName]) {
      bindingList = this.outputs[elementName].produceTo;
      while(bindingList.length > 0) {
        this._removeBindingInfo(elementName, bindingList[0].elementName, bindingList[0].myAttr, bindingList[0].toAttr);
      }
      delete this.outputs[elementName];
    }
  };
  /**
       * @ngdoc function
       * @name ngBinding.BindingFactory#_addBindingInfo
       * @methodOf ngBinding.BindingFactory
       * 
 			 *
 			 * @description Adds a new binding between two elements. One of them will be a producer and the other will be a consumer.
			 * That binding is done thank to `watchers` and `observers` elements provided by Angular and Polymer.
			 *
			 * The consumer will listen
			 * a consumer variable. The consumer variable (attribute) is a scope variable that will be interpolated with Angular.
			 *
			 * When two elements are connected, we add information of consumer to producer and viceversa.
			 * That information is stored in for <b>`Inputs`</b> <pre>binding.inputs.{'element-name'}.consumerOf</pre>
			 *
			 * For the <b>`Outputs`</b> will be:
			 * <pre>binding.outputs.{'element-name'}.produceTo</pre>
			 *
			 * That data are stored in this way:
			 *
			 *<pre>
			 * // For inputs elements
			 *	consumerOf: {
			 *		//my-list_0 in this case
			 *		elementName: "String", 
			 *		// The variable name from which the element consume data
			 *		toAttr: "String", 
			 *		// The variable name where the component listen data.
			 *		myAttr: "String",
			 *		// The watcher of the information
			 *		watcher: Object 
			 *	}
			 * </pre>
			 * <pre>
			 *	// For outputs elements (Watcher are not stored for outputs)
			 *	produceTo: {
			 *		//my-list_0 in this case
			 *		elementName: "String", 
			 *		// The variable name from which the element consume data
			 *		toAttr: "String", 
			 *		// The variable name where the component listen data.
			 *		myAttr: "String",
			 *	}
			 * </pre>
			 *
			 * If two element are already connected, the function throw a exception
			 * @example
			 *
			 *	<pre> 
			 *			this._addBindingInfo("input-text_0", "text", "my-list_0", "filter", watcher)			
			 *
			 * </pre>
			 * 
			 * @param {string} producer The name of the data producer.
			 * @param {string} producerAttr The attribute name where the data is stored.
			 * @param {string} consumer The name of the data consumer.
			 * @param {string} consumerAttr The attribute name where the data is bound.
			 * @param {object} watcher The `watcher` that Angular use to listen producer attribute changes.
			 */
  BindingFactory.prototype._addBindingInfo = function (producer, producerAttr, consumer, consumerAttr, watcher) {
    // Check if already exist the binding between producer-producerAttr and cosumer-consumerAttr
    var indexInputs  = _searchBinding(producer, producerAttr, this.inputs[consumer].consumeOf);
    var indexOutputs  = _searchBinding(consumer, consumerAttr, this.outputs[producer].produceTo);
    if (indexInputs > -1 || indexOutputs > -1) {
      throw "Error: trying connect a consumer and a producer that they are already connected";
    }
    if (producer === consumer || this._checkLoops(producer, consumer)) {
      throw "Error: producer and consumer cannot be connected because they cause a loop";
    }
    // Add to information about the producer to the consumer 
    this.inputs[consumer].consumeOf.push({
      elementName: producer,
      toAttr: producerAttr,
      myAttr: consumerAttr,
      watcher: watcher
    });
    // Add to information about the consumer to the producer
    this.outputs[producer].produceTo.push({
      elementName: consumer,
      toAttr: consumerAttr,
      myAttr: producerAttr
    });
  };
  /**
      * @ngdoc function
      * @name ngBinding.BindingFactory#_removeBindingInfo
      * @methodOf ngBinding.BindingFactory
      *
 			*
 			* @description Deletes a binding between two elements.
			* 
			* The binding data will be deleted from `inputs` and `outputs` fields of `Binding` object.
			*
			* This function is used by `_remoteElement`
			* It will be deleted from `inputs` and `outputs`.
			*
			*
			* @param {string} elementName The new name of the element (pseudo-name).
			* @param {string} connectedName The new name of the element (pseudo-name) bound to elementName .
			* @param {string} elementAttr The attribute name of the first element (elementName) that it will be deleted
			* @param {string} connectedAttr The attribute name of the second element (connectedElement) that it will be deleted
			*/
  BindingFactory.prototype._removeBindingInfo = function (elementName, connectedName, elementAttr, connectedAttr) {
    var index, inputElement, watcherIndex, deletedElement;
    // If the first element is a input
    if (this.inputs[elementName]) {

      // Remove binding for input element
      index = _searchBinding(connectedName, connectedAttr, this.inputs[elementName].consumeOf);
      if (index > -1){
        deletedElement = this.inputs[elementName].consumeOf.splice(index, 1);

        // Remove watcher for input element
        inputElement = angular.element(document.querySelector("[pseudo-name=" + elementName + "]"));
        watcherIndex = inputElement.scope().$$watchers.indexOf(deletedElement[0].watcher);
        inputElement.scope().$$watchers.splice(watcherIndex, 1);

        // Remove binding for output element
        index = _searchBinding(elementName, elementAttr, this.outputs[connectedName].produceTo);
        this.outputs[connectedName].produceTo.splice(index, 1);
      }
    }
    // If the first element is a outputs
    if (this.outputs[elementName]) {
      // Remove binding for input element
      index = _searchBinding(elementName, elementAttr, this.inputs[connectedName].consumeOf);
      if (index > -1){

        deletedElement = this.inputs[connectedName].consumeOf.splice(index, 1);

        // Remove watcher for input element
        inputElement = angular.element(document.querySelector("[pseudo-name=" + connectedName + "]"));
        watcherIndex = inputElement.scope().$$watchers.indexOf(deletedElement[0].watcher);
        inputElement.scope().$$watchers.splice(watcherIndex, 1);

        // Remove binding for output element
        index = _searchBinding(connectedName, connectedAttr, this.outputs[elementName].produceTo);
        this.outputs[elementName].produceTo.splice(index, 1);
      }
    }
  };
  /**
    * @ngdoc function
    * @name ngBinding.BindingFactory#_checkLoops
    * @methodOf ngBinding.BindingFactory
    * @description
    * 
    * Check if the consumer and the producer are directly or indirectly binding.
    *
    * Example:
    * 
    * If B produce to C and C produce to A, and we want binding A to B we cant. It is not permited
    * because then A produce to A, B produce to C and C produce to A. That may causes a loop with
    * infinite iterations.
    *
		* @param {string} producer The element pseudo-name `productor` in the relasionsion that we want to check.
		* @param {string} consumer The element pseudo-name `consumer` in the relasionsion that we want to check.
    * 
    * @return {boolean} True if the new binding will cause a loop, else False.
    */
  BindingFactory.prototype._checkLoops = function(producer, consumer) {
    var nested = false;
    var _binding = _binding || this;
    var firstNode, list;
    var _isProducerTo = function(producer, consumer) {
      var isProducer  = false;
      var listProducer = _binding.outputs[producer] ? _binding.outputs[producer].produceTo : [];
      for (var i = 0;i<listProducer.length && !isProducer;i++) {
        if (listProducer[i].elementName == consumer) {
          isProducer = true;
        }
      }
      return isProducer;
    };

    if (_isProducerTo(consumer, producer) || _isProducerTo(producer, consumer)){
      nested = true;
    }
    else if (!firstNode) {
      firstNode = producer;
       list = _binding.outputs[consumer] ? _binding.outputs[consumer].produceTo : [];

      for (var i = 0; i < list.length && !nested;i++) {
        nested = _binding._checkLoops(list[i].elementName, firstNode);
      }
    } else {
       list = _binding.outputs[consumer] ? _binding.outputs[consumer].produceTo : [];
      for (var i = 0; i < list.length && !nested;i++) {
        nested = _binding._checkLoops(list[i].elementName, firstNode);
      }
    }
    return nested;
  };

  return BindingFactory;
}).
/**
     * @ngdoc service
     * @name ngBinding.Blackboard
     * @description
     * Use `Blackboard` to create a new Blackboard object. We will use this object to register all 
     * the outputs with them binding variables.
     */
factory("Blackboard", function () {

  /**
     * @ngdoc
     * @name ngBinding.Blackboard#Blackboard
     * @methodOf ngBinding.Blackboard
     * @description
     *
     * The constructor for of new Object Blackboard. It provides several prototype function for administrate the 
     * elements:
     *
     * 
     * 
     * <pre>
     *	Blackboard: {
     *		input-text_0: {
     *			text: {
     *				bindingAttr: "text_input_text_0",
     *				type: "String"
     *			},
     *			_proto: {
     *				_isEmpty: function(),
     *				_toList: function(),
     *				_getTypeOfBindingAttr: function(bindingName),
     *			}
     *		}
     * }
     * </pre>
     *	- `_isEmpty()`: return if there are not elements in the blackboard.
     * - `_toList()`: return an array with all the component. You can use it in ng-repeat.
     * - `_getTypeOfBindingAttr(bindingName)`: return the type of the binding variable. It need the name of the variable.
     *
     */
  var Blackboard = function () {};
  Blackboard.prototype._isEmpty = function () {
    // null and undefined are "empty"
    if (this === null) {
      return true;
    }
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (this.length > 0) {
      return false;
    }
    if (this.length === 0) {
      return true;
    }

    // Otherwise, does it have any properties of its own?
    // that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in this) {
      if (hasOwnProperty.call(this, key) && key.charAt(0) !== "_" && key.charAt(0) !== "$") {
        return false;
      }
    }

    return true;
  };
  Blackboard.prototype._toList = function () {
    var list = [];
    for (var key in this) {
      if (key.charAt(0) !== "_" && key.charAt(0) !== "$") {
        list.push(this[key]);
      }
    }
    return list;
  };
  Blackboard.prototype._getTypeOfBindingAttr = function (bindingName) {
    var list = this._toList();

    for (var index in list) {
      for (var attr in list[index]) {
        if (attr.charAt(0) !== "_" && list[index][attr].bindingAttr === bindingName) {
          return list[index][attr].type;
        }
      }
    }
  };
  Blackboard.prototype._removeElement = function (element) {
    var elementDelete = this[element];
    delete this[element];

    return elementDelete;

  };
  Blackboard.prototype._getElementByBindingAttr = function (bindingAttr) {
    var list = this._toList();

    for (var index in list) {
      for (var attr in list[index]) {
        if (attr.charAt(0) !== "_" && list[index][attr].bindingAttr === bindingAttr) {
          return list[index];
        }
      }
    }
  };
  return Blackboard;
}).

run(function ($rootScope, BindingFactory, Blackboard) {
  $rootScope.__binding = new BindingFactory();
  $rootScope.__blackboard = new Blackboard();
}).

directive("bindPolymer", ["$parse", function ($parse) {
  return {
    restrict: 'A',
    scope: false,
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
      return function bindPolymerLink(scope, element) {

        // When Polymer sees a change to the bound variable,
        // $apply / $digest the changes here in Angular
        var observer = new MutationObserver(function polymerMutationObserver(mutations) {
          scope.$apply(function processMutationsHandler() {
            mutations.forEach(function processMutation(mutation) {

              var attributeName, newValue, oldValue, getter;
              attributeName = mutation.attributeName;

              if (attributeName in attrMap) {
                newValue = element.attr(attributeName);
                getter = attrMap[attributeName];
                oldValue = getter(scope);

                if (oldValue != newValue && angular.isFunction(getter.assign)) {
                  getter.assign(scope, newValue);
                }
              }
            });
          });
        });

        observer.observe(element[0], {
          attributes: true
        });
        scope.$on("$destroy", observer.disconnect.bind(observer));
      };
    }
  };
}]).

directive("registerVariable", ["$rootScope", "$compile", function ($rootScope, $compile) {
  Object.deepExtend = function(destination, source) {
    for (var property in source) {
      if (typeof source[property] === "object" &&
          source[property] !== null ) {
        destination[property] = destination[property] || {};
        Object.deepExtend(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  };
  // TODO filtros para los elementos elegibles (¿delegar en el usuario?)
  function link(scope, element) {
    var isEmpty = function (obj) {

      if (obj === null) {
        return true;
      }
      if (obj.length > 0) {
        return false;
      }
      if (obj.length === 0) {
        return true;
      }

      // Otherwise, does it have any properties of its own?
      // that this doesn't handle
      // toString and valueOf enumeration bugs in IE < 9
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          return false;
        }
      }

      return true;

    };
    var getMe = function (sought) {
      var list = document.getElementsByTagName(sought.tagName);
      for (var index in list) {
        if (list[index] === sought) {
          return index;
        }
      }
    };
    scope.__addAttribute = function (objetive, attribute, bindingAttrName) {

      //FUTURE check complex type through higher abstraction
      //Check type of element 
      var inputType = scope.__binding.inputs._getTypeOfAttr(objetive, attribute);
      var outputType = scope.__blackboard._getTypeOfBindingAttr(bindingAttrName);
      if (inputType !== outputType) {
        throw "Input and output type are not equals: " + inputType + " vs " + outputType;
      }

      //TODO comprobar bucles

      // Add information to __binding variable
      var producer = scope.__blackboard._getElementByBindingAttr(bindingAttrName).name;
      var consumer = objetive.attr("pseudo-name");
      if (producer === consumer || scope.__binding._checkLoops(producer, consumer)) {
        throw "Error: producer and consumer cannot be connected because they cause a loop";
      }
      // Interpolate the new information and re-compile with the binding.
      var interpolationName = "{{" + bindingAttrName + "}}";
      objetive.attr(attribute, interpolationName);
      var injector = objetive.injector();
      var $compile = injector.get("$compile");
      $compile(objetive)(objetive.scope());

      // NOTE we used the first watcher of the scope, we assume that it is the watcher of the binding
      var watcher = objetive.scope().$$watchers[0];
      scope.__binding._addBindingInfo(producer, attribute, consumer, bindingAttrName.split("_")[0], watcher);

    };
    scope.__disconnectAttributes = function(element, elementAttr, connect, connectAttr) {
      $rootScope.__binding._removeBindingInfo(element, connect, elementAttr, connectAttr);
    };
    scope.__removeElement = function(element) {
      if (typeof(element) == "object") {
        scope.$apply(function(){
          angular.element(element).remove();
        });
      } else {
        scope.$apply(function(){
          angular.element(document.querySelector("[pseudo-name=" + element + "]")).remove();
        });
      }
    };

    var removeElement = function () {
      //Call remove of scope.__binding.remove(element)
      scope.__binding._removeElement(this.getAttribute("pseudo-name"));
      //Call remove of scope.__blackboard.remove(element)
      scope.__blackboard._removeElement(this.getAttribute("pseudo-name"));
    };
    var polymerElement = element[0];

    /* 1) Storages data about inputs and outputs in the binding variable */

    // new pseudo-name element
    var elementNameRegister = polymerElement.tagName.toLowerCase();
    // get the number of the same element there are in the dashboard
    var nElement = getMe(polymerElement);
    elementNameRegister += "_" + nElement;

    if (!polymerElement.properties || !polymerElement.properties.inputs || !polymerElement.properties.outputs) {
      throw "The element has not inputs or outputs properties";
    }
    // FUTURE añadir una funcion en binding para hacer el push de elementos inputs
    if (polymerElement.properties.inputs && !isEmpty(polymerElement.properties.inputs.value)) {
      $rootScope.__binding.inputs[elementNameRegister] = {
        attrs: polymerElement.properties.inputs.value,
        element: element,
        name: elementNameRegister,
        _toListAttrs: function () {
          var list = [];
          for (var key in this.attrs) {
            if (key.charAt(0) !== "_" && key.charAt(0) !== "$") {
              var element = this.attrs[key];
              element.name = key;
              list.push(element);
            }
          }
          return list;
        },
        consumeOf: []
      };
    }
    // FUTURE añadir una funcion en binding para hacer push de elementos outputs
    if (polymerElement.properties.outputs && !isEmpty(polymerElement.properties.outputs.value)) {
      $rootScope.__binding.outputs[elementNameRegister] = {
        attrs: polymerElement.properties.outputs.value,
        element: element[0],
        name: elementNameRegister,
        _toListAttrs: function () {
          var list = [];
          for (var key in this.attrs) {
            if (key.charAt(0) !== "_" && key.charAt(0) !== "$") {
              var element = this.attrs[key];
              element.name = key;
              list.push(element);
            }
          }
          return list;
        },
        produceTo: []
      };
    }

    //2) Add new biniding information in the blackboard 

    // Phase 1: register variables in the blackboard to know who is producing data and where it does.
    var outputs = {};
    Object.deepExtend(outputs, polymerElement.properties.outputs.value);
    var bindingAttr;
    if (!isEmpty(outputs)) {
      $rootScope.__blackboard[elementNameRegister] = {
        element: element[0],
        name: elementNameRegister
      };
      for (var output in outputs) {
        // We use the pseudo-name for identify the output.
        // We'll replace - by _ because Angular deal with it like minus symbol.
        bindingAttr = output + "_" + elementNameRegister.replace(/-/g, "_");
        $rootScope.__blackboard[elementNameRegister][output] = outputs[output];
        $rootScope.__blackboard[elementNameRegister][output].bindingAttr = bindingAttr;
      }

    }

    // Phase 2: Add attributes to component for it begins to produce information in it.
    for (var attr in outputs) {
      bindingAttr = $rootScope.__blackboard[elementNameRegister][attr].bindingAttr;
      $rootScope.bindingAttr = "";
      element.attr(attr, "{{" + bindingAttr + "}}");
    }

    //Phasae 3: re-compile the element with bind-polymer directive
    element.attr("pseudo-name", elementNameRegister);
    element.attr("bind-polymer", "");
    element.on("$destroy", removeElement);
    element.removeAttr("register-variable");
    $compile(element)(scope);
  }
  return {
    link: link
  };
}]);