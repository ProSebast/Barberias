        // ========== BOOKING DATA ==========
        const bookingData = {
            barber: null,
            service: null,
            servicePrice: 0,
            serviceDuration: 0,
            date: null,
            time: null,
            clientName: null,
            clientPhone: null
        };

        // Stored bookings (simulated database)
        let bookings = JSON.parse(localStorage.getItem('laRocaBookings') || '[]');

        // ========== HEADER SCROLL EFFECT ==========
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // ========== MOBILE MENU ==========
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.getElementById('nav');

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });

        // ========== SMOOTH SCROLL ==========
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // ========== SET MIN DATE FOR BOOKING ==========
        const dateInput = document.getElementById('bookingDate');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        dateInput.value = tomorrow.toISOString().split('T')[0];

        // ========== BOOKING STEP NAVIGATION ==========
        function updateSteps(currentStep) {
            document.querySelectorAll('.step').forEach((step, index) => {
                const stepNum = index + 1;
                step.classList.remove('active', 'completed');
                if (stepNum < currentStep) {
                    step.classList.add('completed');
                } else if (stepNum === currentStep) {
                    step.classList.add('active');
                }
            });

            document.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('active');
            });
            document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        }

        // ========== BARBER SELECTION ==========
        document.querySelectorAll('.barber-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.barber-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                bookingData.barber = option.dataset.barber;
                document.getElementById('toStep2').disabled = false;
            });
        });

        // ========== SERVICE SELECTION ==========
        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                bookingData.service = option.dataset.service;
                bookingData.servicePrice = parseInt(option.dataset.price);
                bookingData.serviceDuration = parseInt(option.dataset.duration);
                document.getElementById('toStep3').disabled = false;
            });
        });

        // ========== TIME SLOT SELECTION ==========
        document.querySelectorAll('.time-slot:not(.disabled)').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                bookingData.time = slot.dataset.time;
                document.getElementById('toStep4').disabled = false;
            });
        });

        // ========== DATE CHANGE ==========
        dateInput.addEventListener('change', (e) => {
            bookingData.date = e.target.value;
            // Simulate random availability
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('disabled', 'selected');
                if (Math.random() < 0.2) {
                    slot.classList.add('disabled');
                }
            });
            bookingData.time = null;
            document.getElementById('toStep4').disabled = true;
        });

        // ========== NAVIGATION BUTTONS ==========
        document.getElementById('toStep2').addEventListener('click', () => updateSteps(2));
        document.getElementById('toStep3').addEventListener('click', () => updateSteps(3));
        document.getElementById('toStep4').addEventListener('click', () => {
            bookingData.date = dateInput.value;
            updateSummary();
            updateSteps(4);
        });

        document.getElementById('backToStep1').addEventListener('click', () => updateSteps(1));
        document.getElementById('backToStep2').addEventListener('click', () => updateSteps(2));
        document.getElementById('backToStep3').addEventListener('click', () => updateSteps(3));

        // ========== UPDATE SUMMARY ==========
        function updateSummary() {
            document.getElementById('summaryBarber').textContent = bookingData.barber;
            document.getElementById('summaryService').textContent = bookingData.service;
            
            const dateObj = new Date(bookingData.date + 'T12:00:00');
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('summaryDate').textContent = dateObj.toLocaleDateString('es-CL', options);
            
            document.getElementById('summaryTime').textContent = bookingData.time + ' hrs';
            document.getElementById('summaryTotal').textContent = '$' + bookingData.servicePrice.toLocaleString('es-CL');
        }

        // ========== CONFIRM BOOKING ==========
        document.getElementById('confirmBooking').addEventListener('click', () => {
            const clientName = document.getElementById('clientName').value.trim();
            const clientPhone = document.getElementById('clientPhone').value.trim();

            if (!clientName || !clientPhone) {
                alert('Por favor completa tu nombre y teléfono');
                return;
            }

            bookingData.clientName = clientName;
            bookingData.clientPhone = clientPhone;

            // Generate booking code
            const bookingCode = 'LR' + Date.now().toString(36).toUpperCase().slice(-6);

            // Save booking
            const newBooking = {
                code: bookingCode,
                ...bookingData,
                createdAt: new Date().toISOString()
            };
            bookings.push(newBooking);
            localStorage.setItem('laRocaBookings', JSON.stringify(bookings));

            // Show confirmation modal
            document.getElementById('bookingCode').textContent = bookingCode;
            document.getElementById('confirmBarber').textContent = bookingData.barber;
            document.getElementById('confirmService').textContent = bookingData.service;
            
            const dateObj = new Date(bookingData.date + 'T12:00:00');
            const dateStr = dateObj.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
            document.getElementById('confirmDateTime').textContent = `${dateStr} a las ${bookingData.time}`;

            document.getElementById('confirmationModal').classList.add('active');

            // Reset form
            resetBookingForm();
        });

        // ========== RESET BOOKING FORM ==========
        function resetBookingForm() {
            bookingData.barber = null;
            bookingData.service = null;
            bookingData.servicePrice = 0;
            bookingData.serviceDuration = 0;
            bookingData.date = null;
            bookingData.time = null;
            bookingData.clientName = null;
            bookingData.clientPhone = null;

            document.querySelectorAll('.barber-option, .service-option, .time-slot').forEach(el => {
                el.classList.remove('selected');
            });
            document.getElementById('clientName').value = '';
            document.getElementById('clientPhone').value = '';
            document.getElementById('toStep2').disabled = true;
            document.getElementById('toStep3').disabled = true;
            document.getElementById('toStep4').disabled = true;
            updateSteps(1);
        }

        // ========== CLOSE MODAL ==========
        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('confirmationModal').classList.remove('active');
        });

        document.getElementById('confirmationModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.getElementById('confirmationModal').classList.remove('active');
            }
        });

        // ========== ADD TO CALENDAR ==========
        document.getElementById('addToCalendar').addEventListener('click', (e) => {
            e.preventDefault();
            const lastBooking = bookings[bookings.length - 1];
            if (!lastBooking) return;

            const startDate = new Date(`${lastBooking.date}T${lastBooking.time}:00`);
            const endDate = new Date(startDate.getTime() + lastBooking.serviceDuration * 60000);

            const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Cita en La Roca Barber Shop - ' + lastBooking.service)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Barbero: ${lastBooking.barber}\nServicio: ${lastBooking.service}\nCódigo: ${lastBooking.code}`)}&location=${encodeURIComponent('Av. Ortúzar 520, Melipilla, Chile')}`;

            window.open(calendarUrl, '_blank');
        });

        // ========== CONTACT FORM ==========
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const phone = document.getElementById('contactPhone').value;
            const message = document.getElementById('contactMessage').value;

            // Simulate form submission
            alert(`¡Gracias ${name}! Hemos recibido tu mensaje y te contactaremos pronto.`);
            
            // Reset form
            e.target.reset();
        });

        // ========== GALLERY LIGHTBOX (Simple) ==========
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    window.open(img.src, '_blank');
                }
            });
        });

        // ========== ANIMATE ON SCROLL ==========
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.service-card, .team-card, .gallery-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // ========== CONSOLE WELCOME ==========
        console.log('%c💈 La Roca Barber Shop', 'font-size: 24px; font-weight: bold; color: #ff4d4d;');
        console.log('%cDesarrollado con 🔥 para Melipilla', 'font-size: 14px; color: #888;');