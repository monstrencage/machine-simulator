---
title: À propos
author_profile: true

layout: single
classes: wide

---

Ce simulateur est l'oeuvre de Paul Brunet.

Le code source est disponible sur GitHub : [machine-simulator](https://github.com/monstrencage/machine-simulator/).

<div class="liste-institutions">
{% for i in site.data.institutions %}
   <div class="institution">
   <a href="{{i.url}}" title="{{i.text}}">
      <img src='assets/images/{{i.logo}}'>
   </a>
   </div>
{% endfor %}
</div>

