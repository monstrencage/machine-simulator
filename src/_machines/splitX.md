---
title: Insérer `X` au milieu
init-word: "_aababb"
machine: split_X
excerpt: Insère un `X` au milieu d'un mot sur l'alphabet `{a,b}`.
etats: 12
rubans: 1
hidden: true
---
Cette machine deterministe prend en entrée un mot sur l'alphabet `{a,b}`, rejette les mots de longueur impaire, et pour les mots de longueur paire insère le symbole `X` entre les deux moitiés du mot. Par exemple, le mot `abba` est transformé en `abXba`.
