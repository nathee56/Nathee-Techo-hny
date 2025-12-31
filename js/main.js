document.addEventListener('DOMContentLoaded', () => {
    
    // Variables
    let snowInterval;
    let floatingElementsInterval;
    
    // --- Global Music Controller ---
    const audio = document.getElementById('bg-music');
    let isMusicStarted = false;

    window.playGlobalMusic = function() {
        if (!isMusicStarted && audio) {
            audio.currentTime = 5; 
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play failed:", e));
            isMusicStarted = true;
        } else if (audio && audio.paused) {
            // เช็คว่าไม่ได้อยู่ในหน้าวิดีโอ หรือหน้าฟังเสียง
            const hnyPage = document.getElementById('happy-new-year');
            const voiceClip = document.getElementById('voice-clip');
            const isVoicePlaying = voiceClip && !voiceClip.paused;
            
            if (!hnyPage.classList.contains('active') && !isVoicePlaying) {
                audio.play();
            }
        }
    };

    // --- Backgrounds ---
    function createSnowflake() {
        const snow = document.createElement('div');
        snow.classList.add('falling-snow');
        const icons = ['❄', '❅', '❆', '•', '·']; 
        snow.innerText = icons[Math.floor(Math.random() * icons.length)];
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.fontSize = Math.random() * 20 + 10 + 'px';
        const duration = Math.random() * 5 + 3;
        snow.style.animationDuration = duration + 's';
        document.body.appendChild(snow);
        setTimeout(() => snow.remove(), duration * 1000);
    }

    function createFloatingElement() {
        const futurePage = document.getElementById('future');
        if (futurePage && futurePage.classList.contains('active')) return;
        const element = document.createElement('div');
        element.classList.add('floating-element');
        const icons = ['❤', '💖', '✨', '🌸', '🧸', '💗'];
        element.innerText = icons[Math.floor(Math.random() * icons.length)];
        element.style.left = Math.random() * 100 + 'vw';
        element.style.fontSize = Math.random() * 25 + 15 + 'px';
        element.style.animationDuration = Math.random() * 5 + 5 + 's';
        document.body.appendChild(element);
        setTimeout(() => element.remove(), 10000);
    }

    function startFireworks(canvasId, type = 'normal') {
        const canvas = document.getElementById(canvasId);
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let particles = [];
        
        function createFirework(x, y) {
            const count = 50; 
            for(let i=0; i<count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                let vx = Math.cos(angle) * speed;
                let vy = Math.sin(angle) * speed;

                if (type === 'heart') {
                    const t = angle; 
                    vx = (16 * Math.pow(Math.sin(t), 3)) * 0.2; 
                    vy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.2;
                }

                particles.push({
                    x: x, y: y, vx: vx, vy: vy,
                    radius: Math.random() * 2 + 1,
                    color: type === 'heart' ? `hsl(${330 + Math.random()*30}, 100%, 60%)` : `hsl(${Math.random()*360}, 100%, 50%)`,
                    alpha: 1, decay: 0.01
                });
            }
        }

        function loop() {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';

            particles.forEach((p, index) => {
                p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
                ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
                if(p.alpha <= 0) particles.splice(index, 1);
            });

            if(Math.random() < 0.08) { 
                createFirework(Math.random()*canvas.width, Math.random()*canvas.height/2);
            }
            
            const pageId = type === 'heart' ? 'happy-new-year' : 'newyear';
            if(document.getElementById(pageId).classList.contains('active')) {
                requestAnimationFrame(loop);
            }
        }
        loop();
    }

    // --- Navigation ---
    const originalNavigate = window.navigateTo;
    window.navigateTo = function(pageId) {
        document.querySelectorAll('.page-section').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo(0, 0);
            
            if (pageId === 'story') {
                setTimeout(() => {
                    const cards = document.querySelectorAll('.story-card');
                    cards.forEach(card => observer.observe(card));
                }, 100);
            }
            if (pageId === 'newyear') {
                setTimeout(() => startFireworks('fireworks-canvas', 'normal'), 100);
                setTimeout(() => {
                    const nyCards = document.querySelectorAll('.newyear-card');
                    nyCards.forEach(card => observer.observe(card));
                }, 100);
            }
            if (pageId === 'happy-new-year') {
                setTimeout(() => startFireworks('heart-fireworks-canvas', 'heart'), 100);
            }
        }

        if (pageId !== 'happy-new-year') {
             playGlobalMusic(); 
             const video = document.getElementById('my-video');
             if(video) video.pause();
        }

        clearInterval(snowInterval);
        clearInterval(floatingElementsInterval);
        document.querySelectorAll('.falling-snow').forEach(el => el.remove());
        document.querySelectorAll('.floating-element').forEach(el => el.remove());

        if (pageId === 'home') {
            snowInterval = setInterval(createSnowflake, 200);
        } else if (pageId === 'newyear') {
            floatingElementsInterval = setInterval(createFloatingElement, 500); 
        } else if (pageId !== 'future' && pageId !== 'happy-new-year') {
            floatingElementsInterval = setInterval(createFloatingElement, 500);
        }

        const navTimer = document.getElementById('nav-timer');
        if (pageId === 'home') {
            if(navTimer) navTimer.style.display = 'none';
        } else {
            if(navTimer) navTimer.style.display = 'block';
        }

        document.querySelectorAll('.nav-link-item').forEach(link => {
            link.classList.remove('active');
        });
        
        if(pageId === 'game' || pageId === 'mini-game' || pageId === 'clicker-game' || pageId === 'maze-game' || pageId === 'future') {
            document.querySelectorAll('.nav-link-item')[4].classList.add('active');
        } else if (pageId === 'home') {
            document.querySelectorAll('.nav-link-item')[0].classList.add('active');
        } else if (pageId === 'story') {
            document.querySelectorAll('.nav-link-item')[1].classList.add('active');
        } else if (pageId === 'feelings') {
            document.querySelectorAll('.nav-link-item')[2].classList.add('active');
        } else if (pageId === 'newyear' || pageId === 'happy-new-year') {
            document.querySelectorAll('.nav-link-item')[3].classList.add('active');
        }
    };

    window.startJourney = function() {
        playGlobalMusic();
        navigateTo('story');
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                obs.unobserve(entry.target); 
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.2 });
    document.querySelectorAll('.story-card').forEach(card => observer.observe(card));

    // --- Envelopes ---
    window.openStoryLetter = function() {
        const envelope = document.getElementById('envelope');
        envelope.classList.add('open'); 
        setTimeout(() => {
            const poem = `ถึงเตโชแฟนผมที่น่ารัก  ผมรักจังครั้งแรกเหมือนเพ้อฝัน\nไม่เคยคิดว่าจะได้เป็นแฟนกัน แค่ทุกวันนั้นมีเธอก็เพียงพอ\nอยากจะบอกให้รู้ว่าผมรัก มันประจักษ์ในใจผมแสนหวง\nมือข้างนี้จะประคองไม่หลอกลวง  พาเราพ่วงกับความรักตลอดไป ❤️`;
            window.openModal('จดหมายจากนที 💌', poem);
        }, 600);
    };

    window.openNewYearLetter = function() {
        const envelope = document.getElementById('envelope-hny');
        envelope.classList.add('open'); 
        setTimeout(() => {
            const wishes = `Happy New Year 2026 นะครับคนเก่ง! 🎉\n\nขอบคุณที่อยู่เป็นความสุขให้นทีข้ามปีนะ\nขอให้ปีนี้เป็นปีที่ดีของเรา\nรักเตโชที่สุดในโลกเลย! ❤️`;
            window.openModal('คำอวยพรปีใหม่ ✨', wishes);
            
            const closeBtn = document.getElementById('close-modal');
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.onclick = function() {
                document.getElementById('modal').classList.remove('active');
                
                // Show Video Container
                const vidContainer = document.getElementById('video-container');
                if(vidContainer) {
                    vidContainer.style.display = 'flex';
                    vidContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Reset Close Button
                newCloseBtn.onclick = function() { document.getElementById('modal').classList.remove('active'); };
            };

        }, 600);
    };

    // --- Video Logic ---
    const myVideo = document.getElementById('my-video');
    const bgMusic = document.getElementById('bg-music');

    if (myVideo && bgMusic) {
        myVideo.onplay = function() { bgMusic.pause(); };
        myVideo.onended = function() { bgMusic.play(); };
        myVideo.onpause = function() { if (!myVideo.ended) bgMusic.play(); };
    }

    // --- 🔥 Updated: Interactive Heart Button with Voice 🔥 ---
    window.showLoveMessage = function() {
        // Pause main video if playing
        if(myVideo && !myVideo.paused) myVideo.pause();
        
        // HTML สำหรับ Popup (ข้อความ + เครื่องเล่นเสียง)
        const htmlContent = `
            รักนะเตโช ❤️<br>
            อยู่ด้วยกันแบบนี้ไปนานๆ<br>
            ทุกๆ ปีเลยนะ<br>
            รักนะค้าบบบ 😘<br><br>
            <div style="background: #FFF0F5; padding: 10px; border-radius: 15px; border: 2px dashed #FF69B4;">
                <p style="font-size: 0.9rem; color: #888; margin-bottom: 5px;">👇 กดฟังเสียงนที 👇</p>
                <audio id="voice-clip" controls style="width: 100%;">
                    <source src="assets/voice.mp3" type="audio/mpeg">
                    Browser ไม่รองรับเสียงครับ
                </audio>
            </div>
        `;
        
        window.openModal('ความในใจ (มีเสียงด้วย!) 🔊', htmlContent);

        // --- Logic ตัดเสียงเพลงเมื่อเล่นเสียงพูด ---
        setTimeout(() => {
            const voiceClip = document.getElementById('voice-clip');
            if(voiceClip && bgMusic) {
                voiceClip.onplay = function() {
                    console.log("Voice playing, pausing BG music...");
                    bgMusic.pause();
                };
                voiceClip.onended = function() {
                    console.log("Voice ended, resuming BG music...");
                    bgMusic.play();
                };
                voiceClip.onpause = function() {
                    if(!voiceClip.ended) bgMusic.play();
                };
            }
        }, 100); // Delay slightly to ensure element is in DOM
    };

    // --- Games Logic (1-4) ---
    window.checkPassword = function() {
        if(document.getElementById('pass-input').value === '051168') {
            document.getElementById('error-msg').style.opacity = '0'; navigateTo('mini-game'); 
        } else {
            document.getElementById('error-msg').style.opacity = '1';
        }
    };
    window.checkLoveLevel = function(level) {
        if (level < 100) window.openModal('น้อยไปนะ! 😠', 'รักนทีแค่นี้เองเหรอครับ?');
        else {
            window.openModal('เก่งมากครับ! 🥰', 'ไปช่วยกันเติมหัวใจให้นทีหน่อยสิ!');
            setTimeout(() => {
                const cm = document.getElementById('close-modal');
                const newCm = cm.cloneNode(true);
                cm.parentNode.replaceChild(newCm, cm);
                newCm.onclick = function() { document.getElementById('modal').classList.remove('active'); navigateTo('clicker-game'); newCm.onclick = closeModalFunc; resetClickerGame(); };
            }, 500);
        }
    };
    let heartClicks = 0; const clicksToWin = 30; 
    window.resetClickerGame = function() {
        heartClicks = 0; updateClickerUI();
        document.getElementById('img-20').classList.remove('show'); document.getElementById('img-20').classList.add('hidden');
        document.getElementById('img-50').classList.remove('show'); document.getElementById('img-50').classList.add('hidden');
        document.getElementById('img-100').classList.remove('show'); document.getElementById('img-100').classList.add('hidden');
    };
    window.clickHeartAction = function() {
        if (heartClicks >= clicksToWin) return; 
        heartClicks++; updateClickerUI();
        let percent = (heartClicks / clicksToWin) * 100;
        if (percent >= 20) { document.getElementById('img-20').classList.remove('hidden'); document.getElementById('img-20').classList.add('show'); }
        if (percent >= 50) { document.getElementById('img-50').classList.remove('hidden'); document.getElementById('img-50').classList.add('show'); }
        if (percent >= 100) {
            document.getElementById('img-100').classList.remove('hidden'); document.getElementById('img-100').classList.add('show');
            setTimeout(() => {
                window.openModal('ภารกิจสำเร็จ! 🎉', 'นทียิ้มแล้วครับ!\nช่วยพานทีเดินไปหาเตโชหน่อยนะ! 🏃‍♂️');
                const cm = document.getElementById('close-modal');
                const newCm = cm.cloneNode(true);
                cm.parentNode.replaceChild(newCm, cm);
                newCm.onclick = function() { document.getElementById('modal').classList.remove('active'); navigateTo('maze-game'); initMazeGame(); newCm.onclick = closeModalFunc; };
            }, 500);
        }
    };
    function updateClickerUI() {
        let percent = Math.min((heartClicks / clicksToWin) * 100, 100);
        document.getElementById('heart-bar').style.width = percent + '%';
        document.getElementById('click-count').innerText = Math.floor(percent) + '%';
    }
    const mazeSize = 5; let playerPos = { x: 0, y: 0 }; const targetPos = { x: 4, y: 4 };
    const mazeMap = [[0, 0, 1, 0, 0], [0, 1, 1, 0, 1], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [0, 0, 0, 1, 0]];
    window.initMazeGame = function() { playerPos = { x: 0, y: 0 }; renderMaze(); };
    function renderMaze() {
        const grid = document.getElementById('maze-grid'); grid.innerHTML = '';
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                const cell = document.createElement('div'); cell.classList.add('maze-cell');
                if (x === playerPos.x && y === playerPos.y) cell.classList.add('maze-player');
                else if (x === targetPos.x && y === targetPos.y) cell.classList.add('maze-target');
                else if (mazeMap[y][x] === 1) cell.classList.add('maze-wall');
                grid.appendChild(cell);
            }
        }
    }
    window.movePlayer = function(dx, dy) {
        const newX = playerPos.x + dx; const newY = playerPos.y + dy;
        if (newX < 0 || newX >= mazeSize || newY < 0 || newY >= mazeSize) return;
        if (mazeMap[newY][newX] === 1) return;
        playerPos.x = newX; playerPos.y = newY; renderMaze();
        if (playerPos.x === targetPos.x && playerPos.y === targetPos.y) {
            setTimeout(() => {
                window.openModal('เจอแล้ว! ❤️', 'พร้อมดูอนาคตของเราหรือยังครับ? 🚀');
                const cm = document.getElementById('close-modal');
                const newCm = cm.cloneNode(true);
                cm.parentNode.replaceChild(newCm, cm);
                newCm.onclick = function() { document.getElementById('modal').classList.remove('active'); navigateTo('future'); newCm.onclick = closeModalFunc; };
            }, 200);
        }
    };

    // --- Slider Game ---
    window.showNewYearGame = function() {
        document.getElementById('newyear-game-area').style.display = 'block';
        document.getElementById('newyear-game-area').scrollIntoView({ behavior: 'smooth' }); 
    };

    window.forceNextPage = function() {
        navigateTo('happy-new-year');
    };

    const sliderHandle = document.getElementById('slider-handle');
    const sliderTrack = document.getElementById('slider-track');

    if(sliderHandle && sliderTrack) {
        let isDragging = false;
        const getClientX = (e) => { return e.touches ? e.touches[0].clientX : e.clientX; };
        const updatePosition = (clientX) => {
            const trackRect = sliderTrack.getBoundingClientRect();
            const handleWidth = sliderHandle.offsetWidth;
            let newLeft = clientX - trackRect.left - (handleWidth / 2);
            if(newLeft < 5) newLeft = 5;
            const maxRight = trackRect.width - handleWidth - 5;
            if(newLeft > maxRight) newLeft = maxRight;
            sliderHandle.style.left = newLeft + 'px';
            if (newLeft >= maxRight - 10) return true;
            return false;
        };
        const startDrag = (e) => { isDragging = true; sliderHandle.style.transition = 'none'; };
        const onDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const success = updatePosition(getClientX(e));
            if (success) {
                isDragging = false;
                document.removeEventListener('mousemove', onDrag);
                document.removeEventListener('touchmove', onDrag);
                window.openModal('Mission Complete! 🎉', 'เราข้ามปีมาด้วยกันสำเร็จแล้วนะ!\nปีหน้าขอให้มีแต่ความสุขนะครับ ❤️');
                setTimeout(() => {
                    const cm = document.getElementById('close-modal');
                    const newCm = cm.cloneNode(true);
                    cm.parentNode.replaceChild(newCm, cm);
                    newCm.onclick = function() { document.getElementById('modal').classList.remove('active'); navigateTo('happy-new-year'); newCm.onclick = closeModalFunc; };
                }, 500);
            }
        };
        const stopDrag = () => { if(isDragging) { isDragging = false; sliderHandle.style.transition = '0.5s'; sliderHandle.style.left = '5px'; } };
        sliderHandle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        sliderHandle.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }

    // --- Timer ---
    const counter = document.getElementById('counter');
    const navTimer = document.getElementById('nav-timer');
    if (counter || navTimer) {
        const start = new Date('2025-11-05T00:00:00');
        setInterval(() => {
            const now = new Date(); const diff = now - start;
            let text = "Waiting...";
            if (diff >= 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                text = `${days} วัน ${hours} ชม. ${mins} นาที ${secs} วิ`;
            }
            if (counter) counter.innerText = text;
            if (navTimer) navTimer.innerText = text;
        }, 1000);
    }

    // --- Helpers (Modified to use innerHTML) ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content'); 
    const closeBtn = document.getElementById('close-modal');
    window.openModal = function(title, text) {
        if(modalTitle) modalTitle.innerText = title;
        // 🔥 Change to innerHTML to support <audio> tag 🔥
        if(modalContent) modalContent.innerHTML = text.replace(/\n/g, '<br>'); 
        if(modal) modal.classList.add('active');
    };
    const closeModalFunc = () => { if(modal) modal.classList.remove('active'); };
    if (closeBtn) closeBtn.onclick = closeModalFunc;
    if (modal) { modal.addEventListener('click', (e) => { if (e.target === modal) closeModalFunc(); }); }

    document.querySelectorAll('.mood-btn').forEach(btn => {
        if (!btn.hasAttribute('onclick')) {
            btn.addEventListener('click', () => { window.openModal('จากใจนที ❤️', btn.getAttribute('data-msg')); });
        }
    });

    // Space Canvas
    const canvas = document.getElementById('space-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resizeCanvas); resizeCanvas();
        const stars = [];
        for(let i=0; i<150; i++) stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, radius: Math.random()*2, speed: Math.random()*0.5 });
        function animate() {
            if(document.getElementById('future').classList.contains('active')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'white';
                stars.forEach(star => { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2); ctx.fill(); star.y += star.speed; if(star.y > canvas.height) star.y = 0; });
                requestAnimationFrame(animate);
            }
        }
        animate();
    }
    
    // Init
    snowInterval = setInterval(createSnowflake, 200);
});