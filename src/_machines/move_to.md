---
title: Avancer jusqu’à un symbole 
init-word: "_aababbalaabablbla"
machine: move_to
excerpt: Déplace la tête de lecture à la recherche du symbole `l`.
etats: 3
rubans: 1

hidden: true
---
Cette machine prend en entrée un mot sur l'alphabet `{a,b,l}` précédé d'un espace et avance la tête de lecture jusqu'à la case précédant la première occurrence du symbole `l`. Les mots ne contenant pas ce symbole sont rejetés.
