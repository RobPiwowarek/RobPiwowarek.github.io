---
layout: default
title: Home
---

<div class="post-list">
    <h2>Latest Posts</h2>
    <ul>
        {% for post in site.posts %}
            <li>
                <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
                <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
                <p>{{ post.excerpt }}</p>
            </li>
        {% endfor %}
    </ul>
</div>