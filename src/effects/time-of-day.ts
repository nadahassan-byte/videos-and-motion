import { createEffect, type InteractivitySchema } from "remotion";

/**
 * Morning to evening on a single plate.
 *
 * A photograph taken at one time of day cannot be relit, so this does the
 * three things that a falling sun actually does to an image, and does not
 * pretend to do the fourth.
 *
 * - The sky changes colour. Not by painting a band across the top: the palms
 *   are silhouetted against sky over most of the upper half, so the sky is
 *   found by chroma. Blue minus red separates it cleanly here — sky runs
 *   +75 to +88, every palm, wall and cushion in the frame runs negative — and
 *   a brightness term picks up the near-white haze along the horizon. The
 *   photograph's own luminance is kept and only its colour is replaced, so
 *   the cirrus survives and is lit by the new sky rather than erased by it.
 * - The light on everything else warms and drops. Highlights move toward
 *   amber, shadows toward the blue of the open sky, overall level falls, and
 *   the blacks lift slightly because dusk air is hazy.
 * - The pool splits in two. Its far half is seen edge-on and is almost all
 *   reflection, so it takes the sky's gold; its near half is looked down
 *   into and holds the cyan of its own underwater lights while the terrace
 *   around it goes down. That split is the whole reason the shot works at
 *   dusk.
 *
 * What it cannot do is move the shadows. They were cast by a high sun and
 * they stay where they are.
 */

type TimeOfDayParams = {
  readonly progress?: number;
  readonly waterline?: number;
  readonly horizon?: number;
};

