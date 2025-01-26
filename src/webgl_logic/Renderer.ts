import vertexShader from "./shaders/vertex_shader.wgsl";
import fragmentShader from "./shaders/fragment_shader.wgsl";
import { ParticleBufferManager } from "./buffers/ParticleBufferManager";

// Keep in sync with WGSL structs
export interface GPUParticle {
    position: [number, number];
    velocity: [number, number];
    mass: number;
    color: [number, number, number, number];
}

export interface GPUSimParams {
    delta_time: number;
    gravity: number;
    theta: number;
    screen_size: [number, number];
}

export class Renderer {
    private device!: GPUDevice;
    private context!: GPUCanvasContext;
    private presentationFormat!: GPUTextureFormat;
    private vertexShader!: GPUShaderModule;
    private fragmentShader!: GPUShaderModule;
    private pipeline!: GPURenderPipeline;
    private renderPassDescriptor!: GPURenderPassDescriptor;
    private bufferManager!: ParticleBufferManager;
    private bindGroup!: GPUBindGroup;

    constructor(private canvas: HTMLCanvasElement) {}

    public async init() {
        console.log(vertexShader);
        await this.getGPUDevice();
        this.bufferManager = new ParticleBufferManager(this.device);

        // Create bind group layout
        const bindGroupLayout = this.device.createBindGroupLayout({
            label: "Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
                    buffer: { type: "storage" },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
                    buffer: { type: "uniform" },
                },
            ],
        });

        // Create actual bind group
        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.bufferManager.particleBuffer },
                },
                {
                    binding: 1,
                    resource: { buffer: this.bufferManager.paramsBuffer },
                },
            ],
        });

        this.configCanvas();
        this.loadShaders();
        this.configurePipeline();
        this.configureRenderPassDescriptor();
        this.render();
    }
    private async getGPUDevice() {
        var adapter = await navigator.gpu?.requestAdapter();
        const device = await adapter?.requestDevice();
        if (!device) {
            this.fail("Browser does not support WebGPU");
            return;
        }

        this.device = device;
    }

    private fail(msg: string) {
        document.body.innerHTML = `<H1>${msg}</H1>`;
    }
    private configCanvas() {
        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        // Set canvas size to match the screen size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
            alphaMode: "opaque",
        });
    }
    private loadShaders() {
        this.loadVertexShader();
        this.loadFragmentShader();
    }

    private loadVertexShader() {
        this.vertexShader = this.device.createShaderModule({
            label: "Vertex Shader",
            code: vertexShader,
        });
    }

    private loadFragmentShader() {
        this.fragmentShader = this.device.createShaderModule({
            label: "Fragment Shader",
            code: fragmentShader,
        });
    }
    private configurePipeline() {
        this.pipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            primitive: {
                topology: "point-list", // 1 vertex = 1 particle
            },
            layout: "auto",
            vertex: { module: this.vertexShader },
            fragment: {
                module: this.fragmentShader,
                targets: [{ format: this.presentationFormat }],
            },
        });
    }

    private configureRenderPassDescriptor() {
        this.renderPassDescriptor = {
            label: "Render Pass Description",
            colorAttachments: [
                {
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: "clear",
                    storeOp: "store",
                    view: this.context.getCurrentTexture().createView(),
                },
            ],
        };
    }
    private render() {
        (this.renderPassDescriptor.colorAttachments as any)[0].view =
            this.context.getCurrentTexture().createView();

        const encoder = this.device.createCommandEncoder({
            label: "render encoder",
        });

        const pass = encoder.beginRenderPass(this.renderPassDescriptor);
        pass.setBindGroup(0, this.bindGroup);
        pass.setPipeline(this.pipeline);
        pass.draw(6);
        pass.end();

        this.device.queue.submit([encoder.finish()]);
    }
}
