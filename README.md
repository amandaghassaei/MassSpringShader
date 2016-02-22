# MassSpringShader
WebGL Shader that implements a mass-spring physical simulation

A physical simulation of a mesh of masses attached to their four nearest neighbors with springs and dampers. 
At each frame, the masses exert forces on each other and the resulting acceleration, velocity, and position of each mass (pixel) is solved via euler integration. 
Scrolling over with your mouse applies an upward force to the nearby pixels. 

Requires only WebGL, no external libraries.

Demo here:
http://git.amandaghassaei.com/MassSpringShader/
