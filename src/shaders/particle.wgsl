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