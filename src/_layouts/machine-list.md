---
layout: single
classes: wide
author_profile: true

custom_css:
- general
---

{{page.content | markdownify }}

{% assign mycollection = site.collections | where: "label", page.collection | first %}
{% assign machines = mycollection.docs | sort: "date" %}
{% for m in machines %}
   {% include machine-item.html machine = m %}
{% endfor %}
