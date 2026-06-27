#version 300 es
precision highp float;

uniform float u_time;
uniform float u_aspect;
uniform float u_speed;
uniform float u_scale;
uniform float u_density;

// Quality: affects loop iterations (0=low, 1=medium, 2=high)
uniform int u_quality;

// Colors
uniform vec3 u_skyColor1;
uniform vec3 u_skyColor2;
uniform vec3 u_cloudColor;

// Stars
uniform float u_starsStrength;

in vec2 vUv;
out vec4 fragColor;

const float clouddark = 0.5;
const float cloudlight = 0.3;
const float cloudalpha = 8.0;
const float skytint = 0.5;
const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    return dot(n, vec3(70.0));
}

float fbm(vec2 n, int iters) {
    float total = 0.0, amplitude = 0.1;
    for (int i = 0; i < 7; i++) {
        if (i >= iters) break;
        total += noise(n) * amplitude;
        n = m * n;
        amplitude *= 0.4;
    }
    return total;
}

float getStars(vec2 uv) {
    if (u_starsStrength <= 0.0) return 0.0;
    
    vec2 suv = uv * vec2(u_aspect, 1.0) * 150.0;
    vec2 id = floor(suv);
    vec2 p = fract(suv) - 0.5;
    
    vec2 rand = hash(id);
    float brightness = rand.x;
    
    if (brightness < 0.98) return 0.0;
    
    float dist = length(p);
    float twinkle = 0.5 + 0.5 * sin(u_time * 2.0 + rand.y * 10.0);
    
    return (1.0 - smoothstep(0.0, 0.3, dist)) * twinkle * (brightness - 0.98) * 50.0;
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    // Quality-based iteration counts
    int fbmIters = u_quality == 0 ? 4 : (u_quality == 1 ? 5 : 7);
    int shapeIters = u_quality == 0 ? 5 : (u_quality == 1 ? 6 : 8);
    int colorIters = u_quality == 0 ? 4 : (u_quality == 1 ? 5 : 7);

    vec2 p = vUv;
    vec2 uv = p * vec2(u_aspect, 1.0);
    float time = u_time * u_speed;
    float q = fbm(uv * u_scale * 0.5, fbmIters);

    // Ridged noise shape
    float r = 0.0;
    uv *= u_scale;
    uv -= q - time;
    float weight = 0.8;
    for (int i = 0; i < 8; i++) {
        if (i >= shapeIters) break;
        r += abs(weight * noise(uv));
        uv = m * uv + time;
        weight *= 0.7;
    }

    // Noise shape
    float f = 0.0;
    uv = p * vec2(u_aspect, 1.0);
    uv *= u_scale;
    uv -= q - time;
    weight = 0.7;
    for (int i = 0; i < 8; i++) {
        if (i >= shapeIters) break;
        f += weight * noise(uv);
        uv = m * uv + time;
        weight *= 0.6;
    }

    f *= r + f;

    // Noise color
    float c = 0.0;
    time = u_time * u_speed * 2.0;
    uv = p * vec2(u_aspect, 1.0);
    uv *= u_scale * 2.0;
    uv -= q - time;
    weight = 0.4;
    for (int i = 0; i < 7; i++) {
        if (i >= colorIters) break;
        c += weight * noise(uv);
        uv = m * uv + time;
        weight *= 0.6;
    }

    // Noise ridge color
    float c1 = 0.0;
    time = u_time * u_speed * 3.0;
    uv = p * vec2(u_aspect, 1.0);
    uv *= u_scale * 3.0;
    uv -= q - time;
    weight = 0.4;
    for (int i = 0; i < 7; i++) {
        if (i >= colorIters) break;
        c1 += abs(weight * noise(uv));
        uv = m * uv + time;
        weight *= 0.6;
    }

    c += c1;

    vec3 baseSky = mix(u_skyColor2, u_skyColor1, p.y);
    
    float starVal = getStars(vUv);
    vec3 skyWithStars = baseSky + vec3(starVal) * u_starsStrength;
    
    vec3 cloudcolour = u_cloudColor * clamp((clouddark + cloudlight * c), 0.0, 1.0);

    f = u_density + cloudalpha * f * r;

    vec3 result = mix(skyWithStars, clamp(skytint * baseSky + cloudcolour, 0.0, 1.0), clamp(f + c, 0.0, 1.0));

    // Dithering to prevent banding
    result += (random(gl_FragCoord.xy) - 0.5) / 255.0;

    fragColor = vec4(result, 1.0);
}
