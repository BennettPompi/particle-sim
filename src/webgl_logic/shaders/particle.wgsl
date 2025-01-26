// Shared between shaders and TypeScript
struct Particle {
  position: vec2f,
  velocity: vec2f,
  mass: f32,
  color: vec4f,
};

struct SimParams {
  delta_time: f32,
  gravity: f32,
  theta: f32,
  screen_size: vec2f,
};
@group(0) @binding(0) var<storage> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;

@vertex
fn vs(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
    let particle = particles[idx];
    return vec4f(particle.position, 0.0, 1.0);
}

@fragment
fn fs() -> @location(0) vec4f {
    return particles[0].color; // Simple example
}