'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'expo.out', duration: 1.1 });

// Lenis instance shared with the menu, transitions and anchor scrolling.
export const scroller: { lenis: Lenis | null } = { lenis: null };

export { gsap, ScrollTrigger, SplitText };
