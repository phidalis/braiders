    // Mobile menu toggle removed (secondary nav used instead)

    // Secondary nav toggle (mobile)
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        const links = document.getElementById('secondaryNavLinks');
        const icon = document.getElementById('navToggleIcon');
        links.classList.toggle('open');
        icon.className = links.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
      });
    }

    const pageSections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.secondary-nav-inner a[data-section]');

    // Strict whitelist: maps each page name to the exact CSS classes allowed to show on it.
    // A section ONLY shows if (a) its page-* class matches AND (b) it is in this whitelist.
    // Anything not listed here is always hidden regardless of its class.
    const PAGE_MAP = {
      home:        ['page-home'],
      about:       ['page-about'],
      appointment: ['page-appointment'],
      services:    ['page-services'],
      customer:    ['page-customer'],
      contact:     ['page-contact'],
      policies:    ['page-policies'],
      reviews:     ['page-reviews'],
    };

    const showSection = (sectionName) => {
      const allowed = PAGE_MAP[sectionName] || [];
      pageSections.forEach((section) => {
        // Show only if the section carries exactly one of the allowed page classes
        const shouldShow = allowed.some(cls => section.classList.contains(cls));
        if (shouldShow) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });

      navLinks.forEach((link) => {
        if (link.dataset.section === sectionName) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      const mobileLinks = document.getElementById('secondaryNavLinks');
      if (mobileLinks.classList.contains('open')) {
        mobileLinks.classList.remove('open');
        document.getElementById('navToggleIcon').className = 'fas fa-bars';
      }
    };

    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const sectionName = link.dataset.section;
        if (sectionName) {
          showSection(sectionName);
        }
      });
    });

    showSection('home');

    // 3D Carousel
    (function(){
      const container = document.querySelector('.crl');
      const existingEl = container.querySelector('.carousel-placeholder');
      if (existingEl) container.innerHTML = '';

      const styles = [
        { bg: 'linear-gradient(135deg,#9B1FBE,#E8447A)', label: 'Knotless Box Braids' },
        { bg: 'linear-gradient(135deg,#1A0028,#9B1FBE)', label: 'Cornrows' },
        { bg: 'linear-gradient(135deg,#E8447A,#D4A843)', label: 'Boho Knotless' },
        { bg: 'linear-gradient(135deg,#D4A843,#9B1FBE)', label: 'Passion Twists' },
        { bg: 'linear-gradient(135deg,#2d0050,#E8447A)', label: 'Senegalese Twists' },
        { bg: 'linear-gradient(135deg,#0d1b2a,#9B1FBE)', label: 'Micro Braids' },
        { bg: 'linear-gradient(135deg,#9B1FBE,#D4A843)', label: 'Spring Twists' },
        { bg: 'linear-gradient(135deg,#E8447A,#9B1FBE)', label: 'Triangle Braids' },
      ];

      const imgs = styles.map(s => {
        const el = document.createElement('div');
        el.style.cssText = `width:200px;height:260px;position:absolute;border-radius:12px;top:50%;left:50%;margin:-130px 0 0 -100px;background:${s.bg};display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:600;text-align:center;padding:16px;border:2px solid rgba(255,255,255,0.2);box-shadow:0 0 30px rgba(155,31,190,0.3);`;
        el.textContent = s.label;
        container.appendChild(el);
        return el;
      });

      const count = imgs.length;
      const angle = (2 * Math.PI) / count;
      const radius = 220;
      let speed = 0.005, tilt = 20, scale = 1.2, t = 0;

      document.getElementById('rSpd').addEventListener('input', e => speed = parseFloat(e.target.value));
      document.getElementById('tAng').addEventListener('input', e => tilt = parseFloat(e.target.value));
      document.getElementById('sFac').addEventListener('input', e => scale = parseFloat(e.target.value));

      function animate() {
        t += speed;
        container.style.transform = `rotateY(${t}rad)`;
        imgs.forEach((el, i) => {
          const phase = (t + i * angle) % (2 * Math.PI);
          const s = 1 + (scale - 1) * Math.cos(phase);
          const rx = tilt * Math.sin(phase);
          el.style.transform = `
            translateX(${radius * Math.cos(angle * i)}px)
            translateZ(${radius * Math.sin(angle * i)}px)
            rotateY(${i * (360 / count)}deg)
            rotateX(${rx}deg)
            scale(${s})
          `;
        });
        requestAnimationFrame(animate);
      }
      animate();
    })();

    // Review form — saves to Firestore (pending admin approval)
    window.submitReview = async function(e) {
      e.preventDefault();
      const form   = e.target;
      const btn    = form.querySelector('button[type=submit]');
      const succ   = document.getElementById('formSuccess');
      const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value || 0);
      if (!rating) { alert('Please select a star rating.'); return; }
      btn.disabled = true;
      btn.textContent = 'Submitting…';
      try {
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const reviewDb = getFirestore(app);
        await addDoc(collection(reviewDb, 'reviews'), {
          rating,
          title:    document.getElementById('rTitle').value.trim(),
          review:   document.getElementById('rContent').value.trim(),
          name:     document.getElementById('rName').value.trim(),
          email:    document.getElementById('rEmail').value.trim(),
          approved: false,
          featured: false,
          createdAt: serverTimestamp(),
        });
        form.style.display = 'none';
        if (succ) succ.style.display = 'block';
      } catch(err) {
        btn.disabled = false;
        btn.textContent = 'Submit Review';
        alert('Submission failed — please try again.');
      }
    };
  
