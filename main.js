const info = document.getElementById("info");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const acanvas = document.getElementById("arrow");
const actx = acanvas.getContext("2d");

const ctxChart = document.getElementById("myChart").getContext("2d");
let myChart;

// inputの値取得
const m0 = document.getElementById("mass");
const q0 = document.getElementById("charge");
const vx0 = document.getElementById("init_vx");
const vy0 = document.getElementById("init_vy");
const e0 = document.getElementById("elec_field");
const b0 = document.getElementById("mag_field");

// inputに値を返す(visualize)
const m0_value = document.getElementById("mass_value");
const q0_value = document.getElementById("charge_value");
const vx0_value = document.getElementById("vx0_value");
const vy0_value = document.getElementById("vy0_value");
const e0_value = document.getElementById("ef_value");
const b0_value = document.getElementById("mf_value");
const theta_value = document.getElementById("theta_value");

// 各種パラメータ
let p; // 荷電粒子
let B; // 磁束密度（z方向）
let E;
const STEP = 0.05; // 時間刻み幅
let time; // 経過時間

let M, Q;
let X0, Y0, VX0, VY0;
let theta; // 電場ベクトルの角度

const DATA_SIZE = 600;
let tData = [];
let vxData = [];
let vyData = [];

let anime; // アニメーションフラグ
let animeOnce; // 1ステップアニメーションフラグ
let drag = false;

// 座標系の設定（中央原点のデカルト座標系）
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

X0 = Y0 = 0;

// 初期化（初回読込時 ＆ リセットボタンが押されたとき）
function init() {
  // 各種変数の初期化
  ctx.clearRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  anime = false;
  animeOnce = false;
  time = 0;
  theta = 0;
  M = parseFloat(m0.value);
  m0_value.innerHTML = M;
  Q = parseFloat(q0.value);
  q0_value.innerHTML = Q;
  VX0 = parseFloat(vx0.value);
  vx0_value.innerHTML = VX0;
  VY0 = parseFloat(vy0.value);
  vy0_value.innerHTML = VY0;
  B = parseFloat(b0.value);
  b0_value.innerHTML = B;
  E = parseFloat(e0.value);
  e0_value.innerHTML = E;
  theta_value.innerHTML = Math.round(theta * 100) / 100;
  // 初期座標はprevと同じ
  p = {
    x: X0,
    xPrev: X0,
    y: Y0,
    yPrev: Y0,
    vx: VX0,
    vxPrev: VX0,
    vy: VY0,
    vyPrev: VY0,
    m: M,
    q: Q,
  };

  vxData = [VX0];
  vyData = [VY0];
  document.getElementById("btnAnime").value = "アニメーション開始";
  document.getElementById("btnStep").disabled = false;
  document.getElementById("text-x").innerHTML = Math.round(p.x * 10) / 10;
  document.getElementById("text-y").innerHTML = Math.round(p.y * 10) / 10;
  document.getElementById("text-vx").innerHTML = Math.round(p.vx * 10) / 10;
  document.getElementById("text-vy").innerHTML = Math.round(p.vy * 10) / 10;
  draw();
  drawChart();
}

// 描画処理
function draw() {
  a_init();
  // キャンバスのリセット
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  ctx.fillStyle = "black";

  // 枠線の描画
  ctx.strokeStyle = "black";
  ctx.strokeRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  // 磁場の方向を図示
  ctx.beginPath();
  ctx.arc(
    -canvas.width / 2 + 15,
    -canvas.height / 2 + 11.5,
    2.5,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    -canvas.width / 2 + 15,
    -canvas.height / 2 + 11.5,
    7.5,
    0,
    2 * Math.PI
  );
  ctx.stroke();

  ctx.scale(1, -1);
  ctx.font = '17px "Meiryo", sans-serif';
  ctx.fillText("B", canvas.width / 2 - 572, canvas.height / 2 - 5);
  ctx.scale(1, -1);

  // 荷電粒子の描画
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
  ctx.fill();

  // 経過時間の表示
  info.innerHTML = "Time: " + time.toFixed(2) + " s";

  if (anime || animeOnce) {
    if (animeOnce) animeOnce = false;

    // 修正オイラー法
    xEuler = p.xPrev + STEP * p.vxPrev;
    yEuler = p.yPrev + STEP * p.vyPrev;
    vxEuler =
      p.vxPrev + (STEP * p.q * (E * Math.cos(theta) + p.vyPrev * B)) / p.m;
    vyEuler =
      p.vyPrev + STEP * ((-p.q * (E * Math.sin(theta) + p.vxPrev * B)) / p.m);

    // 座標の更新
    p.x = p.xPrev + (STEP / 2) * (p.vxPrev + vxEuler);
    p.y = p.yPrev + (STEP / 2) * (p.vyPrev + vyEuler);

    // 速度の更新
    p.vx =
      p.vxPrev +
      ((STEP / 2) * p.q * (E * Math.cos(theta) + (p.vyPrev + vyEuler) * B)) /
        p.m;
    p.vy =
      p.vyPrev +
      (STEP / 2) *
        ((-p.q * (E * Math.sin(theta) + (p.vxPrev + vxEuler)) * B) / p.m);

    // 経過時間の計算
    time += STEP;

    // 値の更新
    p.xPrev = p.x;
    p.yPrev = p.y;
    p.vxPrev = p.vx;
    p.vyPrev = p.vy;
    document.getElementById("text-x").innerHTML = Math.round(p.x * 10) / 10;
    document.getElementById("text-y").innerHTML = Math.round(p.y * 10) / 10;
    document.getElementById("text-vx").innerHTML = Math.round(p.vx * 10) / 10;
    document.getElementById("text-vy").innerHTML = Math.round(p.vy * 10) / 10;

    if (time < STEP * DATA_SIZE) {
      vxData.push(p.vx);
      vyData.push(p.vy);
    }

    drawChart();

    // 描画の更新
    requestAnimationFrame(draw);
  }
}

