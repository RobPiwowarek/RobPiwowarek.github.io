---
layout: default
title: Home
---

<div class="post-list">
    {% for post in site.posts limit:5 %}
    
    <a class="post-card" href="{{ post.url | relative_url }}">
        
        <div class="post-thumbnail">
            {% if post.image %}
                <img src="{{ post.image | relative_url }}" alt="{{ post.title }}">
            {% else %}
                <div class="no-image-placeholder">
                    &lt;/&gt; </div>
            {% endif %}
        </div>

        <div class="post-details">
            <span class="post-meta">{{ post.date | date: "%B %d, %Y" }}</span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
        </div>
        
    </a>
    {% endfor %}
</div>