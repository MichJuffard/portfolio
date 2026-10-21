import { renderScene, type RenderOptions } from './minirt-demo';
self.addEventListener('message', (event: MessageEvent<{ id: number; width: number; height: number; options: RenderOptions }>) => {
  const { id, width, height, options } = event.data;
  const pixels = renderScene(width, height, options);
  self.postMessage({ id, width, height, pixels }, { transfer: [pixels.buffer] });
});
