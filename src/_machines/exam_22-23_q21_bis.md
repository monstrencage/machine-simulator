---
title: Détecter les carrés séparés d'un X
init-word: "aabbaXaabba"
machine: wXw
excerpt: Teste si le mot d'entrée est de la forme wXw
etats: 8
rubans: 1
---
Cette machine prend en entrée un mot `w` sur l'alphabet `{a,b,X}`. Elle l'accepte si et seulement si il peut s'écrire comme `w=uXu`, pour un mot `u` sur l'alphabet `{a,b}`.

