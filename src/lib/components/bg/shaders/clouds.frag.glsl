precision highp float;

uniform float u_time;
uniform float u_aspect;
uniform float u_speed;
uniform float u_scale;
uniform float u_density;

// Colors
uniform vec3 u_skyColor1;
uniform vec3 u_skyColor2;
uniform vec3 u_cloudColor;

// Stars
uniform float u_starsStrength; // 0.0 = off, 1.0 = on

varying vec2 vUv;

const float clouddark = 0.5;
const float cloudlight = 0.3;
const float cloudalpha = 8.0;
const float skytint = 0.5;
const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

vec2 hash( vec2 p ) {
    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p ) {
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;
    vec2 i = floor(p + (p.x+p.y)*K1);
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0*K2;
    vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot(n, vec3(70.0));
}

float fbm(vec2 n) {
    float total = 0.0, amplitude = 0.1;
    for (int i = 0; i < 7; i++) {
        total += noise(n) * amplitude;
        n = m * n;
        amplitude *= 0.4;
    }
    return total;
}

// Simple star field
float getStars(vec2 uv) {
    if (u_starsStrength <= 0.0) return 0.0;
    
    // Scale uv for stars so they are small
    vec2 suv = uv * vec2(u_aspect, 1.0) * 150.0;
    vec2 id = floor(suv);
    vec2 p = fract(suv) - 0.5;
    
    // Random position in cell
    vec2 rand = hash(id);
    float brightness = rand.x;
    
    // Only some cells have stars
    if (brightness < 0.98) return 0.0;
    
    // Star shape
    float dist = length(p);
    // Twinkle
    float twinkle = 0.5 + 0.5 * sin(u_time * 2.0 + rand.y * 10.0);
    
    return (1.0 - smoothstep(0.0, 0.3, dist)) * twinkle * (brightness - 0.98) * 50.0;
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 p = vUv;
    vec2 uv = p*vec2(u_aspect,1.0);
    float time = u_time * u_speed;
    float q = fbm(uv * u_scale * 0.5);

    //ridged noise shape
    float r = 0.0;
    uv *= u_scale;
    uv -= q - time;
    float weight = 0.8;
    for (int i=0; i<8; i++){
        r += abs(weight*noise( uv ));
        uv = m*uv + time;
        weight *= 0.7;
    }

    //noise shape
    float f = 0.0;
    uv = p*vec2(u_aspect,1.0);
    uv *= u_scale;
    uv -= q - time;
    weight = 0.7;
    for (int i=0; i<8; i++){
        f += weight*noise( uv );
        uv = m*uv + time;
        weight *= 0.6;
    }

    f *= r + f;

    //noise colour
    float c = 0.0;
    time = u_time * u_speed * 2.0;
    uv = p*vec2(u_aspect,1.0);
    uv *= u_scale*2.0;
    uv -= q - time;
    weight = 0.4;
    for (int i=0; i<7; i++){
        c += weight*noise( uv );
        uv = m*uv + time;
        weight *= 0.6;
    }

    //noise ridge colour
    float c1 = 0.0;
    time = u_time * u_speed * 3.0;
    uv = p*vec2(u_aspect,1.0);
    uv *= u_scale*3.0;
    uv -= q - time;
    weight = 0.4;
    for (int i=0; i<7; i++){
        c1 += abs(weight*noise( uv ));
        uv = m*uv + time;
        weight *= 0.6;
    }

    c += c1;

    vec3 baseSky = mix(u_skyColor2, u_skyColor1, p.y);
    
    // Add stars to sky background only
    float starVal = getStars(vUv);
    vec3 skyWithStars = baseSky + vec3(starVal) * u_starsStrength;
    
    vec3 cloudcolour = u_cloudColor * clamp((clouddark + cloudlight*c), 0.0, 1.0);

    f = u_density + cloudalpha*f*r;

    // Mix between starry sky and cloud layer
    // Cloud layer uses baseSky (no stars) for tinting
    vec3 result = mix(skyWithStars, clamp(skytint * baseSky + cloudcolour, 0.0, 1.0), clamp(f + c, 0.0, 1.0));

    // Apply dithering to prevent banding
    result += (random(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4( result, 1.0 );
}
