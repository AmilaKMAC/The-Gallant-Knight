const knight = document.getElementById('knight');

let bg_music = new Audio("resources/sound/background.mp3");
let run_sound = new Audio("resources/sound/run.wav");
let jump_sound = new Audio("resources/sound/jump.mp3");
let dead_music = new Audio("resources/sound/dead.mp3");

run_sound.loop = true;

// Idle
let idle_animation = 0;
let idle_image_no = 0;

function IdleImages() {
    idle_image_no++;
    if (idle_image_no == 11) {
        idle_image_no = 1;
    }
    knight.src = `resources/png/Idle (${idle_image_no}).png`;
}

function IdleKnight() {
    idle_animation = setInterval(IdleImages, 100);
    bg_music.play(); 
    bg_music.loop = true; 
    run_sound.pause(); 
}

// Run
let run_image_no = 0;
let run_animation = 0;

function RunImages() {
    run_image_no++;
    if (run_image_no == 11) {
        run_image_no = 1;
    }
    knight.src = `resources/png/Run (${run_image_no}).png`;
}

function RunKnight() {
    run_animation = setInterval(RunImages, 70);
    clearInterval(idle_animation);
    run_sound.play(); 
}

// Background
let background_image_position_X = 0;
let move_background_animation = 0;
let score = 0;

function moveBackground() {
    background_image_position_X -= 15;
    document.getElementById("background").style.backgroundPositionX = background_image_position_X + "px";
    score++;
    document.getElementById("score").innerHTML = score;
}

// Jump
let jump_image_no = 1;
let jump_animation = 0;
let knightMarginTop = 620;

function JumpImages() {
    jump_image_no++;

    if (jump_image_no <= 6) {
        knightMarginTop -= 60;
        knight.style.marginTop = knightMarginTop + "px";
    }

    if (jump_image_no >= 7) {
        knightMarginTop += 60;
        knight.style.marginTop = knightMarginTop + "px";
    }

    if (jump_image_no == 11) {
        jump_image_no = 1;
        clearInterval(jump_animation);
        jump_animation = 0;
        run_image_no = 0;
        RunKnight();
    }
    knight.src = `resources/png/Jump (${jump_image_no}).png`;
}

function JumpKnight() {
    clearInterval(idle_animation);
    i = 0;
    clearInterval(run_animation);
    jump_sound.play();
    jump_animation = setInterval(JumpImages, 150);
    run_sound.pause(); 
}

// Obstacle
let obstacleSpeed = 30;

let lastObstaclePosition = 0;
let minDistance = 800; // Minimum distance between obstacles
let maxDistance = 3000; // Maximum distance between obstacles

function createObstacle() {
    let box = document.createElement("div");
    box.className = "obstacle";
    document.getElementById("background").appendChild(box);

    let randomPosition;

    do {
        randomPosition = lastObstaclePosition + minDistance + Math.floor(Math.random() * (maxDistance - minDistance));
    } while (randomPosition < lastObstaclePosition + minDistance);

    box.style.marginLeft = randomPosition + "px";

    lastObstaclePosition = randomPosition;

    box.setAttribute('data-speed', obstacleSpeed);
}



let obstacle_animation = 0;

function ObstacleAnimation() {
    const obstacles = document.querySelectorAll(".obstacle");

    obstacles.forEach((box) => {
        let currentMarginLeft = parseInt(getComputedStyle(box).marginLeft);
        let speed = parseInt(box.getAttribute('data-speed')); // Get speed of the current obstacle
        let newMarginLeft = currentMarginLeft - speed;
        box.style.marginLeft = newMarginLeft + "px";

        // Check collision
        if (newMarginLeft >= -1100 && newMarginLeft <= -500) {
            if (knightMarginTop > 550) {
                box.style.display = "none";

                clearInterval(obstacle_animation);
                clearInterval(run_animation);
                run_animation = -1;

                clearInterval(jump_animation);
                jump_animation = -1;

                clearInterval(move_background_animation);
                move_background_animation = -1;

                death_animation = setInterval(DeathKnight, 100);
                run_sound.pause(); 
                dead_music.play(); 
            }
        }
    });
}

// Death
let death_image_no = 1;
let death_animation = 0;

function DeathKnight() {
    death_image_no++;

    if (death_image_no == 11) {
        death_image_no = 10;

        document.getElementById("pause-overlay").style.display = "none";
        document.getElementById("end").style.visibility = "visible";
        document.getElementById("endscore").innerHTML = score;

        isDead = true;
    }

    knightMarginTop = 630;
    knight.style.marginTop = knightMarginTop + "px";

    knight.src = `resources/png/Dead (${death_image_no}).png`;
    clearInterval(obstacle_animation);
    obstacle_animation = -1;
}

// Reload Function
function reload() {
    window.location.href = "index.html";
}


let isDead = false;
let paused = true;
let wasJumping = false;

// Reset game
function resetGame() {
    isDead = false;
    score = 0;
    document.getElementById("score").innerHTML = score;
    document.getElementById("end").style.visibility = "hidden";

    knight.src = `resources/png/Idle (1).png`;
    knight.style.marginTop = "620px";

    clearInterval(run_animation);
    clearInterval(jump_animation);
    clearInterval(move_background_animation);
    clearInterval(obstacle_animation);

    run_animation = 0;
    jump_animation = 0;
    move_background_animation = 0;
    obstacle_animation = 0;

    startGame();
}

// Start game
function startGame() {
    if (isDead) {
        resetGame();
    }

    if (run_animation == 0 && !wasJumping) {
        RunKnight();
    }

    if (move_background_animation == 0) {
        move_background_animation = setInterval(moveBackground, 10);
    }

    if (obstacle_animation == 0) {
        obstacle_animation = setInterval(ObstacleAnimation, 8);
    }

    if (wasJumping && jump_animation == 0) {
        JumpKnight();
    }

    document.getElementById("pause-overlay").style.display = "none";
}

// Pause game
// Pause game
function pauseGame() {
    clearInterval(run_animation);
    run_animation = 0;

    if (jump_animation !== 0) {
        wasJumping = true;
        clearInterval(jump_animation);
        jump_animation = 0;
    } else {
        wasJumping = false;
    }

    clearInterval(move_background_animation);
    move_background_animation = 0;

    clearInterval(obstacle_animation);
    obstacle_animation = 0;

    run_sound.pause(); 
    document.getElementById("pause-overlay").style.display = "block";
}

// Key events
function keyCheck(event) {
    let keyCode = event.which;

    if (isDead) return;

    if (keyCode == 13) {
        if (paused) {
            startGame();
        } else {
            pauseGame();
        }
        paused = !paused;
    }

    if (!paused && keyCode == 32) {
        if (jump_animation == 0) {
            JumpKnight();
        }
    }
}

setInterval(createObstacle, Math.random() * 2000 + 2000);
