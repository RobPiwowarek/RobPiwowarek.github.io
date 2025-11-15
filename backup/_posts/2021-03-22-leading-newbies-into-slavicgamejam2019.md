---
title: "Leading inexperienced team of 7 into SGJ2019"
categories:
    - GameDev
tags:
    - sgj2019
    - leading
    - game jam
    - happy tree enemies 
    - gamedev
toc: true
toc_sticky: true
---
# How it started
It was a beautiful day outside, birds were singing, flowers were blooming - on days like this, adults like us ... should be working our boring daily routines.  
  
Instead, after the success of [Quak](https://robpiwowarek.github.io/projects/quak) during my past company's hackaton, we decided to create a team and attend Slavic Game Jam 2019 in Summer... and then we went on with our daily routine.

Some people couldn't join our quest for glory in the jam but with some *[persuasion](https://cdn.24.co.za/files/Cms/General/d/8025/7047b8885cbe4e0dac877dfee9fbc6c3.jpg)* we eventually assembled 7 members for the team.

# The team 
With the team of willing people assembled it was time to split the roles and see who could do what kinds of job, but hey when you are working at a JVM/Java-focused company, and you are going into a game jam you take what you can get.

## Robert 
Me, myself and I. 
- Some experience from my own unfinished projects in Unity3D
- The experience of slavic game jam from 2017
  
Being that highly qualified there was not the slightest doubt that I would be the leader.

## Eryk 
- No experience making games in professional engines
- Some experience making games in java during university times
- Likes to make music
- Not afraid of math
- Can draw

Perfect.

## Maja 
- Unrivalled optimism and cheerfulness
- Can draw
- No experience with Unity

Great this would offset my pessimism. 

## Filip 
- Can draw
- Can make music
- Has ideas

Another good addition to the team.

## Hubert 
- Has hobbyist experience making games (not with Unity though)
- Can do things he is assigned to
- Has xbox controllers we can use during development and showcase
- Likes to work with a camera/controls in games

Good, good.

## Daniel 
- No experience making games but some experience using Unity from a very long time ago

Once again, a great addition to the team.

## Kasia 
- Makes great art
- No experience making games though

We can use all the art we can get.
  
It seems that actually from the art's perspective we are quite well set, our skills in handling Unity and making games in general leave much to be desired.
We can improve that though.
![team](/assets/images/slavic2019/team.png)
# Preparation
Since 6 out of 7 people, effectively haven't touched Unity ever the first thing to do was to have a workshop/lecture about it.  

I made about 2-hour long introductory workshop to Unity where I helped solve problems with Unity to people who have downloaded it for the first time, introduced the concept of ECS, explained some basic principles regarding working with Unity like: 
- FixedUpdate, Update
- Monobehaviour 
- Collisions
- Basic Physics with Rigidbody
- 2D features like tile editor, 2d animations by dragging and dropping images into editor
- Movement
- Scenes 
- Gave links to Brackeys for further learning

The feedback was generally positive - seems my workshop helped introduce the team to Unity, our chances for finishing a game during the game jam increased - great.  

# Day 1
Alas, the first day of the jam was upon us - and the theme was announced: growth.   
  
We did cheat a little by having a discussion about what kind of game we would like to make before the jam - and luckily it matched the theme. Thus far things were going smoothly, but that blessed peaceful period of time would not last for long.

## The problems
Soon came the issues that were unexpected to me before the jam.

### 1. Having agreed on a specific idea doesn't mean team members will know what game to make
The first day there were a lot of issues with a sort of "lack of direction". Little details that I thought were unnecessary at this stage of development started to come out:
- how are the turrets/towers (pears) supposed to work? What stats should they have? What effects?
- what kind of enemies do we want to have?
- how should they behave?
- what are we defending, what's the objective, what's the feel of the game?

They all emerged before we had any code in place. I personally wanted to give the team creative freedom to freely develop the game in any direction they want - so that no one feels like they are doing something they don't want to - we were supposed to be doing this for fun after all.
When working with a team of essentially only backend programmers that proved to be a terrible assumption on my part - no one minded being told what to do exactly, but the lack of above-mentioned details led to very slow development because the team couldn't quite imagine the game and how things could work.

### 2. Double Check versions of software you download
Not having touched Unity for some time I made a grave mistake of just rolling the latest version UnityHub allowed me to download. I didn't realize that "a" at the end of it meant - "alpha". While on my machine it was fine it caused problems for one or two team members who experienced multiple crashes.
Another downside of alpha versions is reduced or lack-of documentation or potentially moved/deprecated APIs which introduce confusion when looking for help on either stackoverflow or google - we thought about introducing coop over the net for the game but couldn't do that because of some API disappearing from that version.
  
Mistake on my part - no one else to blame here.

### 3. The good developers
Having great developers in the team meant that the code quality is very high, the code is written in a cleaner way, more reusable, readable way. The code tends to be more carefully thought out. What's not to love?  
  
Well, the cruel, brutal reality of the game jam of course. The deadline is effectively less than 48 hours, more like 36 or less, and we were in agreement that we didn't want to pull an all-nighter.
  
Given so little time to develop a game - we don't have time to waste on a pretty, complex inheritance model or smart system figuring out the placement and level of tree upgrades. The team, used to producing good code, had trouble adapting to the harsh reality.
  
### 4. Too many cooks spoil the broth
7 people on a game jam is a lot. Separation of tasks, potential merge errors, gathering feedback, ideas and discussions take way more time than in smaller teams. It is also way harder to monitor the progress of everyone as your focus tends to shift towards people who need help first, sometimes it would pile up.

### 5. Inexperienced leadership
Not having any prior experience in leading ... anything and wanting people to have a genuinely good time made it extremely difficult to make clear decisions on how certain systems should work.
  
We finished the first day with minimal progress, movable player character and some art with other stuff being still under development.

# Getting it together
After most team members went home to sleep, it was time for reflection:
- the progress was unsatisfactory
- the direction was hardly existent
- we had a long way to go before this project could be even called a game
- we lacked the crucial system for the game -> tree growth

It was clear that the team still didn't really "see" or "feel" the game yet, and it was high time for changes and decisions, or we wouldn't be able to finish the game in time.
  
Overnight I prototyped a very simple and very bad (but working!) tree upgrade system, I made some decision on what Pears would do, where they could be placed and had some basis for the main scene and what kind of enemies would be there. I assigned tasks to team members and hoped they would be alright with them. You could say I finally did my job as a leader/

# Day 2
Morning came, and the team assembled once again - I showcased the systems that got created overnight and explained tasks to members. I supervised the development of all features by sitting with people who had issues and sorting them out together. I moved from one person to the other. A few hours passed and the game started to manifest and the development was actually going smoothly. I had hardly any time to do the tasks I assigned myself.
  
The morale was high, the team was excited as the game was being finalized. Everyone was hard at work. At the jam people from other teams started visiting everyone to see how they were doing, we received positive comments which helped to further boost morale.
  
We eventually did the finishing touches the next morning, and the game was finally finished - just in time for the showreel to start.
<iframe width="560" height="315" src="https://www.youtube.com/embed/DOQPr5Ckx-E" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  
Watching all these games after so much hard work felt magical, it was a great experience.

# Finished Game
You can preview our game - Happy Tree Enemies [here](https://robpiwowarek.github.io/projects/hte).
  
Thus, SGJ2019 came to an end, satisfied and proud we returned to our homes, as we had work the next day.

![slavic](/assets/images/slavic2019/group.png)
# Conclusions
Some of the things I learned over this jam:
- No leadership is worse than bad leadership, it is always better to have at least some direction, especially if you can imagine the whole game
- Just because you have certain ideas or decision it does not mean you are taking away the fun from the team members
- Voicing your concerns with the team is good but if you are the leader probably no one will make decisions for you
- As a leader, people look up to you for direction and "orders", without them, people are often left confused, and then the project might not "stick" together
- It really pays off to sit down with people and help them with their problems, it calms them down, if you see someone going into a rabbit hole you can put them on a right track
- Not every idea is going to make it into the final game, try to make the scope of your project reasonable given the time requirements
- For a game jam, prioritize simple/dumb/boilerplate-ish solutions over complex/smart code, time is of the essence
- If you are working with your friends that you know well - you know what tasks will be good for them, try to make the best use of their capabilities
- Double or triple check versions of software it may save you a lot of avoidable problems