document.addEventListener('DOMContentLoaded', () => {

    // --- Tema Yönetimi ---
    const themeBtn = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    const currentTheme = localStorage.getItem("theme");
    if (currentTheme == "light" || (!currentTheme && !prefersDarkScheme.matches)) {
        document.body.classList.add("light-mode");
        if (themeBtn) themeBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            themeBtn.querySelector('i').classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
            localStorage.setItem("theme", isLight ? "light" : "dark");
        });
    }
    // --- İnteraktif Yetenek Kartları (Skills) ---
    const skillCards = document.querySelectorAll('.interactive-skill');
    if (skillCards.length > 0) {
        skillCards.forEach(card => {
            card.addEventListener('click', () => {
                // Tıklanan kartın durumunu değiştir (Aç/Kapat)
                card.classList.toggle('expanded');

                // İsteğe bağlı görsel detay: Kart açıldığında progress bar animasyonunu baştan oynat
                if (card.classList.contains('expanded')) {
                    const bar = card.querySelector('.skill-progress');
                    if (bar) {
                        bar.style.width = '0'; // Önce sıfırla
                        setTimeout(() => {
                            bar.style.width = bar.getAttribute('data-width'); // Sonra tekrar doldur
                        }, 50);
                    }
                }
            });
        });
    }

    // --- Scroll Progress Bar ---
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // --- Responsive Navbar ---
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-item');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('nav-active'));
        navItems.forEach(item => item.addEventListener('click', () => navLinks.classList.remove('nav-active')));
    }

    // --- Intersection Observer (Ana Sayfa Animasyonları) ---
    const sections = document.querySelectorAll('.section, .hero');
    if (sections.length > 0) {
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.id === 'skills') {
                        document.querySelectorAll('.skill-progress').forEach(bar => bar.style.width = bar.getAttribute('data-width'));
                    }
                }
                if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
                    let id = entry.target.getAttribute('id');
                    navItems.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) link.classList.add('active');
                    });
                }
            });
        }, observerOptions);

        sections.forEach(sec => sectionObserver.observe(sec));
    }

    // --- Lazy Loading ---
    document.querySelectorAll('.lazy-img').forEach(img => {
        if (img.complete) img.classList.add('loaded');
        else img.addEventListener('load', () => img.classList.add('loaded'));
    });

    // --- Modal İşlemleri (Sadece Ana Sayfada Çalışır) ---
    const modal = document.getElementById('projectModal');
    if (modal) {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', function () {
                if (this.classList.contains('blog-card')) return;
                document.getElementById('modalImg').src = this.getAttribute('data-img');
                document.getElementById('modalTitle').innerText = this.getAttribute('data-title');
                document.getElementById('modalDesc').innerText = this.getAttribute('data-desc');

                const liveBtn = document.getElementById('modalLiveBtn');
                const gitBtn = document.getElementById('modalGithubBtn');

                liveBtn.href = this.getAttribute('data-demo');
                gitBtn.href = this.getAttribute('data-github');

                liveBtn.style.display = this.getAttribute('data-demo') === '#' ? 'none' : 'inline-block';
                gitBtn.style.display = this.getAttribute('data-github') === '#' ? 'none' : 'inline-block';

                modal.style.display = "flex";
                setTimeout(() => modal.classList.add('show'), 10);
                document.body.style.overflow = "hidden";
            });
        });

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = "none"; document.body.style.overflow = "auto"; }, 300);
        };

        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        window.addEventListener('keydown', (e) => { if (e.key === "Escape" && modal.style.display === "flex") closeModal(); });
    }

    // --- Filtreleme Sistemi ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');

                document.querySelectorAll('.project-card').forEach(card => {
                    if (card.classList.contains('blog-card')) return;
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 50);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // --- 5.1 Masaüstü Kusursuz İmleç Motoru (Hata Giderildi) ---
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const dot = document.getElementById("cursor-dot");
        const follower = document.getElementById("cursor-follower");
        let mx = 0, my = 0, fx = 0, fy = 0;

        window.addEventListener("mousemove", (e) => {
            mx = e.clientX; my = e.clientY;
            if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
        });

        function animateCursor() {
            fx += (mx - fx) * 0.35;
            fy += (my - fy) * 0.35;

            if (follower) { follower.style.left = fx + "px"; follower.style.top = fy + "px"; }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.querySelectorAll("a, button, .project-card, .skill-card, input, textarea, .theme-btn, .footer-icon").forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover-active"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover-active"));
        });
    }

    // --- Typewriter ---
    const nameText = "AzizEmre Yılmaz";
    const tw = document.getElementById("typewriter");
    let idx = 0;
    function type() { if (tw && idx < nameText.length) { tw.innerHTML += nameText.charAt(idx); idx++; setTimeout(type, 100); } }

    window.addEventListener('load', () => {
        type();
        setTimeout(() => {
            const p = document.getElementById('preloader');
            if (p) { p.style.opacity = '0'; setTimeout(() => p.style.display = 'none', 800); }
        }, 1500);
    });
});

