# MassSpringShader
WebGL Shader that implements a mass-spring physical simulation

<img src="https://raw.githubusercontent.com/amandaghassaei/MassSpringShader/master/img.png"/>

Live demo at <a href="http://git.amandaghassaei.com/MassSpringShader/" target="_blank">git.amandaghassaei.com/MassSpringShader/</a>

A physical simulation of a mesh of masses attached to their four nearest neighbors with springs and dampers. 
At each frame, the masses exert forces on each other and the resulting acceleration, velocity, and position of each mass (pixel) is solved via euler integration. 
Scrolling over with your mouse applies an upward force to the nearby pixels.
This simulation is equivalent to a <a href="https://en.wikipedia.org/wiki/Wave_equation" target="_blank">discrete, damped 2D wave equation</a>
or <a href="https://en.wikipedia.org/wiki/Cloth_modeling" target="_blank">cloth simulation</a>.

Requires only WebGL, no external libraries.

By <a href="http://www.amandaghassaei.com/" target="_blank">Amanda Ghassaei</a>, code on <a href="https://github.com/amandaghassaei/MassSpringShader" target="_blank">Github</a>.