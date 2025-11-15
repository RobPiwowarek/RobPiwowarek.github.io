---
title: "The book of shaders' GLSL's line drawing for dummies"
categories:
    - GameDev
tags:
    - opengl
    - glsl
    - shaders
    - smoothstep

toc: true
toc_sticky: true
---

Does time fly when you are having fun? It has been almost a year since my last post, and recently I started learning GLSL through [the book of shaders](https://thebookofshaders.com/) - it is an outstanding book with lots of understandable language, interactive examples etc. etc. 
But despite being that great, it eventually met me - and as a shader "dummy" I spent way too much time than I should have understanding SmoothStep examples. Hence, this post happened. 

I will attempt to untangle some of these examples so that if someone like me happens upon this post - maybe they won't spend multiple hours trying to understand these examples and will instead take 20 minutes.

# Drawing a Line
The first major issue I encountered while reading this book was chapter 5 [Shaping Functions](https://thebookofshaders.com/05/).

Where we can see the following ![glsl_drawing_line](/assets/images/opengl/glsl/bos_line.jpg)

There is a few things that were not immediately obvious, but I would like to start with what I expected from a code that draws a line:

1. If statements deciding whether we should color the line or not based on the coordinates so: 
2. ```
    if st.x == st.y
       gl_FragColor = vec4(0.0,1.0,0.0,1.0)
    else
       gl_FragColor = some background color
    ```
    - Instead, I got a smoothstep with some unclear behaviour.
    - A percent? (pct) value coming out of a plotting function.
    - Picking color deciding on x-coordinate but passing y (I understand that's just y = x, and it doesn't matter, but it was confusing nonetheless)
      ```
      float y = st.x;
      vec3 color = vec3(y);
      ```
    - Picking a color based on the aforementioned percent value
3. Variable names that mean something or comments that explain behaviours of functions

# Why was I Confused?
Because apparently, people who know how to write shaders seek mathematical equations and symmetries wherever they can to simplify code so that it is faster.

Seemingly a strange solution makes more sense for experienced people who are perhaps less of a dummy than I am... but a simpler (without optimisation) example would have been appreciated by complete beginners.

Also, years of writing Scala/Java code without any math equations in it with their long, self-explanatory naming conventions didn't really help here

# Coordinates
Something I haven't figured out exactly is the name of the variable *vec2 st*.

```
vec2 st = gl_FragCoord.xy/u_resolution;
```

According to previous chapters of **book of shaders**, this is the way to normalize coordinates.
Therefore, I would expect the variable to be called *n* or *normal*. I have no idea what *st* stands for, but I expect it to be something related to *standard*?
An extremely minor thing but definitely worth rehearsing.

# Background Gradient Color
What we are setting up as the background color is gradient, this is done by binding the *x* coordinate of *st* to the *y* variable and passing it into *color*.  
  
The resulting color variable will now linearly change its value between 0.0 and 1.0.
It is a little extra noise on top of other things mentioned below.

```
float y = st.x;

vec3 color = vec3(y);
```

# How Does Smoothstep Work?

The smoothstep function can be described as follows: ![smoothstep](/assets/images/opengl/glsl/smoothstep.png)

The InterpolationFunction applied to the x argument isn't important, but if you are interested in what it might look like, I recommend the video by [ArtOfCode](https://www.youtube.com/watch?v=60VoL-F-jIQ).

But wait a minute! in the code fragment above, isn't **Lowerbound > Upperbound**?   
Yes, and according to [the book of shader's documentation](https://thebookofshaders.com/glossary/?search=smoothstep):  
  
```Results are undefined if edge0 ≥ edge1.```

But in practice in the [editor](http://editor.thebookofshaders.com/) -  it looks like that kind of situation flips the function horizontally:
![normal-smoothstep](/assets/images/opengl/glsl/smoothstep-normal.png)  

![inverted-smoothstep](/assets/images/opengl/glsl/smoothstep-inverted.png)  

# The Plot Function
The original plot function has the seemingly out-of-place 0.02 lowerbound, and no, on top of that, uses an absolute argument.  
This may be a little confusing, but there is a way we can rewrite this.

```
float plot(vec2 st) {    
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}
```

can be replaced with the following:
```
float plot(vec2 st) {    
    return smoothstep(st.x - 0.02, st.x, st.y) - smoothstep(st.x, st.x + 0.02, st.y);
}
```

and in this particular situation the 0.02 constant visible in the function is the "width" of the line (or how "fat" the line is).

![alternative line draw](/assets/images/opengl/glsl/bos_line_alternative.png)

The return value of this function will be non-zero if and only if the difference between X and Y coordinates is within 0.02 distance - awfully close to a situation where X == Y.  
    
Can we be more explicit?
Yes!
A minimal understandable working example can be as simple as:
```
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;

    float y = st.x;

    vec3 color = vec3(y);

    // Plot a line
    if (st.x == st.y)
        gl_FragColor = vec4(vec3(0.0, 1.0, 0.0), 1.0);
    else
        gl_FragColor = vec4(color,1.0);
}
```

Which will yield the following result:
![alternative line draw_2](/assets/images/opengl/glsl/bos_line_alternative_2.png)

Other examples in the chapter use the same ideas as shown above.

# Final Words
I hope that other people learning shaders (who, just like me, were a little too slow to understand this chapter of the book of shaders) will find this article helpful and save them some time.
