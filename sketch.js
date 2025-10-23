// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字
let fireworks = []; // 【新增】存放所有煙火物件的陣列


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
        
        // 【新增】如果分數是滿分，開始啟用 draw 迴圈
        if (finalScore > 0 && finalScore === maxScore) {
            loop(); // 滿分時開啟 p5.js 的循環繪製
        } else {
            noLoop(); // 非滿分或尚未收到分數時停止循環繪製，只繪製一次
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    colorMode(HSB); // 【新增】切換到 HSB 模式，方便顏色控制
    noLoop(); // 預設停止循環繪製
} 


function draw() { 
    // 【修改】背景使用半透明黑色，創造尾跡效果
    background(0, 0, 0, 0.2); 

    // 計算百分比
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (finalScore > 0 && finalScore === maxScore) {
        // 【修改】滿分：顯示鼓勵文本，使用鮮豔顏色
        fill(random(0, 50), 255, 255); // 隨機顏色
        text("【滿分】恭喜！完美表現！", width / 2, height / 2 - 50);
        
        // 【新增煙火邏輯】每 5 幀 (Frame) 產生一個煙火
        if (frameCount % 5 === 0) {
            // 隨機在畫布下半部生成煙火
            fireworks.push(new Firework(random(width), height, true)); 
        }
        
    } else if (percentage >= 90) {
        // 高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色
        fill(45, 100, 100); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色
        fill(0, 200, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(0, 0, 100); // 白色
        text("等待成績數據...", width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(0, 0, 70); // 灰色
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // C. 【新增】更新和顯示所有煙火和粒子
    // -----------------------------------------------------------------
    
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();
        
        if (fireworks[i].isFinished()) {
            fireworks.splice(i, 1);
        }
    }
}


// =================================================================
// 步驟三：【新增】煙火和粒子系統的 Class 定義
// -----------------------------------------------------------------

// 單個粒子 Class
class Particle {
    constructor(x, y, hue, firework = false) {
        this.pos = createVector(x, y);
        this.firework = firework;
        this.lifespan = 255;
        this.hu = hue;
        
        if (this.firework) {
            // 煙火上升階段：向上的速度
            this.vel = createVector(0, random(-10, -15));
        } else {
            // 爆炸粒子階段：隨機向外爆炸的速度
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10)); // 爆炸速度
        }
        
        this.acc = createVector(0, 0);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
            // 爆炸粒子：應用重力和衰減壽命
            this.vel.mult(0.9); // 速度衰減
            this.lifespan -= 4; // 壽命減少
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0); // 清除加速度
    }

    show() {
        colorMode(HSB);
        if (!this.firework) {
            // 爆炸粒子：顯示為小圓點，顏色為隨機色，透明度隨壽命衰減
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan);
            point(this.pos.x, this.pos.y);
        } else {
            // 煙火上升階段：顯示為帶有拖尾效果的圓點
            strokeWeight(4);
            stroke(this.hu, 255, 255);
            point(this.pos.x, this.pos.y);
        }
    }

    finished() {
        return this.lifespan < 0;
    }
}

// 煙火 Class
class Firework {
    constructor(x, y, isLaunch = false) {
        this.hu = random(255); // 隨機顏色
        this.firework = new Particle(x, y, this.hu, true); // 煙火主體 (火箭)
        this.exploded = false;
        this.particles = [];
        this.gravity = createVector(0, 0.2); // 重力
        this.isLaunch = isLaunch; // 是否剛發射，用於只發射一次
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(this.gravity);
            this.firework.update();

            // 檢查是否達到爆炸條件 (速度為負或到達頂點)
            if (this.firework.vel.y >= 0 && this.isLaunch) {
                this.exploded = true;
                this.explode();
            }
        }

        // 更新爆炸後的所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(this.gravity);
            this.particles[i].update();
            if (this.particles[i].finished()) {
                this.particles.splice(i, 1);
            }
        }
    }

    explode() {
        // 產生大量粒子
        for (let i = 0; i < 100; i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }
        
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].show();
        }
    }

    isFinished() {
        // 如果煙火已爆炸且所有粒子都消失，則結束
        return this.exploded && this.particles.length === 0;
    }
}

// 確保在視窗大小改變時重設畫布大小 (可選)
function windowResized() {
    resizeCanvas(windowWidth / 2, windowHeight / 2);
    // 重設畫布後，如果不在循環狀態，需要手動繪製一次
    if (finalScore !== maxScore) {
        redraw();
    }
}
