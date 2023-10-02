---
title: Efface le premier symbole
init-word: "_aababbaaababba"
machine: erase
excerpt: Efface le premier symbole du ruban, et décale l'entrée d'un cran vers la gauche
etats: 7
rubans: 1

hidden: true
---
Cette machine prend en entrée un mot non vide sur l'alphabet `{a,b}` précédé d'un espace. Elle efface le premier symbole, et décale l'entrée d'une case vers la gauche, pour se ramener à un ruban constitué d'un mot précédé d'un (seul) espace. Cette machine termine avec la tête de lecture sur la première case du ruban.
