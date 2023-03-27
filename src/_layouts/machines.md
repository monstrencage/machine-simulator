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
- graphOfTm
- simulator

---

{{page.content | markdownify }}

{% assign machine-path = page.machine | prepend: "machines/" | append: ".machine" %}
{% capture machine %}
{% include_relative {{machine-path}} %}
{% endcapture %}

{% include display-machine.html init-word = page.init-word init-machine = machine %}
