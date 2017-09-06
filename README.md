# MassSpringShader
WebGL Shader that implements a mass-spring-damper physical simulation

<img src="massspringdamper.gif"/>

Live demo at <a href="http://git.amandaghassaei.com/MassSpringShader/" target="_blank">git.amandaghassaei.com/MassSpringShader/</a>

This is a physics simulation of a mesh of masses attached to their four nearest neighbors with springs and dampers, all running in a GPU fragment shader with WebGL.
In the simulation, each pixel on the screen is a mass in a 2D mesh.
At each frame, the masses exert forces on each other and the resulting acceleration, velocity, and position of each mass is solved via
<a href="https://en.wikipedia.org/wiki/Euler_method" target="_blank">Euler integration</a>.  The vertical displacement of the masses is indicated by the color
of the pixel, blue pixels have positive vertical displacement, white have negative displacement, and pink is zero displacement.
Scrolling over with your mouse applies an upward force to the nearby pixels.
The physics is equivalent to a <a href="https://en.wikipedia.org/wiki/Wave_equation" target="_blank">discrete, damped 2D wave equation</a>
or <a href="https://en.wikipedia.org/wiki/Cloth_modeling" target="_blank">cloth simulation</a>.  Masses at the edges of the screen are fixed with zero displacement,
making the simulation behave like a giant trampoline.

By <a href="http://www.amandaghassaei.com/" target="_blank">Amanda Ghassaei</a>, code on <a href="https://github.com/amandaghassaei/MassSpringShader" target="_blank">Github</a>.
