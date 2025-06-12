---
title: Simulateur de machines de Mealy

layout: splash

permalink: /mealy/


header:
  overlay_image: /assets/images/machine-wires-short.jpg
  caption: "[Turing machine in Bletchley Park](https://www.flickr.com/photos/douglashoyt/8235850748) by [Douglas Hoyt](https://www.flickr.com/photos/douglashoyt/), licensed under [CC BY-NC-ND 2.0](https://creativecommons.org/licenses/by-nc-nd/2.0/)"
  
intro: 
  - excerpt: >
      Ce simulateur vous permet de visualiser l'exécution d'une machine de Mealy.
      Pour ce faire, spécifiez une telle machine dans cet éditeur. Vous pouvez par exemple modifier l'exemple ci-dessous.


custom_css:
- general
- turing
- turing-colors

custom_js:
- vis/vis-network.min
- turing
- editor
- parserElts
- parserMealy
- graphOfTm
- simulator
---
{% include feature_row id="intro" type="center" %}

{% capture init-machine %}
// La spécification commence par un en-tête:
name   : Exemple // (optionnel) 
init   : q0      // Voici comment on définit
                 // l'état initial.

// Ensuite, viennnent les transitions:
q0,a/b,q0

// Symboles acceptés :
//   toute chaîne de caractères de longueur 1
//   différente de ','.

// Noms d'états acceptés :
//   toute chaîne de caractères ne contenant pas
//   les symboles ',' ni ':'.

// Les expressions (non-vides) entre crochets permettent 
// d'activer la transition dès que le symbole courant
// appartenient à la liste entre crochets.
// Par exemple, la transition ci-dessous:

q1,[ab]/x,q0

// est équivalente aux transitions suivantes:

// q1,a/x,q0

// q1,b/x,q0

// On peut aussi utiliser le raccourci '$1' dans le symbole de sortie:

q0,b/$1,q1

{% endcapture %}

{% include mealy-simulator.html init-word = "ababaaabaaa" init-machine = init-machine %}
