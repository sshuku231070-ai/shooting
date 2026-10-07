// 必要な変数を定義する (02)
let mode = 0;
let score;
let playerImage;
let playerX;
let playerY;
let enemyImage;
let enemyX;
let enemyY;
let enemyHit;
let enemyTime;
let bulletImage;
let bulletX;
let bulletY;
let bulletHit;
let stars = [];
let itemX;
let itemY;
let itemType;
let itemActive;
let shieldActive;
let tripleShotUntil;

function preload() {
    // 画像を読み込む (02)
    playerImage = loadImage("image/player.png");
    enemyImage = loadImage("image/enemy.png");
    bulletImage = loadImage("image/bullet.png");
}

function setup() {
    createCanvas(500, 500);
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            speed: random(0.5, 2.5),
            size: random(1, 3),
            warm: random() < 0.2
        });
    }
    resetGame();
}

function resetGame() {
    // 変数を初期化する (02)
    score = 0;
    playerX = width / 2;
    playerY = height - 50;
    enemyX = [];
    enemyY = [];
    enemyHit = [];
    enemyTime = millis();
    bulletX = [];
    bulletY = [];
    bulletHit = [];
    itemX = [];
    itemY = [];
    itemType = [];
    itemActive = [];
    shieldActive = false;
    tripleShotUntil = 0;
}

function draw() {
    drawBackground();
    fill("#FFFFFF");

    if (mode === 0) {
        // スタート画面の表示 (09)
        textAlign(CENTER);
        text("スペースキーでスタート", width / 2, height / 2);
        return;
    }

    if (mode === 1) {
        // 自機を動かす (04)
        if (keyIsDown(LEFT_ARROW)) {
            playerX -= 5;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            playerX += 5;
        }
        playerX = constrain(playerX, 25, width - 25);

        // 敵を増やす (05)
        if (millis() - enemyTime > 1000) {
            enemyTime = millis();
            enemyX.push(random(0, width));
            enemyY.push(0);
            enemyHit.push(false);
        }

        // 敵と弾を動かす (05)(06)
        for (let i = 0; i < enemyY.length; i++) {
            enemyY[i] += 4;
            if (!enemyHit[i] &&
                abs(enemyX[i] - playerX) < 50 &&
                abs(enemyY[i] - playerY) < 50) {
                if (shieldActive) {
                    shieldActive = false;
                    enemyHit[i] = true;
                } else {
                    mode = 2;
                }
            }
        }
        for (let i = 0; i < bulletY.length; i++) {
            bulletY[i] -= 10;
        }
        for (let i = 0; i < itemY.length; i++) {
            if (!itemActive[i]) {
                continue;
            }
            itemY[i] += 3;
            if (abs(itemX[i] - playerX) < 35 && abs(itemY[i] - playerY) < 35) {
                itemActive[i] = false;
                if (itemType[i] === "shield") {
                    shieldActive = true;
                } else {
                    tripleShotUntil = millis() + 8000;
                }
            } else if (itemY[i] > height + 20) {
                itemActive[i] = false;
            }
        }

        // 敵と弾が当たったらスコアを増やす (07)
        for (let i = 0; i < enemyX.length; i++) {
            for (let j = 0; j < bulletX.length; j++) {
                if (!enemyHit[i] && !bulletHit[j] &&
                    enemyX[i] - 30 < bulletX[j] && bulletX[j] < enemyX[i] + 30 &&
                    enemyY[i] - 20 < bulletY[j] && bulletY[j] < enemyY[i] + 20) {
                    enemyHit[i] = true;
                    bulletHit[j] = true;
                    score += 100;
                    if (random() < 0.3) {
                        itemX.push(enemyX[i]);
                        itemY.push(enemyY[i]);
                        itemType.push(random() < 0.5 ? "shield" : "triple");
                        itemActive.push(true);
                    }
                }
            }
        }

        // 自機・敵・弾を表示する (03)
        imageMode(CENTER);
        image(playerImage, playerX, playerY, 50, 50);
        for (let i = 0; i < enemyX.length; i++) {
            if (!enemyHit[i]) {
                image(enemyImage, enemyX[i], enemyY[i], 50, 50);
            }
        }
        for (let i = 0; i < bulletX.length; i++) {
            if (!bulletHit[i]) {
                image(bulletImage, bulletX[i], bulletY[i], 20, 20);
            }
        }
        for (let i = 0; i < itemX.length; i++) {
            if (!itemActive[i]) {
                continue;
            }
            noStroke();
            if (itemType[i] === "shield") {
                fill(75, 235, 220);
            } else {
                fill(255, 190, 85);
            }
            circle(itemX[i], itemY[i], 26);
            fill("#07121F");
            textAlign(CENTER, CENTER);
            textSize(13);
            text(itemType[i] === "shield" ? "S" : "3", itemX[i], itemY[i]);
        }
        if (shieldActive) {
            noFill();
            stroke(75, 235, 220, 190);
            strokeWeight(2);
            circle(playerX, playerY, 68);
            noStroke();
        }

        // スコアを表示する (08)
        fill("#FFFFFF");
        textAlign(LEFT);
        textSize(22);
        text("SCORE: " + score, 12, 30);
        textAlign(RIGHT);
        textSize(12);
        if (shieldActive) {
            text("SHIELD", width - 10, 20);
        } else if (tripleShotUntil > millis()) {
            text("3-WAY", width - 10, 20);
        }
        return;
    }

    if (mode === 2) {
        // 終了画面の表示 (09)
        textAlign(CENTER);
        textSize(30);
        text("SCORE: " + score, width / 2, height / 2 - 50);
        textSize(14);
        text("スペースキーでもう一度プレイ", width / 2, height / 2);
    }
}

function drawBackground() {
    const topColor = color("#07121F");
    const bottomColor = color("#102A3A");
    noStroke();
    for (let y = 0; y < height; y += 10) {
        fill(lerpColor(topColor, bottomColor, y / height));
        rect(0, y, width, 10);
    }

    for (const star of stars) {
        star.y += star.speed;
        if (star.y > height) {
            star.y = 0;
            star.x = random(width);
        }

        if (star.warm) {
            stroke(255, 190, 120, 130);
            fill(255, 215, 160);
        } else {
            stroke(100, 220, 255, 130);
            fill(170, 240, 255);
        }
        strokeWeight(star.size * 0.6);
        line(star.x, star.y - star.speed * 2, star.x, star.y);
        noStroke();
        circle(star.x, star.y, star.size);
    }
}

function keyPressed() {
    if (key === " ") {
        if (mode === 0 || mode === 2) {
            resetGame();
            mode = 1;
        } else if (mode === 1) {
            // 弾を打つ (06)
            bulletX.push(playerX);
            bulletY.push(playerY - 25);
            bulletHit.push(false);
            if (tripleShotUntil > millis()) {
                bulletX.push(playerX - 15, playerX + 15);
                bulletY.push(playerY - 25, playerY - 25);
                bulletHit.push(false, false);
            }
        }
    }
}