---
title: Commence par ab et finit par bb
init-word: "abaabbaabb"
machine: auto_abb_ndet
excerpt: Mots qui commencent par `ab` et finissent par `bb`.
etats: 5
rubans: 1
ndet: true
type: automate
hidden: true
---
Cet automate non-déterministe reconnait le langage des mots `w` sur l'alphabet `{a,b}` qui peuvent s'écrire à la fois `w=abu` et `w=vbb`, où `u` et `v` sont des mots.
