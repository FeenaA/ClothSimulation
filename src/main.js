import "./style.css";
import { WebGPU } from "./renderer/WebGPU.js";
import { ClothSimulation } from "./simulation/ClothSimulation.js";

document.querySelector("#app").innerHTML = `
    <label class="controls">
        <input id="gravity-checkbox" type="checkbox">
        Включить гравитацию
    </label>
    <canvas id="webgpu-canvas"></canvas>
`;

async function main() {
  const canvas = document.querySelector("#webgpu-canvas");

  // Создаём физическую модель ткани.
  const simulation = new ClothSimulation(12, 8);

  // Подключаем чекбокс, который включает и выключает гравитацию.
  const gravityCheckbox = document.querySelector("#gravity-checkbox");

  gravityCheckbox.addEventListener("change", () => {
    simulation.gravityEnabled = gravityCheckbox.checked;
  });

  // Инициализируем WebGPU-рендерер.
  const renderer = new WebGPU(canvas, simulation);
  await renderer.init();

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