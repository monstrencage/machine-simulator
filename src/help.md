---
title: Manuel du simulateur de machines de Turing

author_profile: true

layout: single
classes: wide

toc: true
toc_label: "Table des matières"
toc_icon: "cog"
toc_sticky: true

dsada: ok
---



Ce simulateur de Machines de Turing vous permet de visualiser l'exécution d'une machine de Turing *déterministe* manipulant un nombre arbitraire de rubans *bi-infinis*.
Pour ce faire, spécifiez une machine dans l'éditeur ci-contre. 
La syntaxe du langage de spécification est décrite plus bas.
Vous pouvez ensuite compiler cette machine pour l'exécuter, à l'aide du bouton *Compiler*.

La spécification de la machine se fait en deux parties : l'en-tête et la liste de transitions.

# En-tête
L'en-tête de la machine est composé de paires `propriété : valeur`. 
Les propriétés prises en charge (pour le moment) sont les suivantes :
- `init` (obligatoire) : spécifie l'état initial de la machine;
- `accept` (obligatoire) : spécifie l'état final de la machine;
- `name` (optionnel) : défini le nom de la machine pour affichage;
- `output` (optionnel) : défini le ruban de sortie. La valeur d'`output` doit être un entier compris entre 1 et le nombre de rubans de la machine. Par exemple, pour une machine à trois rubans, les valeurs possibles sont 1, 2, et 3.

# Transitions
Après l'en-tête, le compilateur cherche une liste de transitions.
Il détecte le nombre de rubans à partir des transitions, et rejette une spécification si le nombre de rubans varie d'une transition à l'autre.
Une transition est spécifiée comme suit :
```
p,a[1],a[2],...,a[n]
q,b[1],b[2],...,b[n],d[1],d[2],...,d[n]

```
où:
- `p` et `q` sont respectivement l'état source et l'état cible de la transition;
- `a[1],...,a[n]` et `b[1],...,b[n]` sont des séquences de symboles de l'alphabet de ruban de la machine. 
- `d[1],...,d[n]` sont des directions de déplacement du ruban.

Les états, symboles, et directions sont des chaînes de caractères ne contenant pas de virgule (`,`). Les symboles doivent de plus être de longueur `1`, et les directions peuvent uniquement prendre les valeurs `<` (gauche), `>` (droite), ou `-` (immobile).


