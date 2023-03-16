---
title: Simulateur de machines de Turing

layout: splash

header:
  overlay_image: /assets/images/machine-wires-short.jpg

intro: 
  - excerpt: >
      Ce simulateur de Machines de Turing vous permet de visualiser l'exécution d'une machine de Turing *déterministe* manipulant un nombre arbitraire de rubans *bi-infinis*.
      Pour ce faire, spécifiez une machine dans cet éditeur. Vous pouvez par exemple modifier l'exemple ci-dessous.


custom_css:
- turing
- turing-colors

external_js:
- "https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"
custom_js:
- turing
- editor
- graphOfTm
---
{% include feature_row id="intro" type="center" %}

{% capture init-machine %}
// La spécification commence par un en-tête:
name   : Exemple // optionnel 
init   : q0      // Voici comment on définit l'état initial,
accept : q2      // et l'état final.
output : 2       // optionnel : indique le ruban de sortie. 

// Ensuite, viennnent les transitions:
q0,a,_     // condition d'activation
q0,_,a,>,< // effet

// Symboles acceptés :
//   toute chaîne de caractères de longueur 1
//   différente de ','.

// Noms d'états acceptés :
//   toute chaîne de caractères ne contenant ni ',' ni ':'.

// Directions de déplacement :
//   - : reste en place
//   > : déplace la tête de lecture vers la droite
//   < : déplace la tête de lecture vers la gauche

q0,b,_     // Cette transition peut être activée lorsque
           // l'état courant est q0, que le premier ruban
           // affiche le symbole b, et que le second ruban 
           // affiche une case vide. 
q1,b,_,>,< // Lors de son exécution, elle change l'état courant
           // en q1, efface le b du premier ruban, écrit un a 
           // sur le second, et déplace la première tête de 
           // lecture vers la droite.

q1,a,_
q1,_,a,>,<

q1,b,_
q0,b,_,>,<

q1,_,_
q2,_,_,-,-
{% endcapture %}

{% include turing-simulator.html init-word = "ababaaabaaa" init-machine = init-machine %}
