#version 300 es
precision highp float;

out vec2 vUv;

void main() {
    // Fullscreen triangle trick - more efficient than a quad
    // gl_VertexID: 0, 1, 2 -> positions that cover the screen
    float x = float((gl_VertexID & 1) << 2);
    float y = float((gl_VertexID & 2) << 1);
    vUv = vec2(x, y) * 0.5;
    gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0);
}
