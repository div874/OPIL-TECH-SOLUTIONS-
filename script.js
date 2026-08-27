/* ==========================================================================
   OPIL Tech Solutions - Main Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        mobileNavDrawer.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNavDrawer.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // --- Services GooeyNav Tab Switcher ---
    const gooeyContainer = document.getElementById('gooey-services-nav');
    const gooeyNavList = document.getElementById('gooey-nav-list');
    const gooeyFilter = document.getElementById('gooey-filter');
    const gooeyText = document.getElementById('gooey-text');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (gooeyContainer && gooeyNavList) {
        const gooeyItems = gooeyNavList.querySelectorAll('li');
        let activeIndex = 0;
        
        // Configuration matching the React version
        const particleCount = 15;
        const particleDistances = [90, 10];
        const particleR = 100;
        const animationTime = 600;
        const timeVariance = 300;
        const colors = [1, 2, 3, 1, 2, 3, 1, 4]; // Correspond to CSS vars
        
        const noise = (n = 1) => n / 2 - Math.random() * n;
        
        const getXY = (distance, pointIndex, totalPoints) => {
            const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
            return [distance * Math.cos(angle), distance * Math.sin(angle)];
        };
        

        
        const updateEffectPosition = element => {
            const containerRect = gooeyContainer.getBoundingClientRect();
            const pos = element.getBoundingClientRect();
            
            const styles = {
                left: `${pos.x - containerRect.x}px`,
                top: `${pos.y - containerRect.y}px`,
                width: `${pos.width}px`,
                height: `${pos.height}px`
            };
            
            Object.assign(gooeyFilter.style, styles);
            Object.assign(gooeyText.style, styles);
            gooeyText.innerHTML = element.querySelector('a').innerHTML;
        };
        
        // Initial setup
        updateEffectPosition(gooeyItems[activeIndex]);
        gooeyText.classList.add('active');
        
        // Handle window resize
        window.addEventListener('resize', () => {
            updateEffectPosition(gooeyItems[activeIndex]);
        });
        
        // Handle clicks
        gooeyItems.forEach((liEl, index) => {
            liEl.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent jump to #services if it's anchor
                
                if (activeIndex === index) return;
                
                activeIndex = index;
                
                // Update active state on Nav Items
                gooeyItems.forEach(li => li.classList.remove('active'));
                liEl.classList.add('active');
                
                // Switch Tab Content below
                tabContents.forEach(c => c.classList.remove('active'));
                const targetTab = liEl.getAttribute('data-tab');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) targetContent.classList.add('active');
                
                // Trigger Gooey animations
                updateEffectPosition(liEl);
                
                if (gooeyText) {
                    gooeyText.classList.remove('active');
                    void gooeyText.offsetWidth; // Force reflow
                    gooeyText.classList.add('active');
                }
            });
        });
    }

    // --- Stats Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1500; // 1.5s animation
        const frameRate = 1000 / 60; // 60 FPS
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out quad formula for smooth decelerating animation
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.round(target * easeProgress);

            if (el.textContent.includes('%')) {
                el.textContent = `${currentVal}%`;
            } else if (el.textContent.includes('+')) {
                el.textContent = `${currentVal}+`;
            } else {
                el.textContent = currentVal;
            }

            if (frame === totalFrames) {
                // Ensure target value is explicitly set at the end
                if (el.textContent.includes('%')) {
                    el.textContent = `${target}%`;
                } else if (el.textContent.includes('+')) {
                    el.textContent = `${target}+`;
                } else {
                    el.textContent = target;
                }
                clearInterval(timer);
            }
        }, frameRate);
    }

    // Intersection Observer to trigger counter when stats enter viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.stat-number');
                numbers.forEach(num => animateCounter(num));
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsObserver.observe(statsGrid);
    }

    // --- Consultation Form Handler ---
    const form = document.getElementById('consultation-form');
    const formFeedback = document.getElementById('form-feedback');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear prior feedback
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';

            // Get form values
            const name = document.getElementById('full-name').value.trim();
            const email = document.getElementById('email-address').value.trim();
            const phone = document.getElementById('phone-number').value.trim();
            const service = document.getElementById('service-category').value;
            const message = document.getElementById('message-details').value.trim();

            // Simple validation assertions
            if (!name || !email || !phone || !service || !message) {
                showFeedback('Please fill in all details before submitting.', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showFeedback('Please provide a valid email address.', 'error');
                return;
            }

            // Mocking API Submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Request...';

            setTimeout(() => {
                // Success feedback
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                showFeedback('Thank you! Your consultation request has been submitted successfully. A growth specialist will contact you shortly.', 'success');
                form.reset();
            }, 1200);
        });
    }

    function showFeedback(msg, type) {
        formFeedback.textContent = msg;
        formFeedback.classList.add(type);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // --- Header Transparency / Shadow Toggle on Scroll ---
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-md)';
            header.style.padding = '5px 0'; // Compact header on scroll
        } else {
            header.style.boxShadow = 'none';
            header.style.padding = '0';
        }
    });

});

// Header scroll logic
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        // trigger once on load
        if (window.scrollY > 50) header.classList.add('scrolled');
    }
});

// Scroll Reveal Observer
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
});
