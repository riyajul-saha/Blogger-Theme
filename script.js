document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar Scroll Effect & Reading Progress ---
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('reading-progress');

  const handleScroll = () => {
    // Navbar background
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Reading progress (mostly for blog post)
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (totalScroll / windowHeight) * 100;

    if (progressBar && windowHeight > 0) {
      progressBar.style.width = `${scrollPercent}%`;
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Initial check
  handleScroll();

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

  if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.toggle('open');
      // Toggle icon
      if (mobileMenuOverlay.classList.contains('open')) {
        mobileMenuBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      } else {
        mobileMenuBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking a link
    const mobileLinks = mobileMenuOverlay.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('open');
        mobileMenuBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
        document.body.style.overflow = '';
      });
    });
  }

  // --- Intersection Observer for Animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.hasAttribute('data-once')) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // --- BlogPost Table of Contents Active State ---
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('.article-body h2, .article-body h3, .article-body p[id]');

  if (tocLinks.length > 0 && headings.length > 0) {
    const headingObserver = new IntersectionObserver((entries) => {
      let visibleHeadings = [];
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleHeadings.push(entry.target.id);
        }
      });

      if (visibleHeadings.length > 0) {
        const firstVisible = visibleHeadings[0];
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${firstVisible}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, { rootMargin: "-20% 0px -60% 0px" });

    headings.forEach(heading => {
      if (heading.id) headingObserver.observe(heading);
    });
  }

  // --- Dark / Light Mode Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlEl = document.documentElement;

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    htmlEl.classList.add('light-mode');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      htmlEl.classList.toggle('light-mode');
      const isLight = htmlEl.classList.contains('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // --- Back to Top Button ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.3) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', toggleBackToTop);
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Focus Mode Toggle ---
  const focusModeBtn = document.getElementById('focus-mode-btn');
  if (focusModeBtn) {
    focusModeBtn.addEventListener('click', () => {
      document.body.classList.toggle('focus-mode');
      focusModeBtn.classList.toggle('active');
    });
  }

  // --- Phase 3: Reading Time Calculator ---
  const articleBody = document.querySelector('.article-body');
  const readTimeEls = document.querySelectorAll('.read-time');
  if (articleBody && readTimeEls.length > 0) {
    const text = articleBody.innerText || articleBody.textContent;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 230));
    readTimeEls.forEach(el => {
      // Only update if it's a simple text-based read time (not ones with SVG icons inside)
      if (!el.querySelector('svg')) {
        el.textContent = `${minutes} MIN READ`;
      }
    });
  }

  // --- Phase 3: Copy Code Button ---
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-block');
      if (!codeBlock) return;
      const code = codeBlock.querySelector('pre code, pre');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent);
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = '#10B981';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
        }, 2000);
      } catch (e) {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy code'; }, 1500);
      }
    });
  });

  // --- Phase 3: Web Share / Share Button ---
  document.querySelectorAll('.action-btn').forEach(btn => {
    // Attach to the share icon button (the one with the share SVG)
    const svg = btn.querySelector('svg');
    if (!svg) return;
    const paths = svg.querySelectorAll('circle, line');
    // Share icon has 3 circles and 2 lines
    if (paths.length === 5) {
      btn.addEventListener('click', async () => {
        const title = document.querySelector('.article-title, h1')?.textContent?.trim() || document.title;
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch (e) { /* user cancelled */ }
        } else {
          // Fallback: copy link
          try {
            await navigator.clipboard.writeText(url);
            btn.style.color = '#10B981';
            setTimeout(() => { btn.style.color = ''; }, 2000);
          } catch (e) { }
        }
      });
    }
  });

  // --- Phase 3: Reaction Button Toggle ---
  document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
      const countEl = btn.querySelector('span');
      if (countEl) {
        let count = parseInt(countEl.textContent) || 0;
        countEl.textContent = btn.classList.contains('active') ? count + 1 : Math.max(0, count - 1);
      }
    });
  });
});
