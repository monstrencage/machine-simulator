---
title: Simulateur de machines de Turing

layout: splash

header:
  overlay_image: /assets/images/machine-wires-short.jpg
  caption: "[Turing machine in Bletchley Park](https://www.flickr.com/photos/douglashoyt/8235850748) by [Douglas Hoyt](https://www.flickr.com/photos/douglashoyt/), licensed under [CC BY-NC-ND 2.0](https://creativecommons.org/licenses/by-nc-nd/2.0/)"
  
intro: 
  - excerpt: >
      Ce simulateur de Machines de Turing vous permet de visualiser l'exécution d'une machine de Turing *déterministe* manipulant un nombre arbitraire de rubans *bi-infinis*.
      Pour ce faire, spécifiez une machine dans cet éditeur. Vous pouvez par exemple modifier l'exemple ci-dessous.


custom_css:
- general
- turing
- turing-colors

custom_js:
- vis/vis-network.min
- turing
- editor
- parserElts
- parserTM
- graphOfTm
- simulator
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

// Les expressions avec un dollar sur la seconde ligne d'une
// transition font référence au contenu du ruban d'entrée. 
// Par exemple, la transition ci-dessous :

q1,a,_
q1,$2,$1,>,<

//est équivalente à la transition commentée:
// q1,a,_
// q1,_,a,>,<

q1,b,_
q0,b,_,>,<

q1,_,_
q2,_,_,-,-


// Les expressions (non-vides) entre crochets sur la première ligne
// d'une transition permettent d'activer la transition dès que la 
// tête de lecture du ruban correspondant se trouve sur un symbole 
// appartenant à la liste entre crochets.
// Par exemple, la transition ci-dessous:

q0,[01],[_a]
q3,_ ,a,>,>

// est équivalente aux transitions suivantes:

// q0,0,_
// q3,_,a,>,>
// 
// q0,1,_
// q3,_,a,>,>
// 
// q0,0,a
// q3,_,a,>,>
// 
// q0,1,a
// q3,_,a,>,>

// Ces constructions peuvent être combinées. Cela permet par exemple
// d'écrire une transition comme ceci:

q3,[01],[_a]
q0,_,$1,>,<

// qui peut également être réalisée par les transitions suivantes:

// q3,0,_
// q0,_,0,>,<
// 
// q3,1,_
// q0,_,1,>,<
// 
// q3,0,a
// q0,_,0,>,<
// 
// q3,1,a
// q0,_,1,>,<

{% endcapture %}

{% include turing-simulator.html init-word = "ababaaabaaa" init-machine = init-machine %}
