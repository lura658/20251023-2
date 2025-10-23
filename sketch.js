// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字


window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    noLoop(); // 如果您希望分數只有在改變時才繪製，保留此行
} 

// score_display.js 中的 draw() 函數片段

function draw() { 
    background(255); // 清除背景

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 [6]
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 [6]
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色 [6]
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 [7]
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 [4]
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // 如果您想要更複雜的視覺效果，還可以根據分數修改線條粗細 (strokeWeight) 
    // 或使用 sin/cos 函數讓圖案的動畫效果有所不同 [8, 9]。
}

// === Firework 特效系統 ===
let fireworks = [];
let showFireworks = false;

class Particle {
  constructor(x, y, color) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 6));
    this.acc = createVector(0, 0.05);
    this.lifespan = 255;
    this.color = color;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }

  show() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    ellipse(this.pos.x, this.pos.y, 6);
  }

  done() {
    return this.lifespan < 0;
  }
}

class Firework {
  constructor(x, y, color) {
    this.particles = [];
    for (let i = 0; i < 80; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update() {
    for (let p of this.particles) {
      p.update();
    }
    this.particles = this.particles.filter(p => !p.done());
  }

  show() {
    for (let p of this.particles) {
      p.show();
    }
  }

  done() {
    return this.particles.length === 0;
  }
}

// === 在 draw() 裡加入這段 ===
function draw() {
  background(0);
  // 原本的遊戲內容...
  // 假設有 percentage 變數

  if (percentage >= 90) {
    if (!showFireworks) {
      triggerFireworks();
      showFireworks = true;
    }
  }

  // 更新與顯示煙火
  for (let fw of fireworks) {
    fw.update();
    fw.show();
  }
  fireworks = fireworks.filter(fw => !fw.done());
}

// 觸發煙火
function triggerFireworks() {
  for (let i = 0; i < 5; i++) {
    let x = random(width * 0.2, width * 0.8);
    let y = random(height * 0.2, height * 0.5);
    let color = color(random(150, 255), random(150, 255), random(150, 255));
    fireworks.push(new Firework(x, y, color));
  }
}
