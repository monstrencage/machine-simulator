---
title: Pas de triple lettre
init-word: "abaabbaabb"
machine: auto_no_triple
excerpt: Mots qui ne contiennent pas trois occurences successives de la même lettre.
etats: 3
rubans: 1
type: automate
hidden: true
---
Cet automate déterministe reconnait le langage des mots `w` sur l'alphabet `{a,b}` qui ne contiennent aucun motif constitué de trois occurences successives de la même lettre. Autrement dit, les mots qui ne contiennent ni `aaa` ni `bbb`.
