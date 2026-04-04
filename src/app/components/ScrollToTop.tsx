import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setIsVisible(false);
  }, [location.pathname]);

  const checkScroll = useCallback(() => {
    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
    setIsVisible(scrollTop > 200);
  }, []);

  useEffect(() => {
    checkScroll();
    
    const handleScroll = () => {
      requestAnimationFrame(checkScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    
    const interval = setInterval(checkScroll, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      clearInterval(interval);
    };
  }, [checkScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          style={{ position: 'fixed', bottom: '100px', right: '24px', zIndex: 99999 }}
          className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-2xl shadow-purple-500/50 transition-colors border-2 border-purple-400"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
