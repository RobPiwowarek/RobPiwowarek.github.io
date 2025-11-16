---
layout: default
title: Home
---

<div class="post-list">
    <h2>Latest Posts</h2>
    <ul>
        {% for post in paginator.posts %}
            <li>
                <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
                <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
                <p>{{ post.excerpt }}</p>
            </li>
        {% endfor %}

{% if paginator.total_pages > 1 %}
<div class="pagination">
  {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path | relative_url }}">&laquo; Prev</a>
  {% else %}
    <span>&laquo; Prev</span>
  {% endif %}

  {% for page in (1..paginator.total_pages) %}
    {% if page == paginator.page %}
      <em>{{ page }}</em>
    {% elsif page == 1 %}
      <a href="{{ site.paginate_path | relative_url | replace: 'page:num/', '' }}">{{ page }}</a>
    {% else %}
      <a href="{{ site.paginate_path | relative_url | replace: ':num', page }}">{{ page }}</a>
    {% endif %}
  {% endfor %}

  {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path | relative_url }}">Next &raquo;</a>
  {% else %}
    <span>Next &raquo;</span>
  {% endif %}
</div>
{% endif %}

    </ul>
</div>