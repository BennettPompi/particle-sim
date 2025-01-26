// data structure to input to fragment shader
struct VertexOut {
    @builtin(position) pos: vec4f,
    @location(0) color: vec4f
};
@fragment
fn fs(in: VertexOut) -> @location(0) vec4f {
    let coord = in.pos.xy - vec2(0.5); // Center coordinate
    let dist = length(coord);
  
  // Circular particle
    if dist > 0.5 {
    discard;
    }
    return vec4f(in.color.rgb, 1.0 - smoothstep(0.4, 0.5, dist));
}

// // set the colors of the area within the triangle
// @fragment 
// fn fs(in: VertexOut) -> @location(0) vec4f {
//     return in.color;
// }
