const WIDTH  = 1000;
const HEIGHT = 800;
canvas.width  = WIDTH;
canvas.height = HEIGHT;
canvas.style.background = "black";
const ctx = canvas.getContext("2d");
if (!ctx) throw("Error: Could not initialize 2d context");

const graph = [
  {
    adjacents: [2, 3],
    position: generateRandomPosition()
  },
  {
    adjacents: [4, 5],
    position: generateRandomPosition()
  },
  {
    adjacents: [6, 7],
    position: generateRandomPosition()
  },
  {
    adjacents: [],
    position: generateRandomPosition()
  },
  {
    adjacents: [],
    position: generateRandomPosition()
  },
  {
    adjacents: [],
    position: generateRandomPosition()
  },
  {
    adjacents: [],
    position: generateRandomPosition()
  },
  {
    adjacents: [],
    position: generateRandomPosition()
  }
];

function drawCircle(ctx, pos, radius, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function drawLine(ctx, startPos, endPos, color, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function lerp(x, y, t) {
  return x + (y - x) * t;
}

function generateRandomPosition() {
  const x_rand = lerp(WIDTH/3, 2 * WIDTH/3, Math.random());
  const y_rand = lerp(HEIGHT/3, 2 * HEIGHT/3, Math.random());
  return { x: x_rand, y: y_rand };
}

let prev_time = null;
let dt = null;
let speed = 0.0002;
let MAX_ITERATIONS = 400;
let iteration = 0;
let step = 1 / MAX_ITERATIONS;

function frame() {
  let cur_time = Date.now();
  if (prev_time) {
    dt = cur_time - prev_time;
  }
  prev_time = cur_time;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (const node of graph) {
    drawCircle(ctx, node.position, 10, "#FFFFFF");
    for (const adj_node of node.adjacents) {
      drawLine(ctx, node.position, graph[adj_node].position, "#FFFFFF");
    }
  }

  if (iteration <= MAX_ITERATIONS) {
    // k: ideal distance
    const k = 50;

    const frs = [];
    const fas = [];
    for (let i = 0; i < graph.length; i++) {
      // fr: Repulsive force between one vertex against all the other vertices
      let fr_x = 0;
      let fr_y = 0;
      for (let j = 0; j < graph.length; j++) {
        if (j == i) continue;
        const dx = graph[i].position.x - graph[j].position.x;
        const dy = graph[i].position.y - graph[j].position.y;
        const dist = Math.sqrt(Math.pow(dx, 2) + (Math.pow(dy, 2)));
        const fr = k*k / dist;
        fr_x += (fr * dx) / dist;
        fr_y += (fr * dy) / dist;
      }
      frs.push({fr_x, fr_y});

      // fa: Attraction force between adjacent nodes
      let fa_x = 0;
      let fa_y = 0;
      for (const v_adj of graph[i].adjacents) {
        const dx = graph[v_adj].position.x - graph[i].position.x;
        const dy = graph[v_adj].position.y - graph[i].position.y;
        const dist = Math.sqrt(Math.pow(dx, 2) + (Math.pow(dy, 2)));
        const fa = dist*dist / k;
        fa_x += (fa * dx) / dist;
        fa_y += (fa * dy) / dist;
      }
      fas.push({fa_x, fa_y});
    }

    const cooling_factor = lerp(1, 0, step * iteration);
    for (let i = 0; i < graph.length; i++) {
      graph[i].position.x += (frs[i].fr_x + fas[i].fa_x) * (dt*speed) * cooling_factor;
      graph[i].position.y += (frs[i].fr_y + fas[i].fa_y) * (dt*speed) * cooling_factor;
    }
  }

  iteration += 1;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);


