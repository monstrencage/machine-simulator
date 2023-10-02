---
title: Efface le ruban jusqu'au premier a
init-word: "_bbbabababba"
machine: erase_until
excerpt: Efface tous les `b` en début de ruban jusqu'au premier `a` inclus, avant de recaler le mot d'entrée
etats: 7
rubans: 1

hidden: true
---
Cette machine prend en entrée un mot non vide sur l'alphabet `{a,b}` précédé d'un espace. Elle efface le plus petit préfixe se terminant par un `a` (et rejette les mots ne contenant pas `a`. Ensuite, elle décale l'entrée vers la gauche, jsuqu'à se ramener à un ruban constitué d'un mot précédé d'un (seul) espace. Cette machine termine avec la tête de lecture sur la première case du ruban.