const resolve = (p: TimeOfDayParams) => ({
  progress: p.progress ?? 0,
  waterline: p.waterline ?? 0.735,
  horizon: p.horizon ?? 0.565,
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
uniform float uProgress;
uniform float uWaterline;
uniform float uHorizon;
uniform float uFlipY;

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

// The evening sky, bottom to top: pale gold on the horizon, amber, dusty
// rose, violet, and deep indigo overhead. Dubai dusk is hazy, so none of
// these are saturated the way a tropical sunset would be.
vec3 eveningSky(float iy) {
  // 0 at the horizon, 1 at the top of the frame.
  float h = clamp((uHorizon - iy) / max(uHorizon, 0.0001), 0.0, 1.0);
  vec3 c = mix(vec3(0.957, 0.792, 0.541), vec3(0.910, 0.663, 0.420), smoothstep(0.00, 0.12, h));
  c = mix(c, vec3(0.788, 0.541, 0.467), smoothstep(0.10, 0.30, h));
  c = mix(c, vec3(0.478, 0.431, 0.584), smoothstep(0.28, 0.58, h));
  c = mix(c, vec3(0.267, 0.345, 0.541), smoothstep(0.55, 1.00, h));
  return c;
}

void main() {
  vec4 src = texture(uSource, vUv);
  vec3 col = src.rgb;

  // y in image space: 0 at the top of the photograph, 1 at the bottom.
  float iy = mix(vUv.y, 1.0 - vUv.y, uFlipY);
  float l = luma(col);

  // --- where the sky is -------------------------------------------------
  // Open sky: strongly blue. Measured on this plate, sky sits at b-r +0.29
  // to +0.35 and nothing else in the frame is above zero.
  float blueness = smoothstep(0.04, 0.17, col.b - col.r);
  // The haze along the horizon has no blue left in it, only brightness. The
  // threshold sits above the parasol and the pergola so they stay terrace.
  float haze = smoothstep(0.70, 0.86, l) * (1.0 - smoothstep(0.06, 0.20, max(col.r, col.b) - min(col.r, col.b)));
  // Below the fence line there is no sky, only pool reflecting it, which
  // carries the same blue signature and must not be treated as sky.
  float above = 1.0 - smoothstep(uHorizon - 0.010, uHorizon + 0.035, iy);
  float sky = clamp(max(blueness, haze), 0.0, 1.0) * above;

  // --- the sky's new colour --------------------------------------------
  // Keep the photograph's luminance and swap only its colour, so the cirrus
  // is lit by the evening rather than painted over by it.
  vec3 target = eveningSky(iy);
  vec3 relit = target * (l / max(luma(target), 0.001));
  // ...then settle part of the way onto the gradient's own level, because
  // the sky at dusk is darker than the sky at ten in the morning.
  relit = mix(relit, target, 0.45);
  col = mix(col, relit, sky * uProgress);

  // --- the light on everything else -------------------------------------
  // A low sun is warm and the fill comes off the blue of the open sky, so
  // highlights and shadows pull apart in opposite directions.
  vec3 warm = vec3(1.13, 0.98, 0.76);
  vec3 cool = vec3(0.86, 0.92, 1.07);
  vec3 tone = mix(cool, warm, smoothstep(0.18, 0.75, luma(col)));
  col *= mix(vec3(1.0), tone, uProgress);
  col *= mix(1.0, 0.78, uProgress);
  // Dusk air is hazy. Blacks lift rather than crush.
  col = mix(col, col * 0.93 + 0.045, uProgress);

  // --- the pool ---------------------------------------------------------
  float water = smoothstep(uWaterline - 0.012, uWaterline + 0.030, iy);
  // Depth into the pool: 0 at the far edge, 1 at the bottom of the frame.
  float wd = clamp((iy - uWaterline) / max(1.0 - uWaterline, 0.0001), 0.0, 1.0);

  // The far half of the surface is seen almost edge-on and is nearly all
  // reflection, so it carries the sky. Close to the camera we look down
  // through the surface instead and see the pool. Luminance is kept, so the
  // ripple the water shader drew survives being recoloured.
  vec3 horizonSky = eveningSky(uHorizon * 0.92);
  float spec = smoothstep(0.26, 0.72, luma(col));
  float mirror = water * (1.0 - smoothstep(0.0, 0.55, wd)) * mix(0.35, 1.0, spec);
  vec3 mirrored = horizonSky * (luma(col) / max(luma(horizonSky), 0.001)) * 0.95;
  col = mix(col, mirrored, mirror * uProgress * 0.62);

  // Lit from under the water, which is what holds the pool up while the
  // terrace goes down. Strongest where we are looking into the body of it,
  // so the surface stays the sky's and the depth becomes the pool's own.
  float glow = water * smoothstep(0.10, 0.85, wd);
  col *= mix(vec3(1.0), vec3(1.02, 1.20, 1.30), glow * uProgress);

  fragColor = vec4(clamp(col, 0.0, 1.0), src.a);
}`;

type TimeOfDayState = {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  readonly vao: WebGLVertexArrayObject;
  readonly vbo: WebGLBuffer;
  readonly texture: WebGLTexture;
  readonly u: Record<string, WebGLUniformLocation | null>;
};

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("Could not create shader for timeOfDay().");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`timeOfDay() shader failed to compile: ${log}`);
  }
  return sh;
};

const timeOfDaySchema = {
  progress: { type: "number", min: 0, max: 1, step: 0.001, default: 0, description: "Morning to evening", hiddenFromList: false },
  waterline: { type: "number", min: 0, max: 1, step: 0.001, default: 0.735, description: "Waterline", hiddenFromList: false },
  horizon: { type: "number", min: 0, max: 1, step: 0.001, default: 0.565, description: "Horizon", hiddenFromList: false },
} as const satisfies InteractivitySchema;

export const timeOfDay = createEffect<TimeOfDayParams, TimeOfDayState>({
  type: "com.bhomes.timeOfDay",
  label: "timeOfDay()",
  documentationLink: null,
  backend: "webgl2",
  calculateKey: (params) => {
    const r = resolve(params);
    return `time-of-day-${r.progress}-${r.waterline}-${r.horizon}`;
  },
  setup: (target) => {
    const gl = target.getContext("webgl2", {
      premultipliedAlpha: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("Could not get a WebGL2 context for timeOfDay().");
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program for timeOfDay().");
    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`timeOfDay() program failed to link: ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    if (!vao || !vbo) throw new Error("Could not create geometry for timeOfDay().");
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
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
    if (!texture) throw new Error("Could not create texture for timeOfDay().");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const names = ["uSource", "uProgress", "uWaterline", "uHorizon", "uFlipY"];
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
    if (u.uProgress) gl.uniform1f(u.uProgress, r.progress);
    if (u.uWaterline) gl.uniform1f(u.uWaterline, r.waterline);
    if (u.uHorizon) gl.uniform1f(u.uHorizon, r.horizon);
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
  schema: timeOfDaySchema,
  validateParams: (params) => {
    const r = resolve(params);
    if (!Number.isFinite(r.progress) || r.progress < 0 || r.progress > 1) {
      throw new TypeError("progress must be between 0 and 1");
    }
    if (!Number.isFinite(r.horizon) || r.horizon < 0 || r.horizon > 1) {
      throw new TypeError("horizon must be between 0 and 1");
    }
  },
});
