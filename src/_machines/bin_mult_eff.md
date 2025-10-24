---
title: Multiplieur binaire efficace
init-word: "0110111|11101"
machine: binary_multiplier_efficient
excerpt: Multiplie deux entiers écrits en binaire.
etats: 16
rubans: 3

---
Cette machine prend en entrée deux entiers en binaire, séparés par un `|`.

La machine calcule le produit de ces entiers, de manière efficace. 

L'algorithme effectué reproduit celui appris à l'école pour la base 10: pour calculer 1234×567, on calcule (1234×5)×100 + (1234×6)×10 + 1234×7.
