document.addEventListener('DOMContentLoaded', function() {
  // Form submission handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Get form data
          const formData = {
              name: document.getElementById('name').value,
              email: document.getElementById('email').value,
              subject: document.getElementById('subject').value,
              message: document.getElementById('message').value
          };

          // Here you would typically send the data to a server
          // For now, we'll just show a success message
          alert('Thank you for your message! We will get back to you soon.');
          contactForm.reset();
      });
  }

  // Service card hover effects
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-10px)';
          this.style.transition = 'transform 0.3s ease';
      });

      card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
      });
  });

  // Pricing card hover effects
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
      if (!card.classList.contains('featured')) {
          card.addEventListener('mouseenter', function() {
              this.style.transform = 'scale(1.05)';
              this.style.transition = 'transform 0.3s ease';
          });

          card.addEventListener('mouseleave', function() {
              this.style.transform = 'scale(1)';
          });
      }
  });

  // Mobile menu toggle
  const menuBtn = document.querySelector('.nav-buttons');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', function() {
          navLinks.classList.toggle('show');
      });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });
});