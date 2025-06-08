var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function() {
        Phaser.Scene.call(this, { key: 'scenePlay' });
    },
    init: function(){
        this.isMusicOn = true;
        this.isSoundEffectsOn = true;
    },
    preload: function(){
        this.load.image("background", "assets/BG3.jpg");
        this.load.image("btn_play", "assets/buttonPlay2.png");
        this.load.image("gameover", "assets/gameOver2.png");
        this.load.spritesheet("coin", "assets/koin5.png", { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet("enemy1", "assets/enemy1.png", { frameWidth: 112, frameHeight: 80 });
        this.load.spritesheet("enemy2", "assets/enemy2.png", { frameWidth: 104, frameHeight: 80 });
        this.load.spritesheet("enemy3", "assets/enemy3.png", { frameWidth: 106, frameHeight: 80 });
        this.load.image("coin_panel", "assets/panelCoin.png");
        this.load.image("ground", "assets/tile2.png");
        this.load.image("ground2", "assets/tile4.png");
        this.load.image("ground3", "assets/tile3.png");
        this.load.image("soundOn", "assets/soundOn.png");
        this.load.image("soundOff", "assets/soundOff.png");
        this.load.image("musicOn", "assets/musicOn.png");
        this.load.image("musicOff", "assets/musicOff.png");
        this.load.image("pause", "assets/pause.png");
        this.load.image("unpause", "assets/unpause.png");
        this.load.image("repeat", "assets/repeat.png");
        this.load.image("winSkor", "assets/winSkor.png");
        this.load.image("loseSkor", "assets/loseSkor.png");
        this.load.image("winner", "assets/winner2.png");
        this.load.image("home", "assets/home.png");
        this.load.image("judul", "assets/judul2.png");
        this.load.audio("snd_coin", "assets/koin.mp3");
        this.load.audio("snd_lose", "assets/kalah.mp3");
        this.load.audio("snd_jump", "assets/jump2.mp3");
        this.load.audio("snd_leveling", "assets/ganti_level.mp3");
        this.load.audio("snd_walk", "assets/jalan.mp3");
        this.load.audio("snd_touch", "assets/touch.mp3");
        this.load.audio("music_play", "assets/music_play.mp3");
        this.load.spritesheet("char", "assets/dudee.png", {frameWidth: 117, frameHeight: 187});
    },
    create: function() {
        var countCoin = 0;
        var currentLevel = 1;
        var gameStarted = false;
        var activeScene = this;
        this.isGamePaused = false;

        // Sound effects
        this.snd_coin = this.sound.add('snd_coin');
        this.snd_jump = this.sound.add('snd_jump');
        this.snd_leveling = this.sound.add('snd_leveling');
        this.snd_lose = this.sound.add('snd_lose');
        this.snd_touch = this.sound.add("snd_touch");
        this.snd_walk = this.sound.add("snd_walk");
        this.snd_walk.loop = true;
        this.snd_walk.setVolume(0);
        this.snd_walk.play();

        // Background music
        this.music_play = this.sound.add('music_play');
        this.music_play.loop = true;

        this.soundEffects = [
            this.snd_coin,
            this.snd_jump,
            this.snd_leveling,
            this.snd_lose,
            this.snd_touch,
            this.snd_walk
        ];
        // Atur mute awal berdasarkan this.isSoundEffectsOn
        this.soundEffects.forEach(sfx => {
            sfx.mute = !this.isSoundEffectsOn;
        });
        // Khusus untuk snd_walk, kita kontrol volume, jadi mute-nya selalu false agar volume bisa bekerja
        this.snd_walk.mute = false;
        if (!this.isSoundEffectsOn) {
            this.snd_walk.setVolume(0); // Pastikan volume 0 jika SFX off
        }

        // Atur mute awal musik
        this.music_play.mute = !this.isMusicOn;

        // Initialisasi variabel pembantu
        X_POSITION = {
            'LEFT': 0,
            'CENTER': this.game.canvas.width / 2,
            'RIGHT': this.game.canvas.width
        };
        Y_POSITION = {
            'TOP': 0,
            'CENTER': this.game.canvas.height / 2,
            'BOTTOM': this.game.canvas.height
        };

        // Cek layoutSize, jika tidak ada, berikan nilai default atau pastikan diinisialisasi
        var layoutSize = window.layoutSize || {
            w: this.game.canvas.width,
            h: this.game.canvas.height
        }; // Fallback jika layoutSize tidak ada

        relativeSize = {
            'w': ((this.game.canvas.width - layoutSize.w) / 2),
            'h': ((this.game.canvas.height - layoutSize.h) / 2)
        }

        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "background");

        var coinPanel = this.add.image(X_POSITION.CENTER, 60, 'coin_panel');
        coinPanel.setDepth(10);
        var coinText = this.add.text(X_POSITION.CENTER + 20, 60, '0', {
            fontFamily: 'Verdana, Arial',
            fontSize: '37px',
            color: '#adadad'
        });
        coinText.setOrigin(0.5);
        coinText.setDepth(10);

        // Animasi untuk koin
        this.anims.create({
            key: 'coin_rotate',
            frames: this.anims.generateFrameNumbers('coin', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1 // Mengulang animasi tanpa batas
        });

        var darkenLayer = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, this.game.canvas.width, this.game.canvas.height, 0x000000);
        darkenLayer.setDepth(10);
        darkenLayer.alpha = 0.25;

        var gameTitle = this.add.image(X_POSITION.CENTER, -100, 'judul')
            .setDepth(11)
            .setOrigin(0.5)
            .setScale(1.6);

        var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.BOTTOM + 200, 'btn_play')
            .setDepth(11)
            .setOrigin(0.5)
            .setScale(0.5)
            .setInteractive({
                useHandCursor: true
            });

        this.tweens.add({
            targets: gameTitle,
            y: Y_POSITION.CENTER - 100,
            duration: 1000,
            ease: 'Bounce.out',
            delay: 200
        });

        this.tweens.add({
            targets: buttonPlay,
            y: Y_POSITION.CENTER + 140,
            duration: 800,
            ease: 'Back.out',
            delay: 400
        });

        buttonPlay.setInteractive();
        buttonPlay.on('pointerdown', function(pointer) {
            this.setTint(0x5a5a5a);
            if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();
        });
        buttonPlay.on('pointerout', function(pointer) {
            this.clearTint();
        });
        buttonPlay.on('pointerup', function(pointer) {
            this.clearTint();
            activeScene.tweens.add({
                targets: [gameTitle, buttonPlay],
                alpha: 0,
                duration: 300,
                ease: 'Power1.easeIn'
            });
            activeScene.tweens.add({
                targets: darkenLayer,
                delay: 150,
                duration: 250,
                alpha: 0,
                onComplete: function() {
                    gameTitle.destroy();
                    buttonPlay.destroy();

                    activeScene.gameStarted = true; // Menggunakan this.gameStarted
                    activeScene.physics.resume();

                    // Aktifkan kembali tombol-tombol lain setelah game dimulai
                    activeScene.musicButton.setInteractive();
                    activeScene.soundButton.setInteractive();
                    activeScene.pauseButton.setInteractive();
                    activeScene.unpauseButton.setInteractive();
                    activeScene.repeatButton.setInteractive();
                }
            });

            if (activeScene.isMusicOn) { // Hanya mainkan jika musik ON
                if (!activeScene.music_play.isPlaying) { // Cek jika belum playing
                    activeScene.music_play.play();
                }
            }
            activeScene.music_play.mute = !activeScene.isMusicOn; // Pastikan mute state sesuai
        });

        // Tombol Musik
        this.musicButton = this.add.image(this.game.canvas.width - 50, 50, this.isMusicOn ? 'musicOn' : 'musicOff')
            .setInteractive()
            .setDepth(11)
            .setScrollFactor(0); // Agar tetap di posisi saat kamera bergerak (jika ada)

        this.musicButton.on('pointerdown', function() {
            activeScene.isMusicOn = !activeScene.isMusicOn;
            this.setTexture(activeScene.isMusicOn ? 'musicOn' : 'musicOff');
            activeScene.music_play.mute = !activeScene.isMusicOn;

            if (activeScene.isMusicOn && !activeScene.music_play.isPlaying) {
                activeScene.music_play.play();
            }
            if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();
        });

        // Tombol Sound Effect
        this.soundButton = this.add.image(this.game.canvas.width - 125, 50, this.isSoundEffectsOn ? 'soundOn' : 'soundOff')
            .setInteractive()
            .setDepth(11)
            .setScrollFactor(0);

        this.soundButton.on('pointerdown', function() {
            activeScene.isSoundEffectsOn = !activeScene.isSoundEffectsOn;
            this.setTexture(activeScene.isSoundEffectsOn ? 'soundOn' : 'soundOff');

            activeScene.soundEffects.forEach(sfx => {
                sfx.mute = !activeScene.isSoundEffectsOn;
            });

            // Khusus untuk snd_walk yang dikontrol volumenya
            if (activeScene.isSoundEffectsOn) {
                if (activeScene.player && activeScene.player.body.velocity.x !== 0 && activeScene.player.body.touching.down) {
                    activeScene.snd_walk.setVolume(1);
                } else {
                    activeScene.snd_walk.setVolume(0);
                }
                activeScene.snd_touch.play(); // Mainkan touch sound setelah toggle jika SFX jadi ON
            } else {
                activeScene.snd_walk.setVolume(0);
            }
            activeScene.snd_walk.mute = false; // Pastikan snd_walk tidak pernah di-mute agar kontrol volume berfungsi
        });

        // Tombol Repeat
        this.repeatButton = this.add.image(this.game.canvas.width - 200, 50, 'repeat')
            .setInteractive()
            .setDepth(11)
            .setScrollFactor(0);

        this.repeatButton.on('pointerdown', function() {
            if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();
            activeScene.scene.restart();
        });

        // Tombol Pause (di kiri tombol repeat)
        this.pauseButton = this.add.image(this.game.canvas.width - 275, 50, 'pause')
            .setInteractive()
            .setDepth(11)
            .setScrollFactor(0);

        // Tombol Unpause (disembunyikan awalnya)
        this.unpauseButton = this.add.image(this.game.canvas.width - 275, 50, 'unpause')
            .setInteractive()
            .setDepth(11)
            .setScrollFactor(0)
            .setVisible(false);

        // Saat Pause
        this.pauseButton.on('pointerdown', () => {
            if (!gameStarted) return;
            if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();

            activeScene.physics.pause();
            activeScene.player.anims.pause();
            activeScene.isGamePaused = true;

            // Jeda animasi semua koin
            coins.children.iterate(function(child) {
                child.anims.pause();
            });

            activeScene.pauseButton.setVisible(false);
            activeScene.unpauseButton.setVisible(true);
        });

        // Saat Unpause
        this.unpauseButton.on('pointerdown', () => {
            if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();

            activeScene.physics.resume();
            activeScene.player.anims.resume();
            activeScene.isGamePaused = false;

            // Lanjutkan animasi semua koin
            coins.children.iterate(function(child) {
                child.anims.resume();
            });

            activeScene.pauseButton.setVisible(true);
            activeScene.unpauseButton.setVisible(false);
        });


        // Nonaktifkan tombol-tombol selain tombol Play saat awal scene
        activeScene.musicButton.disableInteractive();
        activeScene.soundButton.disableInteractive();
        activeScene.pauseButton.disableInteractive();
        activeScene.repeatButton.disableInteractive();
        activeScene.unpauseButton.disableInteractive();

        let groundTemp = this.add.image(0, 0, 'ground').setVisible(false);
        let groundSize = {
            'width': groundTemp.width,
            'height': groundTemp.height
        };

        var newLevelTransition = function() {
            var levelTransitionText = activeScene.add.text(X_POSITION.CENTER, Y_POSITION.CENTER, 'Level ' + currentLevel, {
                fontFamily: 'Verdana, Arial',
                fontSize: '40px',
                color: '#ffffff'
            });
            levelTransitionText.setOrigin(0.5);
            levelTransitionText.setDepth(10);
            levelTransitionText.alpha = 0;

            activeScene.tweens.add({
                targets: levelTransitionText,
                duration: 1000,
                alpha: 1,
                yoyo: true,
                onComplete: function() {
                    levelTransitionText.destroy();
                }
            });

            activeScene.tweens.add({
                delay: 2000,
                targets: darkenLayer,
                duration: 250,
                alpha: 0,
                onComplete: function() {
                    activeScene.gameStarted = true;
                    activeScene.physics.resume();
                }
            });
            if (activeScene.isSoundEffectsOn) activeScene.snd_leveling.play();
        };

        var coins = this.physics.add.group({
            key: 'coin',
            repeat: 9,
            setXY: {
                x: 70 + relativeSize.w,
                y: -100,
                stepX: 130
            }
        });

        coins.children.iterate(function(child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
            child.setGravityY(600);
            child.anims.play('coin_rotate');
        });

        var collectCoin = function(player, coin) {
            countCoin += 1;
            coinText.setText(countCoin);
            activeScene.snd_coin.play();

            coin.disableBody(true, true);
            activeScene.emmiterCoin.setPosition(coin.x, coin.y);
            activeScene.emmiterCoin.explode(10, coin.x, coin.y);

            if (coins.countActive(true) === 0) {
                currentLevel++;
                if (activeScene.isSoundEffectsOn) {
                    activeScene.snd_walk.setVolume(0);
                } else {
                    activeScene.snd_walk.setVolume(0);
                }

                activeScene.gameStarted = false;
                activeScene.physics.pause();
                activeScene.player.anims.play('idle-right');

                // *** PERUBAHAN: Kondisi menang diubah menjadi setelah level 8 ***
                if (currentLevel > 8) {
                    // Buat overlay gelap
                    var winnerDarken = activeScene.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER,
                            activeScene.game.canvas.width, activeScene.game.canvas.height, 0x000000)
                        .setDepth(20)
                        .setAlpha(0.5);

                    // Buat teks winner dengan animasi
                    var winnerText = activeScene.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 210, 'winner')
                        .setDepth(21)
                        .setScale(0);

                    var winScore = activeScene.add.image(X_POSITION.CENTER, Y_POSITION.CENTER + 50, 'winSkor')
                        .setDepth(22)
                        .setScale(0);

                    var scoreText = activeScene.add.text(X_POSITION.CENTER, Y_POSITION.CENTER + 40, countCoin, {
                        fontFamily: 'Verdana, Arial',
                        fontSize: '40px',
                        color: '#ffffff'
                    }).setDepth(22).setOrigin(0.5).setScale(0);

                    var repeatButton = activeScene.add.image(X_POSITION.CENTER - 110, Y_POSITION.CENTER + 170, 'repeat')
                        .setDepth(22)
                        .setScale(0)
                        .setInteractive();

                    var homeButton = activeScene.add.image(X_POSITION.CENTER + 110, Y_POSITION.CENTER + 170, 'home')
                        .setDepth(22)
                        .setScale(0)
                        .setInteractive();

                    activeScene.tweens.add({
                        targets: winnerText,
                        scale: 1,
                        duration: 500,
                        ease: 'Back.out',
                        onComplete: function() {
                            activeScene.tweens.add({
                                targets: winScore,
                                scale: 1,
                                duration: 500,
                                ease: 'Back.out',
                                onComplete: function() {
                                    activeScene.tweens.add({
                                        targets: scoreText,
                                        scale: 1,
                                        duration: 500,
                                        ease: 'Back.out'
                                    });
                                }
                            });
                            activeScene.tweens.add({
                                targets: [repeatButton, homeButton],
                                scale: 1,
                                duration: 500,
                                ease: 'Back.out'
                            });
                        }
                    });

                    // Nonaktifkan semua tombol/interaksi lain
                    activeScene.musicButton.disableInteractive();
                    activeScene.soundButton.disableInteractive();
                    activeScene.pauseButton.disableInteractive();
                    activeScene.repeatButton.disableInteractive();
                    activeScene.unpauseButton.disableInteractive();

                    repeatButton.on('pointerdown', function() {
                        if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();
                        activeScene.scene.restart();
                    });
                    homeButton.on('pointerdown', function() {
                        if (activeScene.isSoundEffectsOn) activeScene.snd_touch.play();
                        activeScene.scene.start('scenePlay'); // Asumsi 'scenePlay' adalah nama scene utama
                    });

                    if (activeScene.music_play.isPlaying) {
                        activeScene.music_play.stop();
                    }
                } else {
                    activeScene.tweens.add({
                        targets: darkenLayer,
                        duration: 250,
                        alpha: 1,
                        onComplete: function() {
                            prepareWorld();
                            newLevelTransition();
                        }
                    });
                }
            }
        }

        this.player = this.physics.add.sprite(100, 500, 'char');
        this.player.setGravity(0, 800);
        this.player.setBounce(0.2);
        this.player.setScale(0.7);

        this.jumpVelocity = -500;
        this.doubleJumpVelocity = -450;
        this.canDoubleJump = false;

        var partikelCoin = this.add.particles('coin');
        this.emmiterCoin = partikelCoin.createEmitter({
            speed: {
                min: 150,
                max: 250
            },
            gravity: {
                x: 0,
                y: 200
            },
            scale: {
                start: 1,
                end: 0
            },
            lifespan: {
                min: 200,
                max: 300
            },
            quantity: {
                min: 5,
                max: 15
            },
        });
        this.emmiterCoin.setPosition(-100, 100);
        this.emmiterCoin.explode();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);
        this.physics.add.overlap(this.player, coins, collectCoin, null, this);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('char', {
                start: 0,
                end: 3
            }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('char', {
                start: 6,
                end: 9
            }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'idle-left',
            frames: [{
                key: 'char',
                frame: 4
            }],
            frameRate: 20
        });
        this.anims.create({
            key: 'idle-right',
            frames: [{
                key: 'char',
                frame: 5
            }],
            frameRate: 20
        });


        var platforms = this.physics.add.staticGroup();
        var enemies = this.physics.add.group();
        this.enemies = enemies;

        var spawnEnemyFromRandomEdge = function(isFollowing, moveSpeed = 80, velocity = {
            x: 80,
            y: 80
        }) {
            let x, y;
            const side = Phaser.Math.Between(0, 2);
            const canvasWidth = activeScene.game.canvas.width;
            const canvasHeight = activeScene.game.canvas.height;

            switch (side) {
                case 0: // Atas
                    x = Phaser.Math.Between(50, canvasWidth - 50);
                    y = -50;
                    break;
                case 1: // Kiri
                    x = -50;
                    y = Phaser.Math.Between(50, canvasHeight - 200); // Hindari muncul terlalu rendah
                    break;
                case 2: // Kanan
                    x = canvasWidth + 50;
                    y = Phaser.Math.Between(50, canvasHeight - 200);
                    break;
            }

            var enemy = enemies.create(x, y, 'enemy' + Phaser.Math.Between(1, 3));
            enemy.setCollideWorldBounds(true);
            enemy.allowGravity = false;
            enemy.setData('following', isFollowing);

            if (isFollowing) {
                enemy.setData('moveSpeed', moveSpeed);
                enemy.setBounce(0);
                enemy.setVelocity(0, 0); // Kecepatan diatur di update loop
            } else {
                enemy.setBounce(1);
                enemy.setVelocity(Phaser.Math.Between(-velocity.x, velocity.x), Phaser.Math.Between(50, velocity.y));
            }
        };


        var prepareWorld = function() {
            platforms.clear(true, true);
            enemies.clear(true, true);

            let spacing = groundSize.width * 0.69;

            // Platform dasar
            for (let i = -4; i <= 4; i++) {
                platforms.create(X_POSITION.CENTER + (spacing * i), Y_POSITION.BOTTOM - groundSize.height / 2, 'ground3');
            }

            coins.children.iterate(function(child) {
                child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
                child.enableBody(true, child.x, -100, true, true);
            });

            // level
            if (currentLevel == 1) {
                platforms.create(groundTemp.width / 1.7 + relativeSize.w, 280, 'ground3');
                platforms.create(380 + relativeSize.w, 430, 'ground3');
                platforms.create(1350 - groundTemp.width / 1.7 + relativeSize.w, 380, 'ground3');
                platforms.create(780 + relativeSize.w, 584, 'ground3');
            } else if (currentLevel == 2) {
                platforms.create(80 + relativeSize.w, 384, 'ground3');
                platforms.create(230 + relativeSize.w, 184, 'ground3');
                platforms.create(390 + relativeSize.w, 284, 'ground3');
                platforms.create(1260 + relativeSize.w, 360, 'ground3');
                platforms.create(650 + relativeSize.w, 430, 'ground3');
                platforms.create(1060 + relativeSize.w, 570, 'ground3');
            } else if (currentLevel == 3) {
                platforms.create(80 + relativeSize.w, 230, 'ground3');
                platforms.create(220 + relativeSize.w, 230, 'ground3');
                platforms.create(1180 + relativeSize.w, 280, 'ground3');
                platforms.create(790 + relativeSize.w, 200, 'ground3');
                platforms.create(460 + relativeSize.w, 480, 'ground3');
                platforms.create(940 + relativeSize.w, 430, 'ground3');
                platforms.create(820 + relativeSize.w, 570, 'ground3');
                platforms.create(40 + relativeSize.w, 630, 'ground3');
            } else if (currentLevel == 4) {
                platforms.create(150 + relativeSize.w, 350, 'ground3');
                platforms.create(550 + relativeSize.w, 500, 'ground3');
                platforms.create(950 + relativeSize.w, 300, 'ground3');
                platforms.create(1300 + relativeSize.w, 450, 'ground3');
                platforms.create(300 + relativeSize.w, 600, 'ground3');
                spawnEnemyFromRandomEdge(false);
            } else if (currentLevel == 5) {
                platforms.create(100 + relativeSize.w, 550, 'ground3');
                platforms.create(400 + relativeSize.w, 400, 'ground3');
                platforms.create(700 + relativeSize.w, 580, 'ground3');
                platforms.create(1000 + relativeSize.w, 350, 'ground3');
                platforms.create(1300 + relativeSize.w, 500, 'ground3');
                platforms.create(250 + relativeSize.w, 250, 'ground3');
                platforms.create(1150 + relativeSize.w, 250, 'ground3');
                // 2 musuh acak
                for (let i = 0; i < 2; i++) {
                    spawnEnemyFromRandomEdge(false, 80, {x: 90, y:90});
                }
            } 
            else if (currentLevel == 6) {
                platforms.create(200 + relativeSize.w, 200, 'ground3');
                platforms.create(450 + relativeSize.w, 450, 'ground3');
                platforms.create(700 + relativeSize.w, 250, 'ground3');
                platforms.create(950 + relativeSize.w, 500, 'ground3');
                platforms.create(1200 + relativeSize.w, 300, 'ground3');
                platforms.create(50 + relativeSize.w, 580, 'ground3');
                platforms.create(1350 + relativeSize.w, 170, 'ground3');
                // 3 musuh acak
                for (let i = 0; i < 3; i++) {
                    spawnEnemyFromRandomEdge(false, 80, {x: 100, y:100});
                }
            }
            else if (currentLevel == 7) {
                platforms.create(150 + relativeSize.w, 500, 'ground3');
                platforms.create(500 + relativeSize.w, 350, 'ground3');
                platforms.create(850 + relativeSize.w, 200, 'ground3');
                platforms.create(1200 + relativeSize.w, 400, 'ground3');
                platforms.create(1000 + relativeSize.w, 600, 'ground3');
                spawnEnemyFromRandomEdge(true, 65);
            }
            else if (currentLevel == 8) {
                platforms.create(100 + relativeSize.w, 250, 'ground3');
                platforms.create(1300 + relativeSize.w, 250, 'ground3');
                platforms.create(400 + relativeSize.w, 450, 'ground3');
                platforms.create(1000 + relativeSize.w, 450, 'ground3');
                platforms.create(700 + relativeSize.w, 250, 'ground3');
                platforms.create(700 + relativeSize.w, 600, 'ground3');
                for (let i = 0; i < 2; i++) {
                    spawnEnemyFromRandomEdge(true, 80);
                }
            }
        }

        prepareWorld();

        this.physics.add.collider(coins, platforms);
        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(enemies, platforms);

        var hitEnemy = function(player, enemy) {
            if (this.isSoundEffectsOn) this.snd_lose.play();
            if(this.music_play.isPlaying) this.music_play.stop();
            
            this.physics.pause();
            this.player.setTint(0xff0000);
            this.gameStarted = false;

            this.snd_walk.setVolume(0);

            var loseDarken = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER,
                this.game.canvas.width, this.game.canvas.height, 0x000000)
                .setDepth(20)
                .setAlpha(0);

            this.tweens.add({
                targets: loseDarken,
                alpha: 0.7,
                duration: 500
            });
            
            // Nonaktifkan semua tombol/interaksi lain
            this.musicButton.disableInteractive();
            this.soundButton.disableInteractive();
            this.pauseButton.disableInteractive();
            this.repeatButton.disableInteractive();
            this.unpauseButton.disableInteractive();

            var gameOverImage = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 210, 'gameover')
                .setDepth(25)
                .setScale(0);

            var loseScore = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER + 50, 'loseSkor')
                .setDepth(22)
                .setScale(0);

            var scoreText = this.add.text(X_POSITION.CENTER, Y_POSITION.CENTER + 40, countCoin, {
                fontFamily: 'Verdana, Arial',
                fontSize: '40px',
                color: '#ffffff'
            }).setDepth(22).setOrigin(0.5).setScale(0);

            var repeatButton = this.add.image(X_POSITION.CENTER - 110, Y_POSITION.CENTER + 170, 'repeat')
                .setDepth(22)
                .setScale(0)
                .setInteractive();

            var homeButton = this.add.image(X_POSITION.CENTER + 110, Y_POSITION.CENTER + 170, 'home')
                .setDepth(22)
                .setScale(0)
                .setInteractive();

            this.tweens.add({
                targets: gameOverImage,
                scale: 1,
                duration: 500,
                ease: 'Back.out',
                delay: 500,
                onComplete: () => {
                    this.tweens.add({
                        targets: loseScore,
                        scale: 1,
                        duration: 500,
                        ease: 'Back.out',
                        onComplete: () => {
                            this.tweens.add({ targets: scoreText, scale: 1, duration: 500, ease: 'Back.out' });
                        }
                    });
                    this.tweens.add({ targets: [repeatButton, homeButton], scale: 1, duration: 500, ease: 'Back.out' });
                }
            });

            repeatButton.on('pointerdown', () => {
                if (this.isSoundEffectsOn) this.snd_touch.play();
                this.scene.restart();
            });

            homeButton.on('pointerdown', () => {
                if (this.isSoundEffectsOn) this.snd_touch.play();
                this.scene.start('scenePlay');
            });
        }

        this.physics.add.collider(this.player, enemies, hitEnemy, null, this);
        this.physics.pause();
    },


    update: function(){
        // Stop semua update kalau game di-pause
        if (this.isGamePaused) return;
        if(!this.gameStarted){ // Menggunakan this.gameStarted
            return;
        }

        if(this.cursors.right.isDown){
            this.player.setVelocityX(200);
            this.player.anims.play('right', true);
            if (this.isSoundEffectsOn && this.player.body.touching.down) this.snd_walk.setVolume(1);
            else if (!this.isSoundEffectsOn) this.snd_walk.setVolume(0);
            this.lastFacing = 'right';
        }
        else if(this.cursors.left.isDown){
            this.player.setVelocityX(-200);
            this.player.anims.play('left', true);
            if (this.isSoundEffectsOn && this.player.body.touching.down) this.snd_walk.setVolume(1);
            else if (!this.isSoundEffectsOn) this.snd_walk.setVolume(0);
            this.lastFacing = 'left';
        }
        else{
            this.player.setVelocityX(0);
            if (this.lastFacing === 'right') {
                this.player.anims.play('idle-right', true); // Tambahkan true agar tidak berhenti di frame pertama
            } else {
                this.player.anims.play('idle-left', true); // Tambahkan true
            }
            this.snd_walk.setVolume(0);
        }

        const isJustPressedUp = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        const isTouchingDown = this.player.body.touching.down;

        // Jika player menyentuh tanah, reset kemampuan double jump
        if (isTouchingDown) {
            this.canDoubleJump = true;
        }

        // Lompatan Pertama
        if (isJustPressedUp && isTouchingDown) {
            this.player.setVelocityY(this.jumpVelocity);
            this.snd_jump.play();
        }
        // Lompatan Kedua
        else if (isJustPressedUp && !isTouchingDown && this.canDoubleJump) {
            this.player.setVelocityY(this.doubleJumpVelocity);
            this.snd_jump.play();
            // Matikan kemampuan double jump setelah digunakan agar tidak bisa lompat ketiga kali
            this.canDoubleJump = false;
        }

        // Update posisi dan animasi musuh
        const self = this; // Tambahkan ini
        this.enemies.children.iterate(function (enemy) {
            if (enemy) {
                if (!enemy.getData('following')) {
                    // Pergerakan lurus horizontal
                    if (enemy.body.velocity.x > 0) {
                        enemy.flipX = false; // Tetap false jika bergerak ke kanan
                    } else if (enemy.body.velocity.x < 0) {
                        enemy.flipX = true; // Tetap true jika bergerak ke kiri
                    }
                    // Jika mencapai batas layar, balik arah
                    if (enemy.x < 50) {
                        enemy.setVelocityX(Math.abs(enemy.body.velocity.x));
                    } else if (enemy.x > self.game.canvas.width - 50) {
                        enemy.setVelocityX(-Math.abs(enemy.body.velocity.x));
                    }
                } else {
                    // Mengikuti player
                    enemy.allowGravity = false; // Pastikan gravitasi mati
                    var speed = enemy.getData('moveSpeed');
                    if (self.player.y < enemy.y - 20) {
                        enemy.setVelocityY(-speed);
                    } else if (self.player.y > enemy.y + 20) {
                        enemy.setVelocityY(speed);
                    } else {
                        enemy.setVelocityY(0);
                    }

                    if (self.player.x > enemy.x) {
                        enemy.setVelocityX(speed);
                        enemy.flipX = false; // Tetap false jika bergerak ke kanan
                    } else if (self.player.x < enemy.x) {
                        enemy.setVelocityX(-speed);
                        enemy.flipX = true; // Tetap true jika bergerak ke kiri
                    } else {
                        enemy.setVelocityX(0);
                    }
                }
            }
        });
    }
});