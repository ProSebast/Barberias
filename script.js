        // ========== API CONFIG ==========
        const API_BASE_URL = '/api';

        // ========== BOOKING DATA ==========
        const bookingData = {
            barberId: null,
            barberName: null,
            service: null,
            servicePrice: 0,
            serviceDuration: 0,
            date: null,
            time: null,
            clientName: null,
            clientPhone: null
        };

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
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
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

        // ========== LOAD BARBERS FROM API ==========
        async function loadBarbers() {
            const barberList = document.getElementById('barberList');
            if (!barberList) return;

            try {
                const response = await fetch(`${API_BASE_URL}/barberos`);
                const barberos = await response.json();
                
                barberList.innerHTML = ''; // Limpiar mensaje de carga o datos antiguos

                if (barberos.length === 0) {
                    barberList.innerHTML = '<p style="text-align: center; color: var(--primary); width: 100%;">No hay barberos registrados en el sistema.</p>';
                    return;
                }

                barberos.forEach(barbero => {
                    const div = document.createElement('div');
                    div.className = 'barber-option';
                    div.dataset.id = barbero.id;
                    div.dataset.nombre = barbero.nombre;
                    div.innerHTML = `
                        <div class="barber-avatar">👨‍🦱</div>
                        <h4>${barbero.nombre.toUpperCase()}</h4>
                        <p>Barbero Profesional</p>
                    `;
                    div.addEventListener('click', () => selectBarber(div));
                    barberList.appendChild(div);
                });
            } catch (error) {
                console.error("Error cargando barberos:", error);
                barberList.innerHTML = '<p style="text-align: center; color: var(--primary); width: 100%;">Error de conexión: No se pudieron cargar los barberos.</p>';
            }
        }

        function selectBarber(element) {
            document.querySelectorAll('.barber-option').forEach(o => o.classList.remove('selected'));
            element.classList.add('selected');
            bookingData.barberId = element.dataset.id;
            bookingData.barberName = element.dataset.nombre;
            document.getElementById('toStep2').disabled = false;
        }

        // ========== LOAD TIME SLOTS FROM API ==========
        async function loadTimeSlots() {
            const timeSlotsContainer = document.getElementById('timeSlots');
            if (!timeSlotsContainer) return;

            timeSlotsContainer.innerHTML = '<p style="grid-column: span 4; text-align: center;">Cargando horarios...</p>';
            
            try {
                const response = await fetch(`${API_BASE_URL}/horarios?barbero_id=${bookingData.barberId}`);
                const horarios = await response.json();
                
                timeSlotsContainer.innerHTML = '';
                if (horarios.length === 0) {
                    timeSlotsContainer.innerHTML = '<p style="grid-column: span 4; text-align: center;">No hay horarios disponibles</p>';
                    return;
                }

                horarios.forEach(h => {
                    const slot = document.createElement('div');
                    slot.className = 'time-slot';
                    slot.dataset.time = h.hora;
                    slot.textContent = h.hora;
                    slot.addEventListener('click', () => {
                        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                        slot.classList.add('selected');
                        bookingData.time = slot.dataset.time;
                        document.getElementById('toStep4').disabled = false;
                    });
                    timeSlotsContainer.appendChild(slot);
                });
            } catch (error) {
                console.error("Error cargando horarios:", error);
                timeSlotsContainer.innerHTML = '<p style="grid-column: span 4; color: var(--primary);">Error al cargar horarios</p>';
            }
        }

        // Initialize Barbers
        loadBarbers();

        // ========== SET MIN DATE FOR BOOKING ==========
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }

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
            const targetStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            if (targetStep) targetStep.classList.add('active');
            
            if (currentStep === 3) {
                loadTimeSlots();
            }
        }

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

        // ========== DATE CHANGE ==========
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                bookingData.date = e.target.value;
                loadTimeSlots();
                bookingData.time = null;
                document.getElementById('toStep4').disabled = true;
            });
        }

        // ========== NAVIGATION BUTTONS ==========
        if (document.getElementById('toStep2')) document.getElementById('toStep2').addEventListener('click', () => updateSteps(2));
        if (document.getElementById('toStep3')) document.getElementById('toStep3').addEventListener('click', () => updateSteps(3));
        if (document.getElementById('toStep4')) document.getElementById('toStep4').addEventListener('click', () => {
            bookingData.date = dateInput.value;
            updateSummary();
            updateSteps(4);
        });

        if (document.getElementById('backToStep1')) document.getElementById('backToStep1').addEventListener('click', () => updateSteps(1));
        if (document.getElementById('backToStep2')) document.getElementById('backToStep2').addEventListener('click', () => updateSteps(2));
        if (document.getElementById('backToStep3')) document.getElementById('backToStep3').addEventListener('click', () => updateSteps(3));

        // ========== UPDATE SUMMARY ==========
        function updateSummary() {
            if (document.getElementById('summaryBarber')) document.getElementById('summaryBarber').textContent = bookingData.barberName;
            if (document.getElementById('summaryService')) document.getElementById('summaryService').textContent = bookingData.service;
            
            if (bookingData.date) {
                const dateObj = new Date(bookingData.date + 'T12:00:00');
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                if (document.getElementById('summaryDate')) document.getElementById('summaryDate').textContent = dateObj.toLocaleDateString('es-CL', options);
            }
            
            if (document.getElementById('summaryTime')) document.getElementById('summaryTime').textContent = bookingData.time + ' hrs';
            if (document.getElementById('summaryTotal')) document.getElementById('summaryTotal').textContent = '$' + bookingData.servicePrice.toLocaleString('es-CL');
        }

        // ========== CONFIRM BOOKING ==========
        const confirmBtn = document.getElementById('confirmBooking');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                const clientName = document.getElementById('clientName').value.trim();
                const clientPhone = document.getElementById('clientPhone').value.trim();

                if (!clientName || !clientPhone) {
                    alert('Por favor completa tu nombre y teléfono');
                    return;
                }

                bookingData.clientName = clientName;
                bookingData.clientPhone = clientPhone;

                try {
                    const response = await fetch(`${API_BASE_URL}/reservas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre_cliente: bookingData.clientName,
                            telefono: bookingData.clientPhone,
                            barbero_id: bookingData.barberId,
                            fecha: bookingData.date,
                            hora: bookingData.time
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        document.getElementById('bookingCode').textContent = 'LR' + Math.random().toString(36).substr(2, 6).toUpperCase();
                        document.getElementById('confirmBarber').textContent = bookingData.barberName;
                        document.getElementById('confirmService').textContent = bookingData.service;
                        
                        const dateObj = new Date(bookingData.date + 'T12:00:00');
                        const dateStr = dateObj.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
                        document.getElementById('confirmDateTime').textContent = `${dateStr} a las ${bookingData.time}`;

                        document.getElementById('confirmationModal').classList.add('active');
                        resetBookingForm();
                    } else {
                        alert('Error al crear la reserva: ' + (result.error || 'Desconocido'));
                    }
                } catch (error) {
                    console.error("Error confirmando reserva:", error);
                    alert('Ocurrió un error al procesar tu reserva.');
                }
            });
        }

        // ========== RESET BOOKING FORM ==========
        function resetBookingForm() {
            bookingData.barberId = null;
            bookingData.barberName = null;
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
            if (document.getElementById('clientName')) document.getElementById('clientName').value = '';
            if (document.getElementById('clientPhone')) document.getElementById('clientPhone').value = '';
            if (document.getElementById('toStep2')) document.getElementById('toStep2').disabled = true;
            if (document.getElementById('toStep3')) document.getElementById('toStep3').disabled = true;
            if (document.getElementById('toStep4')) document.getElementById('toStep4').disabled = true;
            updateSteps(1);
        }

        // ========== CLOSE MODAL ==========
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                document.getElementById('confirmationModal').classList.remove('active');
            });
        }

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

        console.log('%c💈 La Roca Barber Shop - API Ready', 'font-size: 16px; font-weight: bold; color: #ff4d4d;');
                    behavior: 'smooth'
                });
            }, 100);
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