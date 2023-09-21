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
Vous pouvez ensuite compiler cette machine pour l'exécuter, à l'aide du bouton <button class="btn btn--primary txt" disabled><i class="fas fa-cog"></i>Charger machine</button>.

# Éditeur

La spécification de la machine se fait en deux parties : l'en-tête et la liste de transitions.
La spécification se fait dans une zone de texte équippée d'un module de coloration syntaxique. Deux styles de coloration sont disponibles via un bouton dans le coin supérieur droit de cette zone d'édition :
- <button class="btn btn--primary" title="dark mode" disabled><i class="fas fa-moon"></i></button> mode sombre.
- <button class="btn btn--primary" title="light mode" disabled><i class="fas fa-sun"></i></button> mode clair.

## En-tête
L'en-tête de la machine est composé de paires `propriété : valeur`. 
Ces propriétés peuvent être spécifiées en français ou en anglais : il y a donc deux choix pour chaque mot-clé. 
Si la décence et le bon goût exigent une certaine cohérence dans le choix d'une langue fixe pour toutes les propriétés, le compilateur est plus laxiste et permet de spécifier certaines propriétés dans une langue, et d'autres dans une autre.
Les propriétés prises en charge (pour le moment) sont les suivantes :
- `init/initial` (obligatoire) : spécifie l'état initial de la machine;
- `accept/final` (obligatoire) : spécifie les états finaux de la machine, séparés par des virgules;
- `name/nom` (optionnel) : défini le nom de la machine pour affichage;
- `output/sortie` (optionnel) : défini le ruban de sortie. La valeur de cette propriété doit être un entier compris entre 1 et le nombre de rubans de la machine. Par exemple, pour une machine à trois rubans, les valeurs possibles sont 1, 2, et 3.
- `option` (optionnel) : permet de spécifier des options supplémentaires. Il est possible d'utiliser plusieurs déclarations d'option dans la même machine. Les options supportées pour le moment sont:
  - `non-det` : interprète la machine de manière non-déterministe. Quand plusieurs transitions sont disponibles, une pop-up demande à l'utilisateur de choisir laquelle exécuter. Quand la machine est bloquée, le simulateur retournera au choix le plus récent, et demandera à l'utilisateur de changer son choix. Ainsi la machine effectue un parcours en profondeur de l'arbre d'exécution, avec l'utilisateur comme oracle pour choisir l'ordre d'exploration à chaque noeud.
  - `eager` : modifie la condition d'acceptation de la machine. En l'absence de cette option, une machine s'arrète dès qu'elle visite un état acceptant, ou bien si elle est bloquée. Lorsque l'option `eager` est activée, la machine ne s'arrète que si elle est bloquée : le passage par un état acceptant ne suffit pas à accepter l'entrée s'il n'est que transitoire.

## Transitions
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


Considérons par exemple la transition suivante :
```
q0,b,_
q1,b,_,>,<
```
Cette transition, qui suppose une machine à deux rubans, peut être activée lorsque l'état courant est `q0`, que le premier ruban affiche le symbole `b`, et que le second ruban  affiche une case vide. 
Lors de son exécution, elle change l'état courant en `q1`, efface le `b` du premier ruban, écrit un `a` sur le second, et déplace la première tête de  lecture vers la droite et la seconde vers la gauche.

## Syntaxe étendue
Les transitions peuvent utiliser une syntaxe plus riche, pour rendre la spécification plus concise (et donc plus lisible).

### En sortie : référence à l'entrée
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

