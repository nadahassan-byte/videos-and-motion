import { createEffect, type InteractivitySchema } from "remotion";

/**
 * Pool water.
 *
 * Displaces the image by the gradient of fractal noise rather than by sine
 * waves, so the surface is irregular the way real water is. Two things make
 * it read as a photograph of a pool rather than as an animation:
 *
 * - Perspective. The far edge of the water is seen almost edge-on, so ripples
 *   there are compressed and tiny; close to the camera they are broad and
 *   slow. Feature size and amplitude both scale with depth down the frame.
 * - Caustics. The light on the surface moves with the water, so brightness is
 *   modulated by a second, finer noise field.
 *
 * The noise lattice is periodic along its time axis, so advancing time by
 * exactly `period` returns the same surface and the clip loops.
 */

type PoolWaterParams = {
  readonly waterline?: number;
  readonly amplitude?: number;
  readonly time?: number;
  readonly period?: number;
  readonly caustics?: number;
  readonly scale?: number;
};

const resolve = (p: PoolWaterParams) => ({
  waterline: p.waterline ?? 0.735,
  amplitude: p.amplitude ?? 7,
  time: p.time ?? 0,
  period: p.period ?? 3,
  caustics: p.caustics ?? 0.12,
  scale: p.scale ?? 2.6,
});

const VS = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uWaterline;
uniform float uAmp;
uniform float uTime;
uniform float uPeriod;
uniform float uCaustics;
uniform float uScale;
// 1.0 when the source texture was uploaded flipped, so image-space y has to
// be read back the other way round.
uniform float uFlipY;

float hash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

// Value noise, wrapped on the z axis so the field repeats every 'period'.
float vnoise(vec3 x, float period) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float z0 = mod(i.z, period);
  float z1 = mod(i.z + 1.0, period);
  float n000 = hash(vec3(i.x, i.y, z0));
  float n100 = hash(vec3(i.x + 1.0, i.y, z0));
  float n010 = hash(vec3(i.x, i.y + 1.0, z0));
  float n110 = hash(vec3(i.x + 1.0, i.y + 1.0, z0));
  float n001 = hash(vec3(i.x, i.y, z1));
  float n101 = hash(vec3(i.x + 1.0, i.y, z1));
  float n011 = hash(vec3(i.x, i.y + 1.0, z1));
  float n111 = hash(vec3(i.x + 1.0, i.y + 1.0, z1));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

// Doubling the z frequency and the period together keeps every octave in step.
float fbm(vec3 p, float period) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p, period);
    p.xy *= 2.03;
    p.z *= 2.0;
    period *= 2.0;
    a *= 0.5;
  }
  return s;
}

