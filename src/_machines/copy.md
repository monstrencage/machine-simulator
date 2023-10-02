---
title: Duplique un préfixe
init-word: "_abbab0bbabbaaa"
machine: copy
excerpt: Copie le préfixe avant le symbole `0` du mot d'entrée, et ajoute à la fin `1` suivi de ce préfixe.
etats: 11
rubans: 1

hidden: true
---
Cette machine prend en entrée un mot `u0v`  précédé d'un espace, où `u` et `v` sont des mots sur l'alphabet `{a,b}`. Elle produit en sortie le mot `u0v1u`, précédé d'un (seul) espace.  Cette machine termine avec la tête de lecture sur la première case (vide) du ruban.
