---
title: Manuel du simulateur de machines de Turing

author_profile: true

layout: single
classes: wide

toc: true
toc_label: "Table des matières"
toc_icon: "cog"
toc_sticky: true

custom_css:
- general
---



Ce simulateur de Machines de Turing vous permet de visualiser l'exécution d'une machine de Turing *déterministe* manipulant un nombre arbitraire de rubans *bi-infinis*.
Pour ce faire, spécifiez une machine dans l'éditeur. 
La syntaxe du langage de spécification est décrite plus bas.
Vous pouvez ensuite compiler cette machine pour l'exécuter, à l'aide du bouton <button class="btn btn__primary txt" disabled><i class="fas fa-cog"></i>Charger machine</button>.

La spécification de la machine se fait en deux parties : l'en-tête et la liste de transitions.

# En-tête
L'en-tête de la machine est composé de paires `propriété : valeur`. 
Ces propriétés peuvent être spécifiées en français ou en anglais : il y a donc deux choix pour chaque mot-clé. 
Si la décence et le bon goût exigent une certaine cohérence dans le choix d'une langue fixe pour toutes les propriétés, le compilateur est plus laxiste et permet de spécifier certaines propriétés dans une langue, et d'autres dans une autre.
Les propriétés prises en charge (pour le moment) sont les suivantes :
- `init/initial` (obligatoire) : spécifie l'état initial de la machine;
- `accept/final` (obligatoire) : spécifie l'état final de la machine;
- `name/nom` (optionnel) : défini le nom de la machine pour affichage;
- `output/sortie` (optionnel) : défini le ruban de sortie. La valeur de cette propriété doit être un entier compris entre 1 et le nombre de rubans de la machine. Par exemple, pour une machine à trois rubans, les valeurs possibles sont 1, 2, et 3.

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

Les états, symboles, et directions sont des chaînes de caractères ne contenant ni virgule (`,`), ni deux-points (`:`). Les symboles doivent de plus être de longueur `1` et ne pas contenir d'espace, et les directions peuvent uniquement prendre les valeurs `<` (gauche), `>` (droite), ou `-` (immobile).

Notons que le symbole `_` est réservé pour la valeur initiale contenue dans les cases du ruban. Dans le simulateur, ce symbole est représenté par un espace. Il peut néanmoins être utilisé dans le mot d'entrée (par exemple pour définir une entrée coupée en plusieurs mots).

# Syntaxe étendue
Les transitions peuvent utiliser une syntaxe plus riche, pour rendre la spécification plus concise (et donc plus lisible).

## En sortie : référence à l'entrée
Sur la ligne de sortie d'une transition (la seconde), on peut utiliser en lieu d'un symbole de ruban une référence à un symbole d'entrée.
Pour cela, on utilise la notation `$n`, où `n` est un entier compris entre 1 et le nombre de rubans.
Lorsque cette transition sera exécutée, le symbole présent sur le ruban `n` sera substitué à la référence.
Par exemple, la transition :
```
p,a,b
q,$2,$1,>,>
```
est équivalente à la transition suivante :
```
p,a,b
q,b,a,>,>
```

## En entrée : plage de symboles
Sur la ligne d'entrée d'une transition (la première), on peut utiliser en lieu d'un symbole de ruban une liste de symboles entre crochets.
Cette transition pourra être exécutée si le symbole courrant appartient à la liste spécifiée. 
Par exemple, la transition :
```
p,[ab]
q,_,>
```
est équivalente à la paire de transitions suivantes :
```
p,a
q,_,>

p,b
q,_,>
```

## Les deux à la fois : avec de grand pouvoirs...
Ces deux extensions peuvent être combinées, ce qui permet dans certains cas de réduire significativement la longueur des spécifications.
Par exemple, pour échanger le contenu de deux rubans, le premier contenant des `a` et des `b`, et le second des `0` et des `1`, on peut utiliser la spécification suivante :
```
q,[ab],[01]
q,$2,$1,>,>
```
au lieu de : 
```
q,a,0
q,0,a,>,>

q,a,1
q,1,a,>,>

q,b,0
q,0,b,>,>

q,b,1
q,1,b,>,>
```
Attention néanmoins en utilisant cette syntaxe, en particulier avec listes de symboles incluant `_`...
