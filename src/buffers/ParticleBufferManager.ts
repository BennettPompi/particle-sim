import { MAX_PARTICLES } from "../constants";
import { GPUParticle, GPUSimParams } from "../Renderer";
export class ParticleBufferManager {
    private device: GPUDevice;
    private particleBuffer: GPUBuffer;
    private paramsBuffer: GPUBuffer;

    constructor(device: GPUDevice) {
        this.device = device;

        // Particle storage buffer (read/write in compute shader)
        this.particleBuffer = device.createBuffer({
            label: "Particle Storage",
            size: MAX_PARTICLES * 20, // 2(vec2) + 2(vec2) + 1 + 4 = 9 floats → 36 bytes
            usage:
                GPUBufferUsage.STORAGE |
                GPUBufferUsage.VERTEX |
                GPUBufferUsage.COPY_DST,
        });

        // Simulation parameters (uniform buffer)
        this.paramsBuffer = device.createBuffer({
            label: "Simulation Params",
            size: 16 + 4 + 4 + 8, // Match SimParams struct
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    updateParticles(particles: GPUParticle[]) {
        const data = new Float32Array(MAX_PARTICLES * 9);

        particles.forEach((p, i) => {
            const offset = i * 9;
            data.set(
                [...p.position, ...p.velocity, p.mass, ...p.color],
                offset
            );
        });

        this.device.queue.writeBuffer(this.particleBuffer, 0, data);
    }

    updateParams(params: GPUSimParams) {
        const data = new Float32Array([
            params.delta_time,
            params.gravity,
            params.theta,
            ...params.screen_size,
            0,
            0, // Padding to match WGSL struct alignment
        ]);

        this.device.queue.writeBuffer(this.paramsBuffer, 0, data);
    }

    get bindGroupLayoutEntry(): GPUBindGroupLayoutEntry {
        return {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
            buffer: { type: "storage" },
        };
    }
}
