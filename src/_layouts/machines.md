---
layout: single
classes: wide
author_profile: true

custom_css:
- general
- turing
- turing-colors

custom_js:
- vis/vis-network.min
- turing
- render
- parserElts
- parserTM
- parserAutomaton
- graphOfTm
- simulator

---
{% if page.type %}
{% if page.type == "automate" %}
{% include auto-details.html machine = page%}
{% else %}
{% include machine-details.html machine = page %}
{% endif %} 
{% else %}
{% include machine-details.html machine = page %}
{% endif %}

{{page.content | markdownify }}

{% assign machine-path = page.machine | prepend: "machines/" | append: ".machine" %}
{% capture machine %}
{% include_relative {{machine-path}} %}
{% endcapture %}

{% if page.type %}
{% if page.type == "automate" %}
{% include display-automaton.html init-word = page.init-word init-machine = machine %}
{% else %}
{% include display-machine.html init-word = page.init-word init-machine = machine %}
{% endif %}
{% else %}
{% include display-machine.html init-word = page.init-word init-machine = machine %}
{% endif %}
