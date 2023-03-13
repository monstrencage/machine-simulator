---
title: Simulateur de machines de Turing

layout: splash

header:
  overlay_image: /assets/images/machine-wires-short.jpg

---
{% capture init-machine %}
// Ce simulateur de Machines de Turing vous
// permet de visualiser l'exécution d'une machine
// de Turing *déterministe* manipulant un nombre
// arbitraire de rubans *bi-infinis*.
// Pour ce faire, spécifiez une machine dans
// cet éditeur. Vous pouvez par exemple
// modifier l'exemple ci-dessous.

name: Exemple
init: q0
accept: q2
output:2

q0,a,_
q0,a,a,>,<

q0,b,_
q1,b,_,>,-

q1,a,_
q1,a,a,>,<

q1,b,_
q0,b,_,>,-

q1,_,_
q2,_,_,-,-
{% endcapture %}

{% include turing-simulator.html init-word = "ababaaabaaa" init-machine = init-machine %}
