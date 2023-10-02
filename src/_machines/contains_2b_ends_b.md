---
title: Contient exactement deux b finit par b
init-word: "_aabaaaab"
machine: contains_2b_ends_b
excerpt: Détecte les mots sur l'alphabet `{a,b}` qui contiennent exactement deux occurences de la lettre `b`, dont une occurence en dernière position.
etats: 4
rubans: 1
hidden: true
---
Cette machine deterministe prend en entrée un mot sur l'alphabet `{a,b}` précédé d'un espace et teste si ce mot appartient au langage `a*ba*b`.
