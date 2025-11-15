---
title: "Unity vs Unreal - beginner's perspective"
categories:
    - GameDev
tags:
    - unreal engine 4
    - ue4
    - game engine
    - unity 3d
    - c++
    - blueprint
    - c#
toc: true
toc_sticky: true
---
# Introduction
A lot of times on the Internet, if you are doing any kind of programming or gamedev, you may find posts like "WHaT sHoUlD I LeArN UnItY or UnReAl?".   

The problem can be further generalised - java vs kotlin, xml vs json, cats vs zio, x vs y. In pretty much every field (mostly) beginners ask questions regarding advancing of their careers and what choices to make (or what choices are the "correct" ones).
  
I want to offer my perspective on the problem of Unity vs Unreal (or choosing your first game engine in general). I have created enough games in either to feel as a qualified beginner - a perfect person to advise complete beginners.

I will focus on (in my opinion) most important things for newbies - the UI, learning curve, how good it feels to use, community and problems. 

DISCLAIMER: I will be evaluating default settings, if some issues can be fixed through change of settings - it doesn't really matter. To change a setting you must first be aware of it, when starting to learn there is no way you will be googling that.

# Unity3D
Unity was my first game engine (excluding Warcraft 3 World Editor, Rpg Maker and opening of CryEngine or Amazon's Lumberyard for a few minutes). It is an ECS (Entity-Component System) based Engine utilising C# (or JavaScript) for scripting. A notable game created in Unity is Hearthstone.

## UI

What I personally really liked about Unity is that the UI made sense and navigation felt natural even without any prior knowledge about working in it. The GUI was clean, nice colors, nothing to obscure your vision.
![unity](/assets/images/posts/unity/unity-gui.png)

Especially the main point of the engine (the ECS) is clearly visible on the right where you can just add additional components with a click of a button and have a specific configurable variable available underneath it. 

## Learning Curve
When I was learning Unity there were tutorial projects available (offered by Unity team) that held your hand while walking you through the very basics of the engine as you learned to make your first 3D Sphere move. 

These projects were most likely the easiest way to learn Unity but there are dozens of other tutorials available on the Internet (especially you should check out Brackeys youtube channel). Programming in C# is a lot like programming in Java and since I have Java background it was pretty easy to get used to it.

## Tools
Unity3D used to come with MonoDevelop (or something similar) IDE but it was common to replace it with Visual Studio. For some time now you can replace VS with Jetbrains Rider (these are the guys responsible for great JVM IDEs). 
The ability to have Jetbrains IDEs while making games is making me regret ever trying to do C++ in UE4 but more on that later in the post.

## Community and problems
There seems to be an opinion going on that trashy games come out of Unity and that you cannot make good games with it. I read an article about that some time ago. Author gave examples of a lot of people pouring into Unity and creating tons of crappy games (you WILL make shit games when learning an engine). 
I personally never thought of Unity like that, it's a tool that you can use to make whatever you want - whether good or bad. There is however a performance concern.

C# has Garbage Collection which (most likely) can (in some cases) decrease performance (while in memory-freeing phase). The language is also slower (by the nature of abstractions) than C++. If you are making games on your own these potential performance issues should not be a concern, focus on learning first.

While learning, you will find probably the biggest turn off from Unity - the community. There is nothing wrong with it (when it comes to the attitude of people) - however since Unity attracted a lot of IT newbies or people just trying to learn to make games, you will find a lot of bad or hacky solutions to various problems on the Internet. IMHO weird solutions make it harder to learn and make you spend more time trying to understand what's going on.

Unity's StackOverflow is (at least used to be) filled with such bad solutions that people cannot realistically learn from - yeah, it is possible to copy and paste fragments of code, but a hacky solution isn't good in the long run, especially from educational point of view.

# Unreal Engine 4 
UE4 is another professional 3D game engine associated with great games and very high quality graphics - industry standard, so to speak. 

![unitymeme](/assets/images/posts/unity/unitymeme.jpg)

Apart from a multitude of graphical effects, UE4 also features its signature visual scripting language - blueprints. It is the second professional engine that I have been learning. Overall the experience has been positive, however I did a course on UE4 Blueprints (on university), so I had the advantage of having a structured, incremental way of learning the reins.

## UI and its problems
The GUI of UE4 may seem kinda similar to that of Unity3D but there is a world of difference in functionality of the two. 

![ue4](/assets/images/posts/unreal/ue4.png)

The two most infuriating things about UE4 for me are: content browser (bottom) and object details (bottom right). Content browser is totally weird, it has multiple filters for types of objects that exist within the engine. For example, you can only see Blueprint classes - the catch is - it seems to ignore folder hierarchy while doing so. This isn't how I want to navigate my project. 
As a developer - I want to enter folders/packages and see their entire contents - not a selected type of objects from the entire hierarchy (you can do that, but it feels weird in UE4) - you don't manage your project this way, it just doesn't work. 
The little content hierarchy in the bottom left doesn't display classes or items in the folders - such a simple feature could be a huge help when looking for specific things.

Object details on the other hand have a sort of "built in subtree" of components that you will most likely hide by accident while making the other part of details the main focus. Unity and its components are way more clear (at least to me).

Honorable mention to navigating within the editor - it for whatever reason doesn't have the same kind of natural feeling that Unity had for me. Chances are if you learned to navigate the editor in Unity than UE4 is going to feel unintuitive and weird at first.

There are a lot of built in tools like the Niagara particle system editor or blueprint editor or curve editor (B-Splines) - they all feel like they have been added as an afterthought, someone really tried to "deploy them on production" quickly while pushing them with a knee. They don't have a clear space in the UI, they often open completely different windows, and I personally find them hard to navigate. They make it hard to comfortably use UE4 without multiple monitors.

## Learning Curve
Because of the aforementioned issues, I believe the learning curve is steeper than Unity's. There are a lot of small obstacles that need to be overcome to actually start using the engine. There will be even more problems described in next sections however I also got to say this:
despite all its problems - it is still much easier and quicker to develop a prototype, or a game that looks better than in Unity. UE4 offers a lot of features that find use in most types of games (for example ProjectileMovement component) that have great reusability.

Blueprints are comfortable to work with unless you are working in a team - then there are readability, messing up with other people's code and "code quality" issues not to mention potential performance concerns. 
## Tools
As a game developer using UE4 (in a team) you will most likely be forced to use C++ - this means using either Visual Studio or Visual Studio Code (there are ways to use other, simple editors but doing that brings its own inconveniences). 
Visual Studio and C++ are both archaic and bring with themselves a lot of issues/weird solutions that are not really seen in a Java world that I come from. 

1. You cannot create C++ classes directly in VS, you need to do that through UE4 - minor inconvenience, but it is there (you could probably be able to create these classes in VS, but it would bring you only further problems)  
2. Debugging in VS for whatever reason spawns another instance of UE4 instead of using existing, active one.  (maybe this is configurable, as a new developer you aren't going to be looking at configuration of tools)  
3. UE4 C++ is supposedly easier, assisted - there is a lot of code generation through macros and potential problems related to that (like you should remember not to include headers below .generated.h header, or it blows up)  
4. There are some weird levels of complexity within the editor's architecture (I remember reading something about there being a C# script running and analysing the c++ code and doing stuff with it) - this is most likely responsible for a lot of mentioned issues
5. Related to 4. I happened to crash the entire UE4 because I had a memory access violation (calling a method on a nullptr) in a constructor of some class - how does this even crash an editor is beyond me, I had to result to stackoverflow knowledge to be able to recover my project after that (UE4 wouldn't open my project, it would just keep crashing)

There is a lot of knowledge that you either gain through experience or get lucky while watching a tutorial that helps you avoid problems in the engine.
  
If you are only working with blueprints - then most of these problems are gone, and you can work inside just UE4. 
  
Don't get me wrong - Visual Studio is a great IDE with lots of helpful features - it's just that developer tools should be there to make your life easier and enable efficient work. VS is so big and it's integration with UE4 so weird that life is still pretty hard. There is some hope on the horizon as [Jetbrains](https://www.jetbrains.com/lp/rider-unreal) (the guys who make great IDEs in Java world) seems to want to release their IDE for UE4 in 2021.

## Community
No issues here - seems like there are lots of tutorials of decent quality (mostly for Blueprints, for C++ it is harder to find help - that leaves you with the documentation).

# Conclusions
I personally recommend Unreal Engine 4 long term. It will allow you to make quality games/prototypes faster (check out my [Asteroids](https://www.youtube.com/watch?v=CfBttDKMvOA) game that I have made in around 12 hours).
Developing with Unity and C# provides fewer problems than UE4 and C++ however if you are the only developer working on a project - you can just use Blueprints and have a similarly convenient experience.
Unity will feel way more intuitive and is definitely the better choice if you are preparing for your first game jam or don't want to go through a lot of headaches at start.