// アニメーション開始ボタンが押されたとき
function startAnime() {
  if (anime) {
    anime = false;
    document.getElementById("btnAnime").value = "アニメーション再開";
    document.getElementById("btnStep").disabled = false;
  } else {
    anime = true;
    document.getElementById("btnAnime").value = "アニメーション停止";
    document.getElementById("btnStep").disabled = true;
    draw();
  }
}

// 1ステップ進むボタンが押されたとき
function stepOnce() {
  animeOnce = true;
  draw();
}

canvas.addEventListener("click", function (e) {
  if (!anime) {
    // 親要素のマージンを取得し、マウスの相対座標を計算
    let rect = e.target.getBoundingClientRect();
    X0 = e.clientX - canvas.width / 2 - 10;
    Y0 = canvas.height / 2 - (e.clientY - rect.top);
    init();
    draw();
    document.getElementById("text-x").innerHTML = X0;
    document.getElementById("text-y").innerHTML = Math.round(Y0 * 10) / 10;
  }
});

// 電場ベクトルの処理

actx.translate(acanvas.width / 2, acanvas.height / 2);
actx.scale(1, -1);

function a_init() {
  actx.clearRect(
    -acanvas.width / 2,
    -acanvas.height / 2,
    acanvas.width,
    acanvas.height
  );
  actx.strokeRect(
    -acanvas.width / 2,
    -acanvas.height / 2,
    acanvas.width,
    acanvas.height
  );

  x = 50 * Math.cos(theta);
  y = 50 * Math.sin(theta);
  actx.beginPath();
  actx.moveTo(0, 0);
  actx.lineTo(x, y);
  actx.stroke();
  actx.beginPath();
  actx.moveTo(x, y);
  actx.lineTo(
    x + 10 * Math.cos(theta + (135 / 180) * Math.PI),
    y + 10 * Math.sin(theta + (135 / 180) * Math.PI)
  );
  actx.stroke();
  actx.beginPath();
  actx.moveTo(x, y);
  actx.lineTo(
    x + 10 * Math.cos(theta - (135 / 180) * Math.PI),
    y + 10 * Math.sin(theta - (135 / 180) * Math.PI)
  );
  actx.stroke();

  actx.scale(1, -1);
  actx.font = '15px "Meiryo", sans-serif';
  actx.fillText("E", acanvas.width / 2 - 15, acanvas.height / 2 - 5);
  actx.scale(1, -1);
}

acanvas.addEventListener("mousemove", function (e) {
  if (!anime && drag) {
    let rect = e.target.getBoundingClientRect();
    X = e.clientX - canvas.width - acanvas.width / 2;
    Y = acanvas.height / 2 - (e.clientY - rect.top);
    theta = Math.atan2(Y, X);
    theta_value.innerHTML = Math.round(theta * 100) / 100;
    a_init();
  }
});

// マウスが押下されたとき
acanvas.addEventListener("mousedown", function (e) {
  if (!anime) drag = true;
});

// マウスが離されたとき
acanvas.addEventListener("mouseup", function (e) {
  if (!anime) drag = false;
});

init();

function drawChart() {
  if (myChart) myChart.destroy();

  for (let i = 0; i <= DATA_SIZE; i++) {
    tData[i] = (i * STEP).toFixed(2);  
  }

  myChart = new Chart(ctxChart, {
    type: "line",
    data: {
      labels: tData,
      datasets: [
        {
          label: "速度x成分",
          type: "line",
          data: vxData,
          fill: false,
          borderColor: "red",
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: "速度y成分",
          type: "line",
          data: vyData,
          fill: false,
          borderColor: "blue",
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    
    options: {
      scales: {
        y: {
          display: true,
          title: {
            display: true, 
            text: "Velocity [m/s]",
          },
          min: -100,
          max: 100,
        },
        x: {
          display: true,
          title: {
            display: true, 
            text: "Time [s]", 
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: '粒子の速度成分',
          font: {
            size: 20
          }
        },
      },
      animation: false,
    },
  });
}
