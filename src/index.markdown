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

{% capture supercool%}
nom     : Interpréteur
initial : début
final   : fin
sortie  : 1

début,[1(],_,_,_
parser,$1,0,_,0,-,>,-,<

// mise en forme normale
parser,(,_,_,_
parser,_,?,_,_,>,>,-,-

parser,1,_,_,_
parser,_,_,_,1,>,-,-,<

parser,[+*],_,_,_
parser.chercher,$1,_,_,0,-,<,-,<

parser.chercher,[+*],[+*],_,_
parser.chercher,$1,$2,_,_,-,<,-,-

parser.chercher,[+*],?,_,_
parser.retour,$1,$1,_,_,-,>,-,-

parser.retour,[+*],[+*],_,_
parser.retour,$1,$2,_,_,-,>,-,-

parser.retour,[+*],_,_,_
parser,_,_,_,_,>,-,-,-

parser,),_,_,_
parser.fermer,_,_,_,_,-,<,-,-

parser.fermer,_,[+*],_,_
parser,_,_,_,$2,>,-,-,<

parser,_,_,_,_
parser.vérifier,_,_,_,_,-,<,-,-

parser.vérifier,_,0,_,_
calcul.retour,_,_,_,_,-,-,-,>

calcul.retour,_,_,_,[01+*]
calcul.retour,_,_,_,$4,-,-,-,>

calcul.retour,_,_,_,_
calcul,_,_,_,_,-,-,-,<

calcul,_,_,_,_
convertir,0,_,_,_,>,-,>,-

calcul,_,_,_,[01]
calcul,_,_,$4,_,-,-,<,<

calcul,_,_,_,+
addition,_,_,_,_,-,-,>,-

addition,_,_,1,_
addition.arg1,_,_,_,_,-,-,>,-

addition,_,_,0,_
calcul,_,_,_,_,-,-,-,<

addition.arg1,_,_,1,_
addition.arg1,_,_,1,_,-,-,>,-

addition.arg1,_,_,0,_
addition.fin,_,_,1,_,-,-,<,-

addition.fin,_,_,1,_
addition.fin,_,_,1,_,-,-,<,-

addition.fin,_,_,_,_
calcul,_,_,_,_,-,-,-,<

calcul,_,_,_,*
mult,_,_,_,_,-,-,>,-

mult,_,_,0,_
mult.efface,_,_,_,_,-,-,>,-

mult.efface,_,_,1,_
mult.efface,_,_,_,_,-,-,>,-

mult.efface,_,_,0,_
calcul,_,_,0,_,-,-,<,<

mult,_,_,1,_
mult.arg1,_,1,_,_,-,>,>,-

mult.arg1,_,_,1,_
mult.arg1,_,1,_,_,-,>,>,-

mult.arg1,_,_,0,_
mult.arg2,_,_,_,_,-,-,>,-

mult.arg2,_,_,1,_
mult.arg2,1,_,_,_,>,-,>,-

mult.arg2,_,_,0,_
mult.boucle,_,_,0,_,<,-,<,-

mult.boucle,1,_,_,_
mult.recopier,_,_,_,_,-,<,-,-

mult.recopier,_,1,_,_
mult.recopier,_,1,1,_,-,<,<,-

mult.recopier,_,_,_,_
mult.retour,_,_,_,_,-,>,-,-

mult.retour,_,1,_,_
mult.retour,_,1,_,_,-,>,-,-

mult.retour,_,_,_,_
mult.boucle,_,_,_,_,<,-,-,-

mult.boucle,_,_,_,_
mult.fin,_,_,_,_,-,<,-,-

mult.fin,_,1,_,_
mult.fin,_,_,_,_,-,<,-,-

mult.fin,_,_,_,_
calcul,_,_,_,_,-,-,-,<

convertir,_,_,0,_
fin,_,_,_,_,<,-,-,-

convertir,_,_,1,_
incrémenter,_,_,_,_,<,-,-,-

incrémenter,0,_,_,_
incr.retour,1,_,_,_,>,-,-,-

incrémenter,_,_,_,_
incr.retour,1,_,_,_,>,-,-,-

incrémenter,1,_,_,_
incr.retour,2,_,_,_,>,-,-,-

incrémenter,2,_,_,_
incr.retour,3,_,_,_,>,-,-,-

incrémenter,3,_,_,_
incr.retour,4,_,_,_,>,-,-,-

incrémenter,4,_,_,_
incr.retour,5,_,_,_,>,-,-,-

incrémenter,5,_,_,_
incr.retour,6,_,_,_,>,-,-,-

incrémenter,6,_,_,_
incr.retour,7,_,_,_,>,-,-,-

incrémenter,7,_,_,_
incr.retour,8,_,_,_,>,-,-,-

incrémenter,8,_,_,_
incr.retour,9,_,_,_,>,-,-,-

incrémenter,9,_,_,_
incrémenter,0,_,_,_,<,-,-,-

incr.retour,[0123456789],_,_,_
incr.retour,$1,_,_,_,>,-,-,-

incr.retour,_,_,_,_
convertir,_,_,_,_,-,-,>,-

{% endcapture %}

{% include turing-simulator.html init-word = "ababaaabaaa" init-machine = init-machine supercool=supercool supercool-input = "(((111+1)*11)+(11*111))" %}
