---
title: Insère un a à gauche du mot d'entrée
init-word: "_bbbabababb"
machine: insert_before
excerpt: Préfixe le mot d'entrée d'un symbole `a`.
etats: 6
rubans: 1

hidden: true
---
Cette machine prend en entrée un mot `w` sur l'alphabet `{a,b}` précédé d'un espace, et produit en sortie le mot `aw`, précédé d'un (seul) espace.  Cette machine termine avec la tête de lecture sur la première case du ruban.