void main() {
  // y in image space: 0 at the top of the photograph, 1 at the bottom.
  float iy = mix(vUv.y, 1.0 - vUv.y, uFlipY);

  float edge = smoothstep(uWaterline - 0.010, uWaterline + 0.022, iy);
  if (edge <= 0.001) {
    fragColor = texture(uSource, vUv);
    return;
  }

  // 0 at the far edge of the water, 1 at the bottom of the frame.
  float d = clamp((iy - uWaterline) / max(1.0 - uWaterline, 0.0001), 0.0, 1.0);

  // Near the camera the surface is seen at a shallower angle, so features
  // read larger and further apart. This is what a flat wave field lacks.
  float persp = mix(0.16, 1.0, pow(d, 1.5));
  vec2 wp = vec2(vUv.x, iy) / vec2(persp, persp * 0.40);

  float e = 0.010;
  float n = fbm(vec3(wp * uScale, uTime), uPeriod);
  float nx = fbm(vec3((wp + vec2(e, 0.0)) * uScale, uTime), uPeriod);
  float ny = fbm(vec3((wp + vec2(0.0, e)) * uScale, uTime), uPeriod);

  vec2 grad = vec2(nx - n, ny - n);
  float ampPx = uAmp * mix(0.2, 1.0, pow(d, 1.25)) * edge;
  vec2 disp = grad * ampPx * 46.0 / uResolution;

  vec4 col = texture(uSource, vUv + disp);

  // light running over the surface
  // The time axis must be scaled by a whole number together with the period,
  // or this term alone will not wrap and the clip will jump at the loop.
  float c = fbm(vec3(wp * uScale * 2.1 + 11.3, uTime * 2.0), uPeriod * 2.0);
  col.rgb *= 1.0 + (c - 0.5) * uCaustics * edge;

  fragColor = col;
}`;

type PoolWaterState = {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  readonly vao: WebGLVertexArrayObject;
  readonly vbo: WebGLBuffer;
  readonly texture: WebGLTexture;
  readonly u: Record<string, WebGLUniformLocation | null>;
};

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("Could not create shader for poolWater().");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`poolWater() shader failed to compile: ${log}`);
  }
  return sh;
};

const poolWaterSchema = {
  waterline: { type: "number", min: 0, max: 1, step: 0.001, default: 0.735, description: "Waterline" , hiddenFromList: false },
  amplitude: { type: "number", min: 0, max: 40, step: 0.5, default: 7, description: "Ripple amplitude" , hiddenFromList: false },
  time: { type: "number", min: 0, max: 64, step: 0.001, default: 0, description: "Time" , hiddenFromList: false },
  period: { type: "number", min: 1, max: 32, step: 1, default: 3, description: "Loop period" , hiddenFromList: false },
  caustics: { type: "number", min: 0, max: 1, step: 0.01, default: 0.12, description: "Caustics" , hiddenFromList: false },
  scale: { type: "number", min: 0.2, max: 12, step: 0.1, default: 2.6, description: "Feature scale" , hiddenFromList: false },
} as const satisfies InteractivitySchema;

export const poolWater = createEffect<PoolWaterParams, PoolWaterState>({
  type: "com.bhomes.poolWater",
  label: "poolWater()",
  documentationLink: null,
  backend: "webgl2",
  calculateKey: (params) => {
    const r = resolve(params);
    return `pool-water-${r.waterline}-${r.amplitude}-${r.time}-${r.period}-${r.caustics}-${r.scale}`;
  },
  setup: (target) => {
    const gl = target.getContext("webgl2", {
      premultipliedAlpha: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("Could not get a WebGL2 context for poolWater().");
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program for poolWater().");
    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`poolWater() program failed to link: ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    if (!vao || !vbo) throw new Error("Could not create geometry for poolWater().");
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // x, y, u, v for a fullscreen triangle strip
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);

    const texture = gl.createTexture();
    if (!texture) throw new Error("Could not create texture for poolWater().");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const names = ["uSource", "uResolution", "uWaterline", "uAmp", "uTime", "uPeriod", "uCaustics", "uScale", "uFlipY"];
    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const n of names) u[n] = gl.getUniformLocation(program, n);

    return { gl, program, vao, vbo, texture, u };
  },
  apply: ({ source, width, height, params, state, flipSourceY }) => {
    const { gl, program, vao, texture, u } = state;
    const r = resolve(params);

    gl.viewport(0, 0, width, height);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source as TexImageSource,
    );

    gl.useProgram(program);
    if (u.uSource) gl.uniform1i(u.uSource, 0);
    if (u.uResolution) gl.uniform2f(u.uResolution, width, height);
    if (u.uWaterline) gl.uniform1f(u.uWaterline, r.waterline);
    if (u.uAmp) gl.uniform1f(u.uAmp, r.amplitude);
    if (u.uTime) gl.uniform1f(u.uTime, r.time);
    if (u.uPeriod) gl.uniform1f(u.uPeriod, r.period);
    if (u.uCaustics) gl.uniform1f(u.uCaustics, r.caustics);
    if (u.uScale) gl.uniform1f(u.uScale, r.scale);
    if (u.uFlipY) gl.uniform1f(u.uFlipY, flipSourceY ? 1 : 0);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  },
  cleanup: ({ gl, program, vao, vbo, texture }) => {
    gl.deleteProgram(program);
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(vbo);
    gl.deleteTexture(texture);
  },
  schema: poolWaterSchema,
  validateParams: (params) => {
    const r = resolve(params);
    if (!Number.isFinite(r.waterline) || r.waterline < 0 || r.waterline > 1) {
      throw new TypeError("waterline must be between 0 and 1");
    }
    if (!Number.isFinite(r.amplitude) || r.amplitude < 0) {
      throw new TypeError("amplitude must be a non-negative number");
    }
    if (!Number.isInteger(r.period) || r.period < 1) {
      throw new TypeError("period must be a positive integer, or the clip will not loop");
    }
  },
});
