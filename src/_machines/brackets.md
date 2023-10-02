---
title: Mots bien parenthèsés
init-word: "_aa(a(a)((a)a((a)))a)a(a)"
machine: brackets
excerpt: Détecte les mots sur l'alphabet `{(,),a}` qui sont bien parenthèsés.
etats: 4
rubans: 1
hidden: true
---
Cette machine deterministe prend en entrée un mot sur l'alphabet `{(,),a}` précédé d'un espace et teste si ce mot est bien parenthèsés.
