---
title: Interpréteur d'expressions arithmétiques (unaire → décimal)
init-word: "(((111+1)*11)+(11*111))"
machine: interpreteur-unaire-decimal
excerpt: Évalue des expressions arithmétiques écrites en unaire, pour produire le résultat en décimal.
etats: 20
rubans: 4
hidden: true
---
Cette machine prend en entrée une expression arithmétique avec les nombres en unaire, c'est à dire générée par la grammaire suivante:

```
e,f ::= nb | (e + f) | (e * f)
```
Où `nb` est la représentation unaire d'un nombre: le nombre *n* est représentée par une séquence de `1` de longueur *n*.
Par exemple, l'expression *2 &times; 3* s'écrit `(11 * 111)`. Notez que *0* (zéro) s'écrit comme une chaîne vide, puisqu'il s'agit d'une séquence de `1` de longueur *0*. On écrit donc *0 + (2 &times; 0)* comme ceci : `( + ( 11 * ) )`. 

La machine calcule le résultat de l'expression donnée en entrée, et le convertit en décimal.

Pour cela, la machine procède comme suit.
1. Tout d'abord, elle transforme son entrée, pour la mettre en notation polonaise (états `parser` et  `parser.retour`) sur le ruban `4`.
2. Ensuite, la machine effectue le calcul, en maintenant sur le ruban `3` une pile d'arguments. À chaque opération, on dépile les deux premiers arguments, on calcule le résultat (en utilisant les rubans `1` et `2` si besoin pour le calcul). Le résultat est devient l'argument sur le sommet de la pile.
3. Enfin, on convertit le résultat en décimal. Pour cela, on écrit `0`sur le premier ruban, puis :
   1. on efface le premier `1` du ruban `3`;
   2. on incrémente le nombre écrit sur le premier ruban;
   3. on tente de répéter l'opération.
4. Lorsequ'on voit un `0`sur le ruban `3`, on a notre résultat!
