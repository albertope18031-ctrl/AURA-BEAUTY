/**
 * AURA BEAUTY - Lógica Interactiva, Slider Antes/Después, Cotizador Dinámico y
 * Sistema Inteligente de Horarios con Bloqueo por Duración.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. GESTIÓN DEL MENÚ MÓVIL Y NAVBAR SCROLL
  // ========================================================
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Efecto sticky en scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Abrir / Cerrar Drawer Móvil
  function openMobileMenu() {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileMenu);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ========================================================
  // 2. FILTRADO DE SERVICIOS (CATÁLOGO)
  // ========================================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const serviceCards = document.querySelectorAll('.service-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category;
      serviceCards.forEach(card => {
        const isMatch = (category === 'all' || card.dataset.category === category);
        if (isMatch) {
          card.classList.remove('is-hidden');
          card.style.removeProperty('display');
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.classList.add('is-hidden');
          card.style.setProperty('display', 'none', 'important');
        }
      });
    });
  });

  // Botón "Seleccionar en Cotizador" desde las tarjetas de servicio
  const selectServiceButtons = document.querySelectorAll('.btn-service-select');
  selectServiceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceId = btn.dataset.service;
      selectServiceInWizard(serviceId, true);
    });
  });

  // ========================================================
  // 3. GALERÍA DE TRANSFORMACIONES (SLIDER ANTES/DESPUÉS)
  // ========================================================
  const sliderWrapper = document.getElementById('comparisonSlider');
  const layerBefore = document.getElementById('layerBefore');
  const sliderHandle = document.getElementById('sliderHandle');
  const rangeInput = document.getElementById('rangeInput');
  const caseTabs = document.querySelectorAll('.case-tab');
  const btnQuieroResultado = document.getElementById('btnQuieroResultado');

  // Datos de los casos reales para el slider (con la misma persona/modelo en Antes y Después)
  const transformationCases = {
    balayage: {
      category: 'Cabello & Color',
      title: 'Balayage Vainilla Glaze & Tratamiento Plex',
      description: 'Transformación de tono castaño natural a rubio vainilla luminoso con degradé suave, manteniendo 100% la elasticidad y sedosidad capilar.',
      imgBefore: 'assets/balayage_before.jpg',
      imgAfter: 'assets/balayage_after.jpg',
      targetService: 'colorimetria'
    },
    manicura: {
      category: 'Uñas & Manicura',
      title: 'Manicura Rusa & Nivelación Rubber Gel',
      description: 'Retiro milimétrico de cutícula con fresa de diamante y aplicación de base rubber para corregir irregularidades, logrando un esmaltado impecable por más de 25 días.',
      imgBefore: 'assets/manicura_before.jpg',
      imgAfter: 'assets/manicura_after.jpg',
      targetService: 'manicura-rusa'
    },
    facial: {
      category: 'Estética Facial & Spa',
      title: 'Limpieza Facial Profunda & Hidratación Glow',
      description: 'Descongestión total de poros mediante espátula ultrasónica, extracción estéril y sellado con mascarilla de ácido hialurónico para devolver la luz natural a la piel.',
      imgBefore: 'assets/facial_before.jpg',
      imgAfter: 'assets/facial_after.jpg',
      targetService: 'facial-profunda'
    }
  };

  // Función para actualizar posición del deslizador
  function updateSliderPosition(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    if (layerBefore) {
      layerBefore.style.clipPath = `polygon(0 0, ${clamped}% 0, ${clamped}% 100%, 0 100%)`;
    }
    if (sliderHandle) {
      sliderHandle.style.left = `${clamped}%`;
      sliderHandle.setAttribute('aria-valuenow', Math.round(clamped));
    }
    if (rangeInput) rangeInput.value = clamped;
  }

  // Soporte táctil y ratón unificado con PointerEvents
  let isDragging = false;

  function calculatePositionFromEvent(e) {
    const rect = sliderWrapper.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const offsetX = clientX - rect.left;
    return (offsetX / rect.width) * 100;
  }

  if (sliderWrapper) {
    sliderWrapper.addEventListener('pointerdown', (e) => {
      isDragging = true;
      sliderWrapper.setPointerCapture(e.pointerId);
      updateSliderPosition(calculatePositionFromEvent(e));
    });

    sliderWrapper.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      updateSliderPosition(calculatePositionFromEvent(e));
    });

    const stopDragging = (e) => {
      if (isDragging) {
        isDragging = false;
        try {
          sliderWrapper.releasePointerCapture(e.pointerId);
        } catch (err) {
          // Ignorar si ya fue liberado
        }
      }
    };

    sliderWrapper.addEventListener('pointerup', stopDragging);
    sliderWrapper.addEventListener('pointercancel', stopDragging);

    // Fallback accesible con teclado o range input
    if (rangeInput) {
      rangeInput.addEventListener('input', (e) => {
        updateSliderPosition(parseFloat(e.target.value));
      });
    }
  }

  // Precacheo y decodificación ultra rápida en memoria de todas las imágenes
  const memoryImageCache = {};
  Object.values(transformationCases).forEach(c => {
    [c.imgBefore, c.imgAfter].forEach(src => {
      if (!memoryImageCache[src]) {
        const img = new Image();
        img.src = src;
        if (img.decode) {
          img.decode().catch(() => {});
        }
        memoryImageCache[src] = img;
      }
    });
  });

  // Cambio de pestañas en la galería
  const imgBefore = document.getElementById('imgBefore');
  const imgAfter = document.getElementById('imgAfter');
  const caseCategory = document.getElementById('caseCategory');
  const caseTitle = document.getElementById('caseTitle');
  const caseDescription = document.getElementById('caseDescription');

  caseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      caseTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const caseKey = tab.dataset.case;
      const data = transformationCases[caseKey];
      if (data) {
        // Asignación instantánea respaldada por caché en memoria
        imgBefore.src = data.imgBefore;
        imgAfter.src = data.imgAfter;
        caseCategory.textContent = data.category;
        caseTitle.textContent = data.title;
        caseDescription.textContent = data.description;
        btnQuieroResultado.dataset.targetService = data.targetService;
        
        // Reset slider al 50%
        updateSliderPosition(50);
      }
    });
  });

  // VINCULACIÓN UX: Botón "Quiero este resultado"
  if (btnQuieroResultado) {
    btnQuieroResultado.addEventListener('click', () => {
      const targetService = btnQuieroResultado.dataset.targetService;
      selectServiceInWizard(targetService, true);
    });
  }

  // ========================================================
  // 4. MAPAS DE DURACIÓN EXACTA & AUXILIARES DE TIEMPO
  // ========================================================

  const serviceDurations = {
    'corte-peinado': 50,
    'colorimetria': 180,
    'tratamientos-capilares': 90,
    'manicura-rusa': 60,
    'unas-acrilicas': 90,
    'pedicura-spa': 60,
    'facial-profunda': 75,
    'tratamientos-antiedad': 80,
    'masajes-relajantes': 60
  };

  const extraDurations = {
    'ampolleta': 15,
    'retiro-acrilico': 30,
    'nail-art': 30,
    'mascarilla-colageno': 20,
    'aromaterapia': 15
  };

  // Convertir minutos desde medianoche a formato HH:MM
  function minutesToTimeStr(totalMin) {
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  // Convertir HH:MM a minutos desde medianoche
  function timeStrToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  }

  // Formato 12 horas con AM/PM
  function format12h(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  }

  // Formatear duración en texto amigable
  function formatDurationText(min) {
    const hours = Math.floor(min / 60);
    const mins = min % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h 00m`;
    return `${mins} min`;
  }

  // ========================================================
  // 5. COTIZADOR Y AGENDA DINÁMICA (UX EN 3 PASOS)
  // ========================================================

  let currentStep = 1;

  const stepIndicators = document.querySelectorAll('.step-indicator');
  const wizardSteps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3')
  };

  const btnNextStep1 = document.getElementById('btnNextStep1');
  const btnNextStep2 = document.getElementById('btnNextStep2');
  const btnBackStep2 = document.getElementById('btnBackStep2');
  const btnBackStep3 = document.getElementById('btnBackStep3');
  const btnConfirmWhatsapp = document.getElementById('btnConfirmWhatsapp');

  // Filtro de chips dentro del paso 1 del wizard
  const wizardChips = document.querySelectorAll('.wizard-chip');
  const treatmentCards = document.querySelectorAll('.treatment-card');

  wizardChips.forEach(chip => {
    chip.addEventListener('click', () => {
      wizardChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;
      treatmentCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Función para cambiar de paso
  function goToStep(stepNumber) {
    currentStep = stepNumber;

    // Actualizar visual de pasos
    Object.keys(wizardSteps).forEach(step => {
      if (wizardSteps[step]) {
        wizardSteps[step].classList.toggle('active', parseInt(step) === currentStep);
      }
    });

    // Actualizar barra indicadora
    stepIndicators.forEach(ind => {
      const stepIdx = parseInt(ind.dataset.stepIndicator);
      ind.classList.toggle('active', stepIdx === currentStep);
      ind.classList.toggle('completed', stepIdx < currentStep);
    });

    // Si entramos al Paso 3, regenerar los horarios para asegurar exactitud
    if (currentStep === 3) {
      renderScheduleSlots();
    }

    // Scroll suave al cotizador para mantener contexto en móvil
    const cotizadorSection = document.getElementById('cotizador');
    if (cotizadorSection && window.innerWidth <= 1024) {
      cotizadorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (btnNextStep1) btnNextStep1.addEventListener('click', () => goToStep(2));
  if (btnNextStep2) btnNextStep2.addEventListener('click', () => goToStep(3));
  if (btnBackStep2) btnBackStep2.addEventListener('click', () => goToStep(1));
  if (btnBackStep3) btnBackStep3.addEventListener('click', () => goToStep(2));

  // Inicializar fecha mínima en el selector
  const bookingDateInput = document.getElementById('bookingDate');
  if (bookingDateInput) {
    const today = new Date();
    // Default a mañana
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');

    const minDateStr = `${yyyy}-${mm}-${dd}`;
    bookingDateInput.min = minDateStr;
    bookingDateInput.value = minDateStr;

    // Cuando el usuario cambia la fecha, actualizar el horario (ej: si es domingo tiene horario especial)
    bookingDateInput.addEventListener('change', () => {
      renderScheduleSlots();
    });
  }

  // ========================================================
  // 6. CÁLCULO EN TIEMPO REAL & GESTIÓN DE HORARIOS DINÁMICOS
  // ========================================================
  const radioServices = document.querySelectorAll('input[name="selectedService"]');
  const checkboxExtras = document.querySelectorAll('input[name="extraAddon"]');
  
  const summaryServiceName = document.getElementById('summaryServiceName');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryExtrasList = document.getElementById('summaryExtrasList');
  const summaryTotal = document.getElementById('summaryTotal');

  const scheduleDurationNote = document.getElementById('scheduleDurationNote');
  const morningSlotsGrid = document.getElementById('morningSlotsGrid');
  const afternoonSlotsGrid = document.getElementById('afternoonSlotsGrid');
  const morningSlotsCount = document.getElementById('morningSlotsCount');
  const afternoonSlotsCount = document.getElementById('afternoonSlotsCount');
  const bannerSlotTime = document.getElementById('bannerSlotTime');
  const bannerSlotRange = document.getElementById('bannerSlotRange');
  const selectedTimeSlotInput = document.getElementById('selectedTimeSlot');
  const selectedTimeEndInput = document.getElementById('selectedTimeEnd');

  function calculateQuote() {
    let total = 0;
    let selectedService = null;
    let totalMinutes = 0;

    // Obtener servicio activo
    radioServices.forEach(radio => {
      if (radio.checked) {
        const val = radio.value;
        const durMin = serviceDurations[val] || 60;
        totalMinutes += durMin;

        selectedService = {
          value: val,
          name: radio.dataset.name,
          price: parseFloat(radio.dataset.price || 0),
          durationMinutes: durMin,
          duration: radio.dataset.duration || `${durMin} min`
        };
        radio.closest('.treatment-card').classList.add('selected');
      } else {
        radio.closest('.treatment-card').classList.remove('selected');
      }
    });

    if (!selectedService) {
      selectedService = {
        value: 'colorimetria',
        name: 'Colorimetría',
        price: 1650,
        durationMinutes: 180,
        duration: '180 min'
      };
      totalMinutes = 180;
    }

    total += selectedService.price;

    // Obtener extras seleccionados
    const activeExtras = [];
    checkboxExtras.forEach(cb => {
      if (cb.checked) {
        const extraPrice = parseFloat(cb.dataset.price || 0);
        const extraMin = extraDurations[cb.value] || 15;
        totalMinutes += extraMin;
        total += extraPrice;

        activeExtras.push({
          value: cb.value,
          name: cb.dataset.name,
          price: extraPrice,
          minutes: extraMin
        });
      }
    });

    // Actualizar resumen
    summaryServiceName.textContent = selectedService.name;
    const durationFormatted = formatDurationText(totalMinutes);
    summaryDuration.textContent = `⏱️ ${durationFormatted}`;

    // Renderizar lista de extras
    summaryExtrasList.innerHTML = '';
    if (activeExtras.length === 0) {
      summaryExtrasList.innerHTML = '<li class="no-extras">Sin extras adicionales</li>';
    } else {
      activeExtras.forEach(ext => {
        const li = document.createElement('li');
        li.innerHTML = `<span>+ ${ext.name}</span><strong>+$${ext.price}</strong>`;
        summaryExtrasList.appendChild(li);
      });
    }

    // Renderizar total con micro-animación de destello
    summaryTotal.textContent = `$${total.toLocaleString('es-MX')} MXN`;
    summaryTotal.classList.remove('price-flash');
    void summaryTotal.offsetWidth; // Forzar reflow para reiniciar animación
    summaryTotal.classList.add('price-flash');

    if (scheduleDurationNote) {
      scheduleDurationNote.textContent = `⏱️ Duración: ${totalMinutes} min (${durationFormatted})`;
    }

    // Actualizar slots con la nueva duración calculada
    renderScheduleSlots(totalMinutes);

    return {
      service: selectedService,
      extras: activeExtras,
      totalMinutes: totalMinutes,
      durationFormatted: durationFormatted,
      total: total
    };
  }

  // ========================================================
  // 7. MOTOR DE HORARIOS Y BLOQUEO POR DURACIÓN
  // ========================================================

  function renderScheduleSlots(overrideDuration) {
    if (!morningSlotsGrid || !afternoonSlotsGrid) return;

    // Obtener duración total actual
    let durationMin = overrideDuration;
    if (!durationMin) {
      let calc = 0;
      radioServices.forEach(r => { if (r.checked) calc += (serviceDurations[r.value] || 60); });
      checkboxExtras.forEach(c => { if (c.checked) calc += (extraDurations[c.value] || 15); });
      durationMin = calc || 180;
    }

    // Horarios del salón: 100% disponibles todos los días (Lunes a Domingo)
    // De 09:00 AM (540 min) a 07:30 PM (1170 min)
    const openingMin = 9 * 60;   // 09:00 AM
    const lastSlotMin = 19 * 60 + 30; // 07:30 PM última franja de inicio

    // Generar franjas cada 30 minutos
    const morningSlots = [];
    const afternoonSlots = [];

    const currentSelectedSlot = selectedTimeSlotInput ? selectedTimeSlotInput.value : '10:00';
    let isCurrentSelectedPresent = false;
    let firstSlot = null;

    let totalMorningCount = 0;
    let totalAfternoonCount = 0;

    for (let m = openingMin; m <= lastSlotMin; m += 30) {
      const timeStr = minutesToTimeStr(m);
      const endMin = m + durationMin;
      const endTimeStr = minutesToTimeStr(endMin);

      const slotObj = {
        timeStr,
        endTimeStr,
        startMin: m,
        endMin: endMin,
        status: 'available',
        tag: 'Disponible',
        isMorning: m < (14 * 60)
      };

      if (!firstSlot) firstSlot = slotObj;
      if (timeStr === currentSelectedSlot) isCurrentSelectedPresent = true;

      if (slotObj.isMorning) {
        totalMorningCount++;
        morningSlots.push(slotObj);
      } else {
        totalAfternoonCount++;
        afternoonSlots.push(slotObj);
      }
    }

    // Mantener horario seleccionado o fallback al primero
    let activeSlotToHighlight = isCurrentSelectedPresent ? currentSelectedSlot : (firstSlot ? firstSlot.timeStr : '10:00');

    // Renderizar mañana (09:00 - 13:30)
    morningSlotsGrid.innerHTML = '';
    morningSlots.forEach(slot => {
      morningSlotsGrid.appendChild(createSlotElement(slot, activeSlotToHighlight, durationMin));
    });
    if (morningSlotsCount) {
      morningSlotsCount.textContent = `${totalMorningCount} disponibles`;
    }

    // Renderizar tarde (14:00 - 19:30)
    afternoonSlotsGrid.innerHTML = '';
    afternoonSlots.forEach(slot => {
      afternoonSlotsGrid.appendChild(createSlotElement(slot, activeSlotToHighlight, durationMin));
    });
    if (afternoonSlotsCount) {
      afternoonSlotsCount.textContent = `${totalAfternoonCount} disponibles`;
    }

    // Actualizar banner de horario seleccionado
    const chosenSlot = [...morningSlots, ...afternoonSlots].find(s => s.timeStr === activeSlotToHighlight) || firstSlot;
    if (chosenSlot) {
      if (selectedTimeSlotInput) selectedTimeSlotInput.value = chosenSlot.timeStr;
      if (selectedTimeEndInput) selectedTimeEndInput.value = chosenSlot.endTimeStr;
      updateSlotBanner(chosenSlot, durationMin);
    }
  }

  // Crear elemento botón de slot (100% elegible y habilitado para cualquier servicio)
  function createSlotElement(slot, activeSlotToHighlight, durationMin) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-pill available';
    btn.dataset.time = slot.timeStr;
    btn.dataset.end = slot.endTimeStr;

    if (slot.timeStr === activeSlotToHighlight) {
      btn.classList.add('selected');
    }

    btn.innerHTML = `
      <span class="slot-time-main">${format12h(slot.timeStr)}</span>
      <span class="slot-time-sub">Hasta ${format12h(slot.endTimeStr)}</span>
    `;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('selected'));
      btn.classList.add('selected');

      if (selectedTimeSlotInput) selectedTimeSlotInput.value = slot.timeStr;
      if (selectedTimeEndInput) selectedTimeEndInput.value = slot.endTimeStr;

      updateSlotBanner(slot, durationMin);
    });

    return btn;
  }

  // Actualizar banner visual con horario y turno
  function updateSlotBanner(slot, durationMin) {
    if (!bannerSlotTime || !bannerSlotRange) return;

    const start12 = format12h(slot.timeStr);
    const end12 = format12h(slot.endTimeStr);
    const shift = slot.startMin < (14 * 60) ? 'Turno Mañana' : 'Turno Tarde';
    const durText = formatDurationText(durationMin);

    bannerSlotTime.textContent = `Cita seleccionada: ${start12} (${shift})`;
    bannerSlotRange.textContent = `Horario programado: ${start12} a ${end12} (${durText}) • 100% Disponible con confirmación inmediata.`;
  }

  // Escuchar cambios en selecciones
  radioServices.forEach(radio => radio.addEventListener('change', calculateQuote));
  checkboxExtras.forEach(cb => cb.addEventListener('change', calculateQuote));

  // Función para seleccionar un servicio en el wizard desde cualquier lugar (Galería o Catálogo)
  function selectServiceInWizard(serviceValue, scrollToCotizador = false) {
    const targetRadio = document.querySelector(`input[name="selectedService"][value="${serviceValue}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
      // Mostrar la tarjeta si estaba filtrada
      const parentCard = targetRadio.closest('.treatment-card');
      if (parentCard) parentCard.style.display = 'flex';
      
      calculateQuote();
      goToStep(1);

      if (scrollToCotizador) {
        const cotizadorEl = document.getElementById('cotizador');
        if (cotizadorEl) {
          cotizadorEl.scrollIntoView({ behavior: 'smooth' });
          // Efecto de pulso en la tarjeta seleccionada
          parentCard.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
          parentCard.style.boxShadow = '0 0 20px rgba(236, 72, 153, 0.4)';
          setTimeout(() => {
            parentCard.style.boxShadow = '';
          }, 1800);
        }
      }
    }
  }

  // ========================================================
  // 8. ACCIÓN OPERATIVA: CONFIRMAR RESERVA POR WHATSAPP
  // ========================================================
  if (btnConfirmWhatsapp) {
    btnConfirmWhatsapp.addEventListener('click', (e) => {
      e.preventDefault();

      const quote = calculateQuote();
      const clientName = document.getElementById('clientName')?.value.trim();
      const clientPhone = document.getElementById('clientPhone')?.value.trim();
      const bookingDate = document.getElementById('bookingDate')?.value;
      const specialist = document.getElementById('specialist')?.value;

      // Horario seleccionado
      const slotStart = selectedTimeSlotInput?.value || '10:00';
      const slotEnd = selectedTimeEndInput?.value || '13:00';
      const slotStart12 = format12h(slotStart);
      const slotEnd12 = format12h(slotEnd);
      const shiftType = timeStrToMinutes(slotStart) < (14 * 60) ? 'Turno Mañana' : 'Turno Tarde';

      // Si falta nombre o fecha, llevar al Paso 3 para completar
      if (!clientName || !bookingDate) {
        goToStep(3);
        if (!clientName) {
          const nameInput = document.getElementById('clientName');
          nameInput.focus();
          nameInput.style.borderColor = 'var(--color-brand)';
          setTimeout(() => nameInput.style.borderColor = '', 2000);
        }
        return;
      }

      // Formatear fecha a legible en español
      let formattedDate = bookingDate;
      try {
        const parts = bookingDate.split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          formattedDate = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
      } catch (err) {
        formattedDate = bookingDate;
      }

      // Construcción del mensaje estructurado para WhatsApp
      let msg = `✨ *SOLICITUD DE CITA - AURA BEAUTY* ✨\n`;
      msg += `─────────────────────────\n`;
      msg += `👤 *Cliente:* ${clientName}\n`;
      if (clientPhone) msg += `📱 *Teléfono:* ${clientPhone}\n`;
      msg += `📅 *Fecha solicitada:* ${formattedDate}\n`;
      msg += `⏰ *Horario Reservado:* ${slotStart12} a ${slotEnd12} (${shiftType})\n`;
      msg += `💇‍♀️ *Especialista:* ${specialist}\n`;
      msg += `─────────────────────────\n`;
      msg += `💆‍♀️ *Servicio Principal:* ${quote.service.name} ($${quote.service.price} MXN)\n`;
      
      if (quote.extras.length > 0) {
        msg += `✨ *Complementos:*\n`;
        quote.extras.forEach(ext => {
          msg += `   • ${ext.name} (+$${ext.price} MXN / +${ext.minutes}m)\n`;
        });
      } else {
        msg += `✨ *Complementos:* Ninguno\n`;
      }

      msg += `─────────────────────────\n`;
      msg += `⏱️ *Duración total de sesión:* ${quote.durationFormatted} (${quote.totalMinutes} min)\n`;
      msg += `💰 *Inversión Total Estimada:* $${quote.total.toLocaleString('es-MX')} MXN\n`;
      msg += `─────────────────────────\n`;
      msg += `Hola Aura Beauty, me gustaría confirmar disponibilidad para este horario y servicio. ¡Muchas gracias!`;

      // Enlace oficial de WhatsApp
      const whatsappPhone = '5215500000000'; // Número oficial de Aura Beauty
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`;

      // Abrir WhatsApp en nueva pestaña
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ========================================================
  // 9. SISTEMA DE ANIMACIONES MULTIDIRECCIONALES & SCROLL REVEAL
  // ========================================================
  function initLuxuryAnimations() {
    // 1. Asignar clases de revelado con direcciones variadas según la zona del sitio:
    
    // Hero: Entrada lateral cruzada (Texto desde la izquierda, imagen desde la derecha)
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.classList.add('reveal-fade-left');

    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      heroVisual.classList.add('reveal-fade-right');
      heroVisual.style.transitionDelay = '0.15s';
    }

    document.querySelectorAll('.trust-item').forEach((item, idx) => {
      item.classList.add('reveal-scale-pop');
      item.style.transitionDelay = `${0.2 + (idx * 0.12)}s`;
    });

    // Encabezados de sección: Descenso suave y distinguido desde arriba
    document.querySelectorAll('.section-header').forEach(header => {
      header.classList.add('reveal-fade-down');
    });

    // Filtros y pestañas: Efecto pop elástico centrado
    document.querySelectorAll('.filter-tab, .case-tab').forEach((tab, idx) => {
      tab.classList.add('reveal-scale-pop');
      tab.style.transitionDelay = `${idx * 0.08}s`;
    });

    // Tarjetas de servicios: Entrada en abanico multidireccional (Izquierda, Centro-Zoom, Derecha)
    document.querySelectorAll('.service-card').forEach((card, idx) => {
      const colPattern = idx % 3;
      if (colPattern === 0) {
        card.classList.add('reveal-fan-left'); // Entra desde la izquierda con inclinación
      } else if (colPattern === 1) {
        card.classList.add('reveal-zoom-in');  // Entra con zoom y desenfoque
      } else {
        card.classList.add('reveal-fan-right'); // Entra desde la derecha con inclinación
      }
      card.style.transitionDelay = `${(idx % 3) * 0.12}s`;
    });

    // Galería Antes/Después: Efecto Zoom-In focalizado para resaltar la transformación
    const compCard = document.querySelector('.comparison-card');
    if (compCard) compCard.classList.add('reveal-zoom-in');

    const btnCaseResult = document.getElementById('btnQuieroResultado');
    if (btnCaseResult) btnCaseResult.classList.add('reveal-scale-pop');

    // Cotizador: Entrada cruzada (Formulario desde la izquierda, Resumen flotante desde la derecha)
    const wizardCard = document.querySelector('.wizard-card');
    if (wizardCard) wizardCard.classList.add('reveal-fade-left');

    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard) {
      summaryCard.classList.add('reveal-fade-right');
      summaryCard.style.transitionDelay = '0.18s';
    }

    // Experiencia: Texto a la izquierda, elementos a la derecha con rotación
    const expContent = document.querySelector('.exp-content');
    if (expContent) expContent.classList.add('reveal-fade-left');

    document.querySelectorAll('.exp-pill').forEach((pill, idx) => {
      pill.classList.add('reveal-fade-left');
      pill.style.transitionDelay = `${0.1 + (idx * 0.12)}s`;
    });

    const expMainImg = document.querySelector('.stack-img.main');
    if (expMainImg) expMainImg.classList.add('reveal-fade-right');

    const expSecImg = document.querySelector('.stack-img.secondary');
    if (expSecImg) {
      expSecImg.classList.add('reveal-fan-right');
      expSecImg.style.transitionDelay = '0.2s';
    }

    // Contacto: Columnas cruzadas
    const contactInfo = document.querySelector('.contact-info-col');
    if (contactInfo) contactInfo.classList.add('reveal-fade-left');

    const contactAction = document.querySelector('.contact-action-col');
    if (contactAction) {
      contactAction.classList.add('reveal-fade-right');
      contactAction.style.transitionDelay = '0.15s';
    }

    // 2. Observer de intersección para activar las animaciones al hacer scroll
    const animSelector = '.reveal-on-scroll, .reveal-fade-up, .reveal-fade-down, .reveal-fade-left, .reveal-fade-right, .reveal-zoom-in, .reveal-fan-left, .reveal-fan-right, .reveal-scale-pop';
    let hasSliderPeeked = false;

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
      };

      const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');

            // Animar divisor dorado
            const divider = entry.target.querySelector('.title-divider-gold');
            if (divider) divider.classList.add('reveal-active');

            // 3. Efecto "Peek" en el deslizador de transformaciones al entrar en pantalla
            if (entry.target.classList.contains('comparison-card') && !hasSliderPeeked) {
              hasSliderPeeked = true;
              playSliderPeekAnimation();
            }

            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll(animSelector).forEach(el => {
        revealObserver.observe(el);
      });
    } else {
      document.querySelectorAll(animSelector).forEach(el => {
        el.classList.add('revealed');
      });
    }

    // Animación de demostración interactiva del slider (Peek)
    function playSliderPeekAnimation() {
      if (!layerBefore || !sliderHandle) return;

      const duration = 1400; // ms
      const startTime = performance.now();

      function animatePeek(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Movimiento de vaivén suave: 50% -> 38% -> 60% -> 50%
        const offset = Math.sin(progress * Math.PI * 2) * 12 * (1 - progress);
        const currentPos = 50 + offset;

        updateSliderPosition(currentPos);

        if (progress < 1) {
          requestAnimationFrame(animatePeek);
        } else {
          updateSliderPosition(50);
        }
      }

      // Iniciar tras 350ms
      setTimeout(() => {
        requestAnimationFrame(animatePeek);
      }, 350);
    }
  }

  // Inicializar cálculo, horarios iniciales y animaciones
  calculateQuote();
  initLuxuryAnimations();

});
