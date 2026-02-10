---
layout: single
title: "Creature Creation"
permalink: /projects/creature
layouts_gallery:
  - url: /assets/images/projects/creature/creature1.png
    image_path: /assets/images/projects/creature/creature1.png
    alt: "creature screenshot 1"
  - url: /assets/images/projects/creature/creature2.png
    image_path: /assets/images/projects/creature/creature2.png
    alt: "creature screenshot 2"
  - url: /assets/images/projects/creature/creature3.png
    image_path: /assets/images/projects/creature/creature3.png
    alt: "creature screenshot 3"

toc: true
author_profile: true

---
<p align="center">
  <img src="https://raw.githubusercontent.com/robpiwowarek/robpiwowarek.github.io/master/assets/images/projects/totallynotpokemon2.png">
</p>


## Idea/Concept
[Creature](https://github.com/RobPiwowarek/WpamGame) as a concept is a 2D mobile multiplayer game where you create, battle and improve your creature represented by a 2D sprite. 
It would feature both PvE and PvP turn based combat, the ability to define your own attacks and their animations.   

The motivation was to create a sort of framework for players to have their own unique experiences in - by including the ability to set up their own "servers". If implemented well friends could play within their own groups or with the whole world if they wanted to.
One could potentially create a monster representing D&D character/enemy, or a complex attack system for their creature and aim to have the coolest one around (and show off their creativity).

Alas, it was a project for mobile application classes at **Warsaw University of Technology**, and it involves some unresolvable problems, so a full version never came to be - instead there is a proof of concept of sorts with heavily cut features.
## Actual Implementation
The actual implementation was created in **Unity3D** and implements the following features:
- single player combat with one enemy only (Rocky)
- creature creation (sprite)
- creature grow (stats distribution)
- fixed actions in battle with fixes animations
- savable and editable creature

## Gameplay
Gameplay consists of 3 main points:
### Create
![create](/assets/images/projects/creature/creature1.png)
A player draws the sprite representing their character.
### Grow
![grow](/assets/images/projects/creature/creature2.png)
A player assigns stats to his creation, once saved they cannot be changed - gaining levels grants points to spend on specific stats. 
### Battle
![battle](/assets/images/projects/creature/creature3.png)
A player can battle with Rocky to test out their creation's capabilities. A turn based combat with a battle till death (or run).

## Backend
There was a terrifyingly simple [backend](https://github.com/RobPiwowarek/WpamBackend) created in **spring boot** and **java** for the purpose of this PoC.
  
It allows for extremely simple registration/login and storing/retrieving data related to a player's creature.

## A few words on problems
As mentioned in the Idea/Concept section there proved to be unsolvable problems which I want to elaborate on:
### Drawing on mobile
Is pretty much impossible to do correctly (so that user experience of drawing is good and that players can draw accurate sprites for their creatures).
### How to stop people from drawing dicks?
In a multiplayer environment of unrestrained creativity there are bound to be... trolls or people drawing Hitler or human genitalia as sprites for lulz. While the ability to draw them on their own isn't the worst thing it would cause legal problems and reduce the overall player-base.
Moderation could be employed to fight against such cases, but everyone would suffer from having to wait until their sprite is approved. 
### Simple and comprehensible ability creation system
How does one design a system that allows you to create whatever 2D animation you want. Even if it's possible to create one that actually feels good to use on mobile, it would still suffer from the previous 2 problems.

## Credits (the Team)
- Robert Piwowarek

You can view the gameplay in the video below:
<iframe width="560" height="315" src="https://www.youtube.com/embed/aqPHT-eFdLk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

{% include gallery id="layouts_gallery" caption="Gallery" %}