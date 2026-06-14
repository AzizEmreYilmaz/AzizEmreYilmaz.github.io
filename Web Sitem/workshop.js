document.addEventListener('DOMContentLoaded', () => {

    const checks = document.querySelectorAll('.price-check');
    const totalDisplay = document.getElementById('total-amount');
    const symbolDisplay = document.getElementById('currency-symbol');
    const currencyBtns = document.querySelectorAll('.currency-btn');
    const summaryList = document.getElementById('selection-summary');
    const projectTypeSelect = document.getElementById('project-type');
    const timeDisplay = document.getElementById('time-display');
    const progressBar = document.getElementById('config-progress');
    const progressText = document.getElementById('progress-text');
    const smartWarningBox = document.getElementById('smart-warnings');
    const priceSummaryBox = document.querySelector('.price-summary');

    const bdAltyapi = document.getElementById('bd-altyapi');
    const bdTasarim = document.getElementById('bd-tasarim');
    const bdYazilim = document.getElementById('bd-yazilim');
    const bdPazarlama = document.getElementById('bd-pazarlama');

    let curr = 'TRY';
    let rates = { 'TRY': 1, 'USD': 0.022 };
    const symbols = { 'TRY': '₺', 'USD': '$' };
    let currentDisplayedTotal = 0;
    let debounceTimer;

    const fetchRates = async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
            const data = await response.json();
            rates['USD'] = data.rates.USD;
            console.log("Canlı Kur Çekildi: 1 TRY = " + rates['USD'] + " USD");
        } catch (error) {
            console.warn("API Hatası, statik kurlar devrede.");
        }
    };
    fetchRates();

    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'fa-check-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        if (type === 'error') icon = 'fa-times-circle';

        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    const animateValue = (start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = progress * (end - start) + start;

            totalDisplay.innerText = curr === 'TRY' ? Math.round(currentVal).toLocaleString('tr-TR') : currentVal.toFixed(2);
            if (progress < 1) window.requestAnimationFrame(step);
            else currentDisplayedTotal = end;
        };
        window.requestAnimationFrame(step);
    };

    const update = () => {
        let total = 0, totalTime = 0;
        let cats = { altyapi: 0, tasarim: 0, yazilim: 0, pazarlama: 0 };
        let selectedNames = [];
        let checkedCount = 0;

        checks.forEach(c => {
            if (c.checked) {
                const p = parseInt(c.getAttribute('data-price'));
                total += p;
                totalTime += parseInt(c.getAttribute('data-time'));
                cats[c.getAttribute('data-cat')] += p;
                selectedNames.push(c.getAttribute('data-name'));
                checkedCount++;
            }
        });

        bdAltyapi.innerText = Math.round(cats.altyapi * rates[curr]).toLocaleString('tr-TR') + symbols[curr];
        bdTasarim.innerText = Math.round(cats.tasarim * rates[curr]).toLocaleString('tr-TR') + symbols[curr];
        bdYazilim.innerText = Math.round(cats.yazilim * rates[curr]).toLocaleString('tr-TR') + symbols[curr];
        bdPazarlama.innerText = Math.round(cats.pazarlama * rates[curr]).toLocaleString('tr-TR') + symbols[curr];

        let progressPercent = Math.min((checkedCount / 10) * 100, 100);
        if (projectTypeSelect.value) progressPercent = Math.min(progressPercent + 20, 100);
        progressBar.style.width = `${progressPercent}%`;
        progressText.innerText = `Konfigürasyon: %${Math.round(progressPercent)}`;

        if (selectedNames.length > 0) {
            summaryList.innerHTML = selectedNames.map(item => `
                <div class="summary-item" style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-main);">
                    <i class="fas fa-check-circle" style="color: var(--accent); font-size: 0.75rem;"></i> ${item}
                </div>
            `).join('');
        } else {
            summaryList.innerHTML = '<p class="empty-msg">Sistemi yapılandırmaya başlayın.</p>';
        }

        let warnings = [];
        const hasDomain = selectedNames.includes("Domain Yönetimi");
        const hasHosting = selectedNames.includes("Yüksek Performans Hosting");
        const hasEcom = selectedNames.includes("E-Ticaret Modülü") || projectTypeSelect.value === "E-Ticaret";
        const hasPos = selectedNames.includes("Sanal POS / Ödeme");
        const hasSeo = selectedNames.includes("İleri Seviye SEO");

        if (hasDomain && !hasHosting) warnings.push("<strong>Öneri:</strong> Domain seçtiniz ancak Hosting seçmediniz. Site yayını için hosting gereklidir.");
        if (hasEcom && !hasPos) warnings.push("<strong>Dikkat:</strong> E-Ticaret altyapısında ödeme alabilmek için Sanal POS entegrasyonu önerilir.");
        if (hasEcom && !hasSeo) warnings.push("<strong>Büyüme Önerisi:</strong> E-Ticaret projelerinin rekabet edebilmesi için İleri Seviye SEO eklemeniz şiddetle tavsiye edilir.");

        if (warnings.length > 0) {
            smartWarningBox.style.display = "block";
            smartWarningBox.innerHTML = warnings.join('<br><br>');
        } else {
            smartWarningBox.style.display = "none";
        }

        timeDisplay.innerText = totalTime > 0 ? `${totalTime} İş Günü` : '0 İş Günü';

        priceSummaryBox.classList.remove('glow');
        void priceSummaryBox.offsetWidth;
        priceSummaryBox.classList.add('glow');

        const targetTotal = total * rates[curr];
        animateValue(currentDisplayedTotal, targetTotal, 500);
        symbolDisplay.innerText = symbols[curr];

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const state = { curr, projectType: projectTypeSelect.value, selections: selectedNames };
            localStorage.setItem('workshopState', JSON.stringify(state));
        }, 500);
    };

    document.querySelectorAll('.package-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            checks.forEach(c => c.checked = false);
            const pkg = btn.getAttribute('data-pkg');

            if (pkg === 'starter') {
                document.querySelector('[data-name="Domain Yönetimi"]').checked = true;
                document.querySelector('[data-name="Yüksek Performans Hosting"]').checked = true;
                document.querySelector('[data-name="Responsive (Mobil) Tasarım"]').checked = true;
                projectTypeSelect.value = "Kurumsal";
                showToast("Starter Paket uygulandı.", "success");
            } else if (pkg === 'business') {
                document.querySelector('[data-name="Domain Yönetimi"]').checked = true;
                document.querySelector('[data-name="Yüksek Performans Hosting"]').checked = true;
                document.querySelector('[data-name="Özel UI/UX Tasarım"]').checked = true;
                document.querySelector('[data-name="Gelişmiş Admin Panel"]').checked = true;
                document.querySelector('[data-name="KVKK Uyumlu Yapı"]').checked = true;
                projectTypeSelect.value = "Kurumsal";
                showToast("Business Paket uygulandı.", "success");
            } else if (pkg === 'premium') {
                checks.forEach(c => {
                    if (!c.getAttribute('data-name').includes("Blog")) c.checked = true;
                });
                projectTypeSelect.value = "E-Ticaret";
                showToast("Premium E-Ticaret Paketi uygulandı.", "success");
            }
            update();
        });
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        checks.forEach(c => c.checked = false);
        projectTypeSelect.value = "";
        showToast("Tüm seçimler temizlendi.", "warning");
        update();
    });

    currencyBtns.forEach(btn => {
        if (btn.id === 'reset-btn') return;
        btn.addEventListener('click', () => {
            currencyBtns.forEach(b => { if (b.id !== 'reset-btn') b.classList.remove('active') });
            btn.classList.add('active');
            curr = btn.getAttribute('data-curr');
            update();
        });
    });

    checks.forEach(c => c.addEventListener('change', update));
    projectTypeSelect.addEventListener('change', update);

    const loadState = () => {
        const saved = JSON.parse(localStorage.getItem('workshopState'));
        if (saved) {
            if (saved.projectType) projectTypeSelect.value = saved.projectType;
            if (saved.curr && saved.curr !== 'TRY') document.querySelector(`[data-curr="${saved.curr}"]`).click();
            if (saved.selections) {
                checks.forEach(c => { if (saved.selections.includes(c.getAttribute('data-name'))) c.checked = true; });
            }
            update();
            showToast("Kaldığınız yerden devam ediyorsunuz.", "success");
        }
    };
    loadState();

    const workshopForm = document.getElementById('workshop-form');
    if (workshopForm) {
        workshopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('form-submit-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İşleniyor...';
            btn.disabled = true;

            const contactName = document.getElementById('contact-name').value;
            const description = document.getElementById('site-description').value;
            const projectType = projectTypeSelect.value;

            let selectedServices = [];
            checks.forEach(c => { if (c.checked) selectedServices.push(c.getAttribute('data-name')); });

            showToast('Harika! Sistem tasarımı simüle ediliyor...', 'success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                workshopForm.reset();
                checks.forEach(c => c.checked = false);
                update();
            }, 2000);
        });
    }

    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const name = document.getElementById('contact-name').value || 'Müşteri';
            const type = projectTypeSelect.value || 'Belirtilmedi';
            const price = `${totalDisplay.innerText} ${symbolDisplay.innerText}`;
            let selected = [];
            checks.forEach(c => { if (c.checked) selected.push(c.getAttribute('data-name')); });

            if (selected.length === 0) {
                showToast("Lütfen önce hizmet seçimi yapın.", "warning"); return;
            }

            const text = `Merhaba, ben ${name}. Proje konfigüratöründen bir paket oluşturdum:\n\n*Proje Tipi:* ${type}\n*Bütçe:* ${price}\n*İstenen Hizmetler:* ${selected.join(', ')}\n\nDetayları görüşmek istiyorum.`;
            const encodedText = encodeURIComponent(text);
            window.open(`https://wa.me/905000000000?text=${encodedText}`, '_blank');
        });
    }

    // --- GELİŞMİŞ CANLI WEB SİTESİ SİMÜLATÖRÜ MOTORU ---
    const simPrimaryColor = document.getElementById('sim-primary-color');
    const simBgColor = document.getElementById('sim-bg-color');
    const simTextColor = document.getElementById('sim-text-color');

    // Yeni Eklenen DOM Elemanları
    const simLayout = document.getElementById('sim-layout');
    const simBrandName = document.getElementById('sim-brand-name');
    const simDomainExt = document.getElementById('sim-domain-ext');
    const mockupUrlText = document.getElementById('mockup-url-text');
    const mockupHeaderBox = document.getElementById('mockup-header-box');

    const simLogoUpload = document.getElementById('sim-logo-upload');
    const fileNameText = document.getElementById('file-name-text');

    const virtualWebsite = document.getElementById('virtual-website');
    const mockupLogo = document.getElementById('mockup-logo');
    const mockupLogoText = document.getElementById('mockup-logo-text');

    if (virtualWebsite) {
        // Renk Değişimleri
        simPrimaryColor.addEventListener('input', (e) => virtualWebsite.style.setProperty('--v-primary', e.target.value));
        simBgColor.addEventListener('input', (e) => virtualWebsite.style.setProperty('--v-bg', e.target.value));
        simTextColor.addEventListener('input', (e) => virtualWebsite.style.setProperty('--v-text', e.target.value));

        // Düzen (Layout) Değişimi
        simLayout.addEventListener('change', (e) => {
            mockupHeaderBox.className = 'mockup-header ' + e.target.value;
        });

        // Marka Adı ve Alan Adı (URL) Değişimi
        const updateUrlAndBrand = () => {
            let brandVal = simBrandName.value.trim();
            let extVal = simDomainExt.value;

            // Logodaki yazıyı güncelle
            mockupLogoText.innerText = brandVal || 'Markanız';

            // URL Çubuğundaki yazıyı İngilizce karaktere çevir ve boşlukları silerek güncelle
            let urlFriendlyName = brandVal.toLowerCase()
                .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]/g, ''); // Sadece harf ve rakamları bırak

            mockupUrlText.innerText = (urlFriendlyName || 'markaniz') + extVal;
        };

        simBrandName.addEventListener('input', updateUrlAndBrand);
        simDomainExt.addEventListener('change', updateUrlAndBrand);

        // Estetik Dosya Yükleme (Custom Upload) Değişimi
        simLogoUpload.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                // Özel butondaki metni yüklenen dosyanın adıyla değiştir
                fileNameText.innerText = file.name;
                fileNameText.style.color = "var(--accent)";

                const reader = new FileReader();
                reader.addEventListener('load', function () {
                    mockupLogo.setAttribute('src', this.result);
                    mockupLogo.style.display = 'block';
                    mockupLogoText.style.display = 'none';
                });
                reader.readAsDataURL(file);
            } else {
                fileNameText.innerText = "Görsel Seçmek İçin Tıklayın";
                fileNameText.style.color = "var(--text-main)";
            }
        });
    }

    document.querySelectorAll("button, select, input, .check-item, textarea, label.custom-file-upload").forEach(el => {
        el.addEventListener("mouseenter", () => {
            document.body.classList.add("cursor-hover-active");
            const iconEl = document.getElementById('tool-icon');
            if (!iconEl) return;

            if (el.type === 'checkbox' || el.classList.contains('check-item')) iconEl.innerHTML = '<i class="fas fa-check"></i>';
            else if (el.type === 'submit') iconEl.innerHTML = '<i class="fas fa-paper-plane"></i>';
            else if (el.id === 'whatsapp-btn') iconEl.innerHTML = '<i class="fab fa-whatsapp"></i>';
            else if (el.classList.contains('custom-file-upload')) iconEl.innerHTML = '<i class="fas fa-upload"></i>';
            else iconEl.innerHTML = '<i class="fas fa-tools"></i>';
        });

        el.addEventListener("mouseleave", () => {
            document.body.classList.remove("cursor-hover-active");
            const iconEl = document.getElementById('tool-icon');
            if (iconEl) iconEl.innerHTML = '<i class="fas fa-tools"></i>';
        });
    });
});