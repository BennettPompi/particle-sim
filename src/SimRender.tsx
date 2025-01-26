import { useEffect, useRef } from "react";
import { Renderer } from "./webgl_logic/Renderer";

export const SimRender: React.FC = ({}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const renderer = new Renderer(canvasRef.current);
        renderer.init();
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderer.init(); // Reinitialize renderer on resize
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div>
            <canvas
                width={"100%"}
                height={"100%"}
                ref={canvasRef}
                id="GLCanvas"
            ></canvas>
        </div>
    );
};
