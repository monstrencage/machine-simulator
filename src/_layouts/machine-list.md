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

<h2> Machines de Turing</h2>

{% for m in machines %}
{% if m.type %}
{% unless m.type == "automate" %}
{% include machine-item.html machine = m %}
{% endunless %} 
{% else %}
{% include machine-item.html machine = m %}
{% endif %}
{% endfor %}

<h2> Automates </h2>

{% for m in machines %}
{% if m.type %}
{% if m.type == "automate" %}
{% include auto-item.html machine = m %}
{% endif %} 
{% endif %}
{% endfor %}
