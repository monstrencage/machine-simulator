---
title: Contient le sous-mot aab et finit par b
init-word: "_abaababbbab"
machine: contains_aab_ends_b
excerpt: Détecte les mots sur l'alphabet `{a,b}` qui contiennent le sous-mot `aab` et se terminent par un `b`.
etats: 6
rubans: 1
ndet: true

hidden: true
---
Cette machine non-deterministe prend en entrée un mot sur l'alphabet `{a,b}` précédé d'un espace et teste si ce mot contient le sous-mot `aab` et se termine par un le symbole `b`.
