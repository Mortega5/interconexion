(function () {
  "use strict";

  function Produce(elementoConsumidor, elementoProductor) {
    return [elementoConsumidor, elementoProductor];
  }

  function comprobar(elementoProductor, ElementoConsumidor) {
    var salida = true
    if (Produce(ElementoConsumidor, elementoProductor)) {
      return false
    } else {
      lista = listaAQuienProduzco(elementoProductor)

      lista.forEach(function(element) {
        salida = comprobar(elementoProductor,element)

        return salida
      })
    }
  }
})();