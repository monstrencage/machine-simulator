---
title: Insère un a à droite du mot d'entrée
init-word: "_bbbabababb"
machine: insert_after
excerpt: Suffixe le mot d'entrée d'un symbole `a`.
etats: 4
rubans: 1

hidden: true
---
Cette machine prend en entrée un mot `w` sur l'alphabet `{a,b}` précédé d'un espace, et produit en sortie le mot `wa`, précédé d'un (seul) espace.  Cette machine termine avec la tête de lecture sur la première case du ruban.
