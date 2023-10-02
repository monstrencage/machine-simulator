---
title: Contient le sous-mot abc et mais pas bb
init-word: "_aababaccabcaabacc"
machine: contains_abc_no_bb_from_auto
excerpt: Détecte les mots sur l'alphabet `{a,b,c}` qui contiennent le sous-mot `abc` et mais pas le sous-mot `bb`.
etats: 9
rubans: 1

hidden: true
---
Cette machine deterministe prend en entrée un mot sur l'alphabet `{a,b,c}` précédé d'un espace et teste si ce mot contient le sous-mot `abc` et mais ne contient pas le sous-mot `bb`.
