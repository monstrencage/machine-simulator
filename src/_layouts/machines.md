---
layout: single
classes: wide
author_profile: true

custom_css:
- turing
- turing-colors

external_js:
- "https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"

custom_js:
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
