import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector('.main-content');
      const windowScroll = window.scrollY;
      const mainContentScroll = mainContent ? mainContent.scrollTop : 0;

      if (windowScroll > 300 || mainContentScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #003865 0%, #002747 100%)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 56, 101, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9999,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.08)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 166, 81, 0.45)';
        e.currentTarget.style.background = 'linear-gradient(135deg, #00a651 0%, #008742 100%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 56, 101, 0.35)';
        e.currentTarget.style.background = 'linear-gradient(135deg, #003865 0%, #002747 100%)';
      }}
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
