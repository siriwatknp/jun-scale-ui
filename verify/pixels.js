async (page, results) => {
  const scales = [1, 0.75, 1.25, 1.5];
  const failures = [];
  let total = 0;
  await page.addStyleTag({
    content: ".pixel-probe *, .pixel-probe *::before, .pixel-probe *::after { box-shadow: none !important; transition: none !important; }",
  });
  for (const scale of scales) {
    const handle = await page.evaluateHandle((value) => {
      const box = mount("Switch", `--scale: ${value}; background: #ff00ff; padding: 4px; display: inline-block;`);
      box.classList.add("pixel-probe");
      return box.querySelector("[data-pseudo-inset]");
    }, scale);
    const png = await handle.screenshot();
    const gaps = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const at = (x, y) => {
        const index = (y * canvas.width + x) * 4;
        return [data[index], data[index + 1], data[index + 2]];
      };
      const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      const middle = Math.floor(canvas.height / 2);
      const track = at(canvas.width - Math.ceil(canvas.height / 2), middle);
      let thumb = track;
      let farthest = 0;
      for (let x = 0; x < canvas.width; x++) {
        const pixel = at(x, middle);
        const away = distance(pixel, track);
        if (away > farthest && distance(pixel, [255, 0, 255]) > 60) {
          farthest = away;
          thumb = pixel;
        }
      }
      const background = [255, 0, 255];
      const isThumb = (pixel) => distance(pixel, thumb) < distance(pixel, track) && distance(pixel, thumb) < distance(pixel, background);
      const isBackground = (pixel) => distance(pixel, background) < distance(pixel, track) && distance(pixel, background) < distance(pixel, thumb);
      let trackLeft = 0;
      while (trackLeft < canvas.width && isBackground(at(trackLeft, middle))) trackLeft++;
      let left = trackLeft;
      while (left < canvas.width && !isThumb(at(left, middle))) left++;
      let right = left;
      while (right < canvas.width && isThumb(at(right, middle))) right++;
      const center = Math.floor((left + right) / 2);
      let trackTop = 0;
      while (trackTop < canvas.height && isBackground(at(center, trackTop))) trackTop++;
      let top = trackTop;
      while (top < canvas.height && !isThumb(at(center, top))) top++;
      let trackBottom = canvas.height - 1;
      while (trackBottom > 0 && isBackground(at(center, trackBottom))) trackBottom--;
      let bottom = trackBottom;
      while (bottom > 0 && !isThumb(at(center, bottom))) bottom--;
      return { left: left - trackLeft, top: top - trackTop, bottom: trackBottom - bottom, height: canvas.height, trackTop, trackBottom };
    }, "data:image/png;base64," + png.toString("base64"));
    total += 1;
    const passed = gaps.top === gaps.bottom && gaps.top === gaps.left && gaps.top > 0;
    if (!passed) {
      failures.push({
        test: "centered with equal gaps",
        label: `Switch thumb in rendered pixels at ${scale}`,
        detail: `top ${gaps.top}, bottom ${gaps.bottom}, left ${gaps.left} (image ${gaps.height}px, track rows ${gaps.trackTop}-${gaps.trackBottom})`,
        passed,
      });
    }
  }
  results.total += total;
  results.failed += failures.length;
  results.failures.push(...failures);
  const counts = (results.byTest["centered with equal gaps"] ??= { total: 0, failed: 0 });
  counts.total += total;
  counts.failed += failures.length;
  return results;
}
