---
title: "Portfolio"
layout: splash
permalink: /portfolio
date: 2021-03-18T11:48:41-04:00
header:
  overlay_color: "#000"
  overlay_filter: "0.5"
  overlay_image: /assets/images/splash-portfolio.jpg
  actions:
    - label: "Github"
      url: "https://github.com/RobPiwowarek"
excerpt: "You will find all sorts of games here - and eventually other projects. Be sure to check out my github profile to see all the repositories that I have."
intro:
  - excerpt: 'Below you will find some of the more interesting projects that I have been a part of:' 
    
feature_row:
  - image_path: /assets/images/projects/quak-logo.gif
    alt: "placeholder image 1"
    title: "Quak"
    excerpt: "2D PvP Shooter created in **libgdx** loosely inspired by liero. Developed during a hackaton at **TouK**"
    url: "/projects/quak"
    btn_label: "Read More"
    btn_class: "btn--primary"
  - image_path: /assets/images/projects/hte.png
    alt: "placeholder image 2"
    title: "Happy Tree Enemies"
    excerpt: "2D Tower Defense created in **Unity3D** where growing your tree expands your base's capabilities. Developed during **Slavic Game Jam 2019**"
    url: "/projects/hte"
    btn_label: "Read More"
    btn_class: "btn--primary"
  - image_path: /assets/images/projects/bullethell.png
    alt: "placeholder image 2"
    title: "Bullet Hell"
    excerpt: "2D Bullet Hell created in **Unreal Engine 4** for gamedev classes at **Warsaw University of Technology**"
    url: "/projects/bullethell"
    btn_label: "Read More"
    btn_class: "btn--primary"
    
feature_row4:
  - image_path: /assets/images/projects/asteroids.png
    alt: "placeholder image 2"
    title: "Asteroids"
    excerpt: '3D orthogonal asteroids game, shoot at rocks - evade rocks created in **Unreal Engine 4** in one day'
    url: "/projects/asteroids"
    btn_label: "Read More"
    btn_class: "btn--primary"
    
feature_row2:
  - image_path: /assets/images/projects/totallynotpokemon2.png
    alt: "placeholder image 2"
    title: "Creature Creation"
    excerpt: 'POC 2D Sprite drawing, name it, cherish it, level it, battle with it. Android game created in **Unity3D** for mobile application development classes at **Warsaw University of Technology**'
    url: "/projects/creature"
    btn_label: "Read More"
    btn_class: "btn--primary"
feature_row3:
  - image_path: /assets/images/projects/blob.png
    alt: "placeholder image 2"
    title: "Blob blop"
    excerpt: '3D Puzzle-solving game created in Unity3D for **Slavic Game Jam 2017**'
    url: "/projects/blob"
    btn_label: "Read More"
    btn_class: "btn--primary"
---

{% include feature_row id="intro" type="center" %}

{% include feature_row %}

{% include feature_row id="feature_row4" type="right" %}

{% include feature_row id="feature_row2" type="left" %}

{% include feature_row id="feature_row3" type="right" %}
