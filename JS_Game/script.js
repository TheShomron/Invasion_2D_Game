addEventListener('load', function () {
    //canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1768;
    canvas.height = 1000;
    


    class InputHandler {
        constructor(game) {
            this.game = game;

            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown')
                    && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.Player.shoot();
                }
                else if (e.key === 'd' || e.key === 'D') {
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });


        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markForDelete = false;
            this.image = document.getElementById('projectile')
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markForDelete = true;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }
    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.framey = Math.floor(Math.random() * 3);
            this.sheetSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.sheetSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() - 15;
            this.gravity = 0.5;
            this.markForDelete = false;
            this.angle = 0;
            this.rotationSpeed = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.floorY = 100;
        }
        update() {
            this.angle += this.rotationSpeed;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            //out of bounds
            if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markForDelete = true;

            if (this.bounced <= 2 && this.y > this.game.height - this.floorY) {
                this.bounced++;
                this.speedY *= -0.7;
            }
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.sheetSize, this.framey * this.sheetSize
                , this.sheetSize, this.sheetSize
                , this.size * -0.5, this.size * -0.5, this.size, this.size)

            context.restore();
        }
    }
    class Player {
        constructor(game) {
            this.game = game
            this.width = 120
            this.height = 190
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 5;
            this.projectiles = [];
            this.image = document.getElementById('player')
            this.frameX = 0;
            this.framey = 0;
            this.maxFrame = 37;
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 7500;
        }

        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            //handle projectiles
            this.projectiles.forEach(projectile => { projectile.update(); });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markForDelete);
            //powerUps
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.framey = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.framey = 1;
                    this.game.ammo += 0.1;
                }
            }
            //boundries
            if (this.y > this.game.height - this.height) {
                this.y = this.game.height - this.height;
            }
            else if (this.y < 0) this.y = 0;
        }
        draw(context) {
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => { projectile.draw(context); });
            context.drawImage(this.image, this.frameX * this.width, this.framey * this.height, this.width, this.height
                , this.x, this.y, this.width, this.height);
            //animate
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        shoot() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 28))
                this.game.ammo--;
            }
            if (this.powerUp) this.powerShoot();
        }
        powerShoot() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175))
                this.game.ammo--;
            }
        }
        enterPowerMode() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markForDelete = false;
            this.frameX = 0;
            this.framey = 0;
            this.maxFrame = 37;


        }
        update() {
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markForDelete = true;
            //
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        draw(context) {

            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.font = '30px helvetica ';
                context.fillStyle = 'black';
                context.fillText(this.lives, this.x, this.y)
            }


            context.drawImage(this.image, this.frameX * this.width, this.framey * this.height
                , this.width, this.height,
                this.x, this.y, this.width, this.height)

        }
    }
    class Pawn extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('pawn');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 2;
            this.points = this.lives;

        }
    }
    class Knight extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('knight');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.points = this.lives;

        }
    }
    class PowerFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('powerFish');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 15;
            this.points = this.lives;
            this.type = 'power';

        }
    }
    class whaleCarrier extends Enemy {
        constructor(game) {
            super(game);
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('whaleCarrier');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 12;
            this.points = this.lives;
            this.type = 'carrier';
            this.speedX = (Math.random() * -1.2 - 0.2);


        }
    }
    class kamikazeFish extends Enemy {
        constructor(game, x, y) {
            super(game);
            this.width = 115;
            this.height = 95;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('kamikazeFish');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 2;
            this.points = this.lives;
            this.speedX = (Math.random() * -3.5 - 7);


        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 1000;
            this.x = 0;
            this.y = 0;
        }
        update() {
            if (this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(game, this.image1, 1);
            this.layer2 = new Layer(game, this.image2, 1);
            this.layer3 = new Layer(game, this.image3, 1);
            this.layer4 = new Layer(game, this.image4, 1);
            this.layers = [this.layer1,this.layer2,this.layer3,this.layer4];
        }
        update() {
            this.layers.forEach(layer => layer.update())
        }
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 40;
            this.fontFamily = 'Silkscreen';
            this.color = 'white';






        }
        draw(context) {
            context.save();
            context.fillStyle = this.color;

            //Score display
            context.font = '40px ' + this.fontFamily;
            context.fillText('Score: ' + this.game.score, 19, 38)


            //Game Timer dispaly
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1)
            context.fillText('Timer: ' + formattedTime, 19, 102);

            //game over display
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score >= this.game.winningScore) {
                    message1 = 'You Won!';
                    message2 = 'Good Job.';
                } else {
                    message1 = 'You Lost!'
                    message2 = 'Try Again Next Time.'
                }
                context.font = '100px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40)
                context.font = '65px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40)
            }

            //ammo dispplay
            if (this.game.Player.powerUp) context.fillStyle = '#ffffbd'
            for (let i = 0; i <= this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }

            context.restore();
        }
    }
    class Explosion {
        constructor(game, x, y) {
            this.game = game;
            this.frameX = 0;
            this.sheetHeight = 200;
            this.sheetWidth = 200;
            this.width = this.sheetHeight;
            this.height = this.sheetHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.timer = 0;
            this.fps = 20;
            this.timeInterval = 1000 / this.fps;
            this.markForDelete = false;
        }
        update(deltaTime) {
            this.x -= this.game.speed;
            if (this.timer > this.timeInterval) {
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }

            if (this.frameX > this.maxFrame) this.markForDelete = true;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.sheetWidth, 0,
                this.sheetWidth, this.sheetHeight,
                this.x, this.y,
                this.width, this.height);
        }
    }
    class Smoke extends Explosion {
        constructor(game, x, y) {
            super(game, x, y);
            this.image = document.getElementById('smoke');   
        }
    }
    class Fire extends Explosion {
        constructor(game, x, y) {
            super(game, x, y);
            this.image = document.getElementById('fire');
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.Background = new Background(this);
            this.Player = new Player(this);
            this.Input = new InputHandler(this);
            this.UI = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.Particles = [];
            this.Explosions = [];
            this.ammo = 30;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 350;
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 100;
            this.gameTime = 0;
            this.gameLimit = 61000; //millisecoends
            this.speed = 3;
            this.debug = false;
        }
        update(deltaTime) {
            //Game-Time
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.gameLimit) this.gameOver = true;

            this.Background.update();
            this.Player.update(deltaTime);

            //ammo timer
            if (this.ammoTimer > this.ammoInterval) {
                if (this.maxAmmo > this.ammo) {
                    this.ammo++;
                }
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }

            //particals
            this.Particles.forEach(particle => particle.update());
            this.Particles = this.Particles.filter(particle => !particle.markForDelete);

            //Explosions
            this.Explosions.forEach(explosion => explosion.update(deltaTime));
            this.Explosions = this.Explosions.filter(explosion => !explosion.markForDelete);

            //enemy Timer
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

            //options for enemy collisions  
            this.enemies.forEach(enemy => {
                enemy.update()
                //player hit enemy
                if (this.checkCollision(this.Player, enemy)) {
                    enemy.markForDelete = true;

                    if(enemy.type != 'power')this.addExplosion(enemy);
                    for (let i = 0; i < enemy.points; i++) {
                        this.Particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
                    }
                    if (enemy.type == 'power' && !this.gameOver) this.Player.enterPowerMode();
                    else if (!this.gameOver) this.score--;
                }
                this.Player.projectiles.forEach(projectile => {
                    projectile.update()

                    //projectlie hit enemy
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markForDelete = true;

                        //one hit one particle
                        this.Particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))

                        //enemy is dead
                        if (enemy.lives <= 0) {
                            enemy.markForDelete = true;
                            this.addExplosion(enemy);

                            //enemy is killed so i print alot particles
                            for (let i = 0; i < enemy.points; i++) {
                                this.Particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
                            }

                            //if carrier send kamikaze fishes
                            if (enemy.type == 'carrier') {
                                for (let i = 0; i <= 4; i++) {
                                    this.enemies.push(new kamikazeFish(this,
                                        enemy.x + Math.random() * enemy.width,
                                        enemy.y + Math.random() * enemy.height * 0.5));
                                }
                            }
                            if (!this.gameOver) this.score += enemy.points;
                            if (this.score >= this.winningScore) this.gameOver = true;
                        }
                    }
                })
            })
            this.enemies = this.enemies.filter(enemy => !enemy.markForDelete);
        }
        draw(context) {
            //draw the objects from back to front
            this.Background.draw(context);
            this.UI.draw(context)
            this.Player.draw(context);
            this.Particles.forEach(particle => particle.draw(context));
            this.enemies.forEach(enemy => { enemy.draw(context) })
            this.Explosions.forEach(explosion => { explosion.draw(context) })
        }
        addEnemy() {
            const random = Math.random();
            if (random < 0.33) this.enemies.push(new Pawn(this));
            else if (random < 0.66) this.enemies.push(new Knight(this));
            else if (random < 0.8) this.enemies.push(new whaleCarrier(this));
            else this.enemies.push(new PowerFish(this));

        }
        addExplosion(enemy) {
            const random = Math.random();
            if (random < 0.5) {
                this.Explosions.push(new Smoke(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }else{
                this.Explosions.push(new Fire(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }
        }
        checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y)
        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate)
    }
    animate(0);
})
