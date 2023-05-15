---
title: Motif abba
init-word: "abaababbaab"
machine: detect_abba
excerpt: Teste si le mot d'entrée contient le motif `abba`
etats: 4
rubans: 1
---
Cette machine prend en entrée un mot `w` sur l'alphabet `{a,b}`. Elle l'accepte si et seulement si il existe une paire de mots `u` et `v` tels que `w=u abba v`.