// --- YENİ EKLENEN ÖZELLİKLER (TR/EN, 3D TILT, FILTER, CHATBOT) ---

// 1. Çoklu Dil Desteği
const langToggleBtn = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('site_lang') || 'tr';

const updateLanguage = () => {
    document.querySelectorAll('[data-tr]').forEach(el => {
        const text = currentLang === 'en' && el.getAttribute('data-en') ? el.getAttribute('data-en') : el.getAttribute('data-tr');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = text;
        else el.innerHTML = text;
    });
    if (langToggleBtn) langToggleBtn.innerText = currentLang === 'tr' ? 'EN' : 'TR';
};

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'tr' ? 'en' : 'tr';
        localStorage.setItem('site_lang', currentLang);
        updateLanguage();
    });
    updateLanguage();
}

// 2. 3D Tilt Kart Efekti
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});

// 3. Gelişmiş Filtreleme Animasyonu
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-grid .project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.transform = 'scale(1)'; card.style.opacity = '1'; }, 50);
                } else {
                    card.style.display = 'none';
                }
            }, 400);
        });
    });
});

// 4. Yapay Zeka Chatbot (AzizAI)
const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
const chatbotWindow = document.getElementById('chatbot-window');
if (chatbotToggleBtn && chatbotWindow) {
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');

    chatbotToggleBtn.addEventListener('click', () => chatbotWindow.classList.toggle('hidden'));
    chatbotClose.addEventListener('click', () => chatbotWindow.classList.add('hidden'));

    const botBrain = {
        "c#": "C# ile OOP prensiplerine uygun sistemler geliştiriyorum. Otopark ücretlendirme sistemi projemi inceleyebilirsiniz.",
        "flutter": "Flutter ve Dart ile çapraz platform, modern mobil uygulamalar (örneğin habit tracker) yazıyorum.",
        "iletişim": "Aşağıdaki formdan veya LinkedIn profilimden ulaşabilirsiniz.",
        "okul": "Atatürk Üniversitesi Bilişim Sistemleri ve Teknolojileri bölümündeyim.",
        "neler": "Modern web siteleri, mobil uygulamalar, veritabanı (SQL) modellemeleri ve Python scriptleri geliştiriyorum."
    };

    const sendMessage = () => {
        const userText = chatbotInput.value.trim().toLowerCase();
        if (userText === "") return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerText = chatbotInput.value;
        chatbotMessages.appendChild(msgDiv);

        chatbotInput.value = '';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        setTimeout(() => {
            let response = "Yazılım, C#, Flutter projelerim veya iletişim bilgilerim hakkında sorular sorabilirsiniz!";
            for (let key in botBrain) {
                if (userText.includes(key)) { response = botBrain[key]; break; }
            }
            const botDiv = document.createElement('div');
            botDiv.className = 'message bot-message';
            botDiv.innerText = response;
            chatbotMessages.appendChild(botDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 600);
    };

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
}

// --- 1. DİL MOTORU (Temiz Geçiş) ---
const langBtn = document.getElementById('lang-toggle');
const translatable = document.querySelectorAll('[data-tr]');

langBtn.addEventListener('click', () => {
    const isTR = langBtn.innerText === 'TR';
    langBtn.innerText = isTR ? 'EN' : 'TR';

    translatable.forEach(el => {
        el.innerText = isTR ? el.getAttribute('data-tr') : el.getAttribute('data-en');
    });
});

// --- 2. AKILLI YAPAY ZEKA BOTU ---
const botBrain = {
    "selam": "Merhaba! Ben Aziz Emre'nin dijital asistanıyım. Sana projeleri hakkında bilgi verebilirim.",
    "c#": "Aziz, C# ile OOP (Nesne Yönelimli Programlama) projeleri geliştiriyor. Özellikle Otopark Otomasyonu projesi oldukça kapsamlı.",
    "flutter": "Flutter ile mobil arayüzler geliştiriyor. Dart dilini çok verimli kullanıyor.",
    "iletişim": "İletişim formunu kullanarak ona doğrudan ulaşabilirsin!",
    "kim": "Aziz Emre, Atatürk Üniversitesi'nde Bilişim Sistemleri okuyan bir Full-Stack Developer'dır."
};

function getBotResponse(input) {
    input = input.toLowerCase();
    for (let key in botBrain) {
        if (input.includes(key)) return botBrain[key];
    }
    return "Bunu not aldım, Aziz Emre'ye iletmemi ister misin?";
}