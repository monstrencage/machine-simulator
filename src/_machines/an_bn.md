---
title: a^nb^n
init-word: "_aaabbb"
machine: an_bn
excerpt: Détecte les mots du langage `a*b*` qui ont autant de `a` que de `b`.
etats: 6
rubans: 1
hidden: true
---
Cette machine deterministe prend en entrée un mot sur l'alphabet `{a,b}` précédé d'un espace et teste si ce mot est de la forme `a^nb^m`.