### En entrée : plage de symboles
{: #spec:plage }
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

### Les deux à la fois : avec de grand pouvoirs...
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

## Spécification d'automates
{: #spec:auto }

Les explications ci-dessus couvrent la spécification de machines de Turing. Les automates acceptés par le [simulateur d'automates](/automate/) sont spécifiés de manière similaire, avec néanmoins quelques différences.

### En-tête

Les options `sortie/output` et `option: eager` ne sont pas disponibles pour les automates.

### Transitions

Les transitions d'un automates s'écrivent en une seule ligne:
```
p,a,q
```
où `p` et `q` sont des états, et `a` est soit un symbole, soit une plage comme expliqué [plus haut](#spec:plage).


# Simulateur

Une fois la machine souhaitée spécifiée, on peut la charger dans le simulateur grâce au bouton <button class="btn btn--primary txt" disabled><i class="fas fa-cog"></i>Charger machine</button> présent en bas de l'éditeur.
Le graphe de la machine est alors généré, et est affiché dans une fenêtre dans la partie inférieure du simulateur (sous les rubans).

Il convient alors de saisir un mot d'entrée, qui peut être chargé à l'aide du bouton <button class="btn btn--primary txt" disabled><i class="fas fa-undo"></i>Charger mot d'entrée</button>.
Ce mot est alors écrit sur le premier ruban de la machine, et la tête de lecture de ce ruban est placée sur le symbole le plus à gauche de ce mot (si l'entrée est non vide).

On peut alors simuler l'exécution de la machine, en utilisant les boutons de contrôle :
- <button class="btn btn--primary" title="Étape suivante" disabled><i class="fas fa-step-forward"></i></button> : Effectue une étape de calcul.
- <button class="btn btn--primary" title="Exécuter" disabled><i class="fas fa-fast-forward"></i></button> : Effectue des étapes de calcul autant que possible, en enchaînant une étape après l'autre.
- <button class="btn btn--primary" title="Étape précédente" disabled><i class="fas fa-step-backward"></i></button> : Annule la dernière étape de calcul, en revenant à la configuration précédente.
- <button class="btn btn--primary" title="Rembobiner" disabled><i class="fas fa-fast-backward"></i></button> : Exécute la machine à rebour, en annulant successivement les dernières transitions exécutées.
- <button class="btn btn--primary" title="Arrêter l'exécution" disabled><i class="fas fa-stop"></i></button> : Interrompt l'exécution, qu'elle se déroule normalement (<button class="btn btn--primary" title="Exécuter" disabled><i class="fas fa-fast-forward"></i></button>) ou bien à rebour (<button class="btn btn--primary" title="Rembobiner" disabled><i class="fas fa-fast-backward"></i></button>).
- <button class="btn btn--primary" title="Maximiser le simulateur" disabled><i class="fas fa-expand-arrows-alt"></i></button> : Fait passer le simulateur en mode plein-écran. Lorsque cette fonctionnalité est activée, le bouton devient <button class="btn btn--primary" title="Minimiser le simulateur" disabled><i class="fas fa-compress-arrows-alt"></i></button>, permettant ainsi de revenir à l'apparence par défaut.

Un dernier instrument de contrôle est proposé: le règlage de la vitesse d'exécution automatique. 
Ce règlage s'effectue à l'aide de l'outil suivant :
<div class="centered">
<div class="speedo dummy"><label class="elt" for="speed-select"><i class="fas fa-tachometer-alt"></i>vitesse</label><select id="speed-select"><option value="0" label="très lente"></option><option value="1" label="tranquille"></option><option value="2" label="confortable"></option><option value="3" label="rapide"></option><option value="4" label="véloce"></option><option value="5" label="youhouhou!"></option></select></div>
</div>

<!-- <div id="dummy_speedo" class="speedo dummy"> -->
<!--   <div class="elt"> -->
<!--     <i class="fas fa-tachometer-alt"></i> -->
<!--     vitesse :<div class="speedtxt">confortable</div> -->
<!--   </div> -->
<!--   <input class="speedo" type="range" list="speeds" -->
<!--   min="0" max="5" value="2" disabled /> -->
<!--   <datalist id="speeds"> -->
<!--     <option value="0" label="très lente"></option> -->
<!--     <option value="1" label="tranquille"></option> -->
<!--     <option value="2" label="confortable"></option> -->
<!--     <option value="3" label="rapide"></option> -->
<!--     <option value="4" label="véloce"></option> -->
<!--     <option value="5" label="youhouhou!"></option> -->
<!--   </datalist> -->
<!-- </div> -->

La vitesse choisie correspond à une durée entre deux étapes. Les vitesses proposées correspondent aux durées de latence suivantes:
- **très lente** : 2 secondes entre chaque étape
- **tranquille** : 1 seconde entre chaque étape
- **confortable** : 3/4 de seconde entre chaque étape
- **rapide** : 1/2 seconde entre chaque étape
- **véloce** : 1/10 de seconde entre chaque étape
- **youhouhou!** : pas de latence, le simulateur va aussi vite qu'il peut.
