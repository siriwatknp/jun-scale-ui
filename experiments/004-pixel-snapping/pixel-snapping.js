const SCALES = ["0.75", "0.8", "0.875", "0.9", "1", "1.1", "1.125", "1.2", "1.25", "1.3", "1.5"];

const table = document.querySelector("[data-rows]");
const header = document.createElement("tr");
header.innerHTML = "<th>--scale</th><th>current</th><th>snapped</th>";
table.append(header);

SCALES.forEach((scale) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <th>${scale}</th>
    <td style="--scale: ${scale}"><input class="Switch" type="checkbox" role="switch" data-case="current" data-scale="${scale}" /></td>
    <td style="--scale: ${scale}"><input class="Switch is-snapped" type="checkbox" role="switch" data-case="snapped" data-scale="${scale}" /></td>`;
  table.append(row);
});
