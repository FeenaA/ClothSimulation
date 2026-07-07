import "./style.css";
import { WebGPU } from "./renderer/WebGPU.js";
import { ClothSimulation } from "./simulation/ClothSimulation.js";

/*document.querySelector("#app").innerHTML = `
    <canvas id="webgpu-canvas"></canvas>
`;*/

document.querySelector("#app").innerHTML = `
    <label class="controls">
        <input id="gravity-checkbox" type="checkbox">
        Включить гравитацию
    </label>
    <canvas id="webgpu-canvas"></canvas>
`;

async function main() {
  const canvas = document.querySelector("#webgpu-canvas");

  const simulation = new ClothSimulation(12, 8);

  // UI для гравитации
  const gravityCheckbox = document.querySelector("#gravity-checkbox");

  gravityCheckbox.addEventListener("change", () => {
    simulation.gravityEnabled = gravityCheckbox.checked;
  });

  const renderer = new WebGPU(canvas, simulation);
  await renderer.init();

  // подключение мыши
  /*let isDragging = false;

  canvas.addEventListener("mousedown", () => {
    isDragging = true;
    simulation.startDragCenter();
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    simulation.endDrag();
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    simulation.endDrag();
  });

  canvas.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();

    const mouseX = (event.clientX - rect.left) / rect.width;
    const mouseY = (event.clientY - rect.top) / rect.height;

    const clothX = mouseX * simulation.width;
    const clothY = mouseY * simulation.height;

    const minX = 2;
    const maxX = simulation.width - 2;
    const minY = 1;
    const maxY = simulation.height - 1;

    const clampedX = Math.max(minX, Math.min(maxX, clothX));
    const clampedY = Math.max(minY, Math.min(maxY, clothY));

    simulation.dragTo(clampedX, clampedY);
  });*/

  let lastTime = performance.now();

  function frame(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    simulation.update(deltaTime);
    renderer.render();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

main();