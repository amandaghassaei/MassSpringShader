/**
 * Created by ghassaei on 2/20/16.
 */


var gl;
var canvas;
var lastState;
var currentState;
var frameBuffer;

var resizedLastState;
var resizedCurrentState;

var width;
var height;

var flipYLocation;
var renderFlagLocation;
var textureSizeLocation;
var mouseCoordLocation;

var paused = false;//while window is resizing

window.onload = initGL;

function initGL() {

    // Get A WebGL context
    canvas = document.getElementById("glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    canvas.onmousemove = onMouseMove;

    window.onresize = onResize;

    gl = canvas.getContext("webgl", { antialias: false}) || canvas.getContext("experimental-webgl", { antialias: false});
    if (!gl) {
        alert('Could not initialize WebGL, try another browser');
        return;
    }

    gl.disable(gl.DEPTH_TEST);
    gl.getExtension('OES_texture_float');

    // setup a GLSL program
    var program = createProgramFromScripts(gl, "2d-vertex-shader", "2d-fragment-shader");
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");

    // Create a buffer for positions
    var bufferPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0]
        ), gl.STATIC_DRAW);

    //constants
    var kSpringLocation = gl.getUniformLocation(program, "u_kSpring");
    gl.uniform1f(kSpringLocation, 2.0);
    var dSpringLocation = gl.getUniformLocation(program, "u_dSpring");
    gl.uniform1f(dSpringLocation, 1.0);
    var massLocation = gl.getUniformLocation(program, "u_mass");
    gl.uniform1f(massLocation, 10.0);
    var dtLocation = gl.getUniformLocation(program, "u_dt");
    gl.uniform1f(dtLocation, 1.0);

    //flip y
    flipYLocation = gl.getUniformLocation(program, "u_flipY");

    //renderflag
    renderFlagLocation = gl.getUniformLocation(program, "u_renderFlag");

    //set texture location
    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    mouseCoordLocation = gl.getUniformLocation(program, "u_mouseCoord");



    onResize();

    lastState = resizedLastState;
    currentState = resizedCurrentState;
    resizedLastState = null;
    resizedCurrentState = null;

    frameBuffer = gl.createFramebuffer();

    gl.bindTexture(gl.TEXTURE_2D, lastState);//original texture

    render();
}

function makeFlatArray(rgba){
    var numPixels = rgba.length/4;
    for (var i=0;i<numPixels;i++) {
        rgba[i * 4 + 3] = 1;
    }
    return rgba;
}

function makeRandomArray(rgba){
    for (var x=width/2-100;x<width/2+100;x++) {
        for (var y=height/2-100;y<height/2+100;y++) {
            var ii = (y*width + x) * 4;
            //rgba[ii] = 30;
        }
    }
    return rgba;
}

function makeTexture(gl){

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

function render(){

    if (!paused) {

        if (resizedLastState) {
            lastState = resizedLastState;
            resizedLastState = null;
        }
        if (resizedCurrentState) {
            currentState = resizedCurrentState;
            resizedCurrentState = null;
        }

        gl.uniform1f(flipYLocation, 1);// don't y flip images while drawing to the textures
        gl.uniform1f(renderFlagLocation, 0);

        step();


        gl.uniform1f(flipYLocation, -1);  // need to y flip for canvas
        gl.uniform1f(renderFlagLocation, 1);//only plot position on render
        gl.bindTexture(gl.TEXTURE_2D, lastState);


        //draw to canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, lastState);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }



    window.requestAnimationFrame(render);
}

function step(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentState, 0);

    gl.bindTexture(gl.TEXTURE_2D, lastState);

    gl.drawArrays(gl.TRIANGLES, 0, 6);//draw to framebuffer

    var temp = lastState;
    lastState = currentState;
    currentState = temp;
}

function onResize(){
    paused = true;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    gl.viewport(0, 0, width, height);

    // set the size of the texture
    gl.uniform2f(textureSizeLocation, width, height);

    //texture for saving output from frag shader
    resizedCurrentState = makeTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);

    resizedLastState = makeTexture(gl);
    //fill with random pixels
    var rgba = new Float32Array(width*height*4);
    rgba = makeFlatArray(rgba);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, makeRandomArray(rgba));

    paused = false;
}

function onMouseMove(e){
    gl.uniform2f(mouseCoordLocation, e.clientX/width, e.clientY/height);
}