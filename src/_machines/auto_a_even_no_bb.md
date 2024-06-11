---
title: Nombre pair de a ou absence du motif bb
init-word: "abaabbabbaba"
machine: a_even_no_bb
excerpt: Mots qui ont soit un nombre pair de `a`, soit qui ne contiennent pas le motif `bb`.
etats: 6
rubans: 1

type: automate
hidden: true
---
Cet automate non-déterministe reconnait le langage des mots sur l'alphabet `{a,b}` qui :
- soit ont un nombre pair d'occurences du symbole `a`,
- soit qui *ne peuvent pas* s'écrire `ubbv`.
