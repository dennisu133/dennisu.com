// This shader is a modified version of "2D clouds" by drift (Shadertoy).
// Original source: https://www.shadertoy.com/view/4tdSWr
//
// The original author has granted permission for its free use.

precision highp float;

uniform float u_time;
uniform float u_aspect;
uniform float u_scale;
uniform float u_speed;
uniform float u_density;
uniform float u_opacity;
uniform vec3  u_color;
varying vec2 vUv;

// Night sky moving clouds based on fbm with ridges.
// Adapted to render only clouds with alpha over page background.

const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

vec2 hash( vec2 p ) {
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p ) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2
  const float K2 = 0.211324865; // (3-sqrt(3))/6
  vec2 i = floor(p + (p.x+p.y)*K1);
  vec2 a = p - i + (i.x+i.y)*K2;
  vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0*K2;
  vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
  vec3 n = h*h*h*h * vec3(
    dot(a,hash(i+0.0)),
    dot(b,hash(i+o)),
    dot(c,hash(i+1.0))
  );
  return dot(n, vec3(70.0));
}

float fbm(vec2 n) {
  float total = 0.0, amplitude = 0.1;
  for (int i = 0; i < 4; i++) {
    total += noise(n) * amplitude;
    n = m * n;
    amplitude *= 0.4;
  }
  return total;
}

// Edge fade so clouds are subtler near the edges
float vignette(vec2 p) {
  vec2 d = p - 0.5;
  d.x *= u_aspect;
  float r = dot(d, d);
  return smoothstep(0.30, 0.90, 0.95 - r);
}

void main() {
  vec2 p = vUv;
  vec2 uv = p * vec2(u_aspect, 1.0);
  float time = u_time * u_speed;

  // Base fbm
  float q = fbm(uv * (u_scale * 0.55));

  // Ridged noise shape
  float r = 0.0;
  uv *= (u_scale * 1.1);
  uv -= q - time;
  float weight = 0.8;
  for (int i = 0; i < 8; i++) {
    r += abs(weight * noise(uv));
    uv = m * uv + time;
    weight *= 0.7;
  }

  // Soft noise shape
  float f = 0.0;
  uv = p * vec2(u_aspect, 1.0);
  uv *= (u_scale * 1.1);
  uv -= q - time;
  weight = 0.7;
  for (int i = 0; i < 8; i++) {
    f += weight * noise(uv);
    uv = m * uv + time;
    weight *= 0.6;
  }
  f *= r + f;

  // Noise colour variations
  float c = 0.0;
  time = u_time * u_speed * 2.0;
  uv = p * vec2(u_aspect, 1.0);
  uv *= (u_scale * 2.2);
  uv -= q - time;
  weight = 0.4;
  for (int i = 0; i < 4; i++) {
    c += weight * noise(uv);
    uv = m * uv + time;
    weight *= 0.6;
  }

  // Map density to a baseline cloud cover (higher u_density -> sparser clouds)
  float cloudcover = mix(0.05, 0.5, 1.0 - clamp(u_density, 0.0, 1.0));
  float cloudalpha = 8.0;

  float amount = cloudcover + cloudalpha * f * r;
  amount = clamp(amount + c, 0.0, 1.0);

  // Night grey clouds with subtle brightness modulation
  vec3 cloudCol = u_color * (0.6 + 0.4 * clamp(c, 0.0, 1.0));

  float alpha = amount * u_opacity * vignette(p);

  gl_FragColor = vec4(cloudCol, alpha);
}

