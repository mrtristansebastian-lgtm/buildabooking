import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { getEditorPreviewFrame } from '../../../config/appConfig';
import { getEditorRoomId } from '../config/editorRoomScenes';

const isInitialMobileDevice = () => (
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)')?.matches
);

const isInitialPortraitMobile = () => (
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px) and (orientation: portrait)')?.matches
);

export function useEditorRuntime({ activeTab, setEditorTab, sidebarCollapsed }) {
  const [studioModal, setStudioModal] = useState(null);
  const [device, setDevice] = useState(() => (isInitialMobileDevice() ? 'mobile' : 'desktop'));
  const [previewStep, setPreviewStep] = useState('select');
  const [previewKey, setPreviewKey] = useState(0);
  const [scale, setScale] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isMobileRuntime, setIsMobileRuntime] = useState(isInitialMobileDevice);
  const [isPortraitMobileRuntime, setIsPortraitMobileRuntime] = useState(isInitialPortraitMobile);
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [roomNavOffset, setRoomNavOffset] = useState({ x: 0, y: 0 });

  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const previewScrollRef = useRef(null);
  const scaleRef = useRef(1);
  const compactViewportRef = useRef(false);
  const roomNavDragRef = useRef(null);

  const shouldMountPreview = activeTab === 'editor';
  const isMobileEditorRuntime = isMobileRuntime || isCompactViewport;
  const frame = getEditorPreviewFrame(device, isCompactViewport);
  const frameClass = device === 'desktop'
    ? (isCompactViewport ? 'rounded-lg border-[12px]' : 'rounded-lg border-[22px]')
    : (isCompactViewport ? 'rounded-[3rem] border-[12px]' : 'rounded-[5rem] md:rounded-[5.5rem] border-[16px] md:border-[18px]');
  const showPortraitDesktopPrompt = isPortraitMobileRuntime && device === 'desktop';

  useEffect(() => () => roomNavDragRef.current?.cleanup?.(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const portraitQuery = window.matchMedia('(max-width: 767px) and (orientation: portrait)');
    const updateMobileRuntime = () => {
      setIsMobileRuntime(current => current === mobileQuery.matches ? current : mobileQuery.matches);
      setIsPortraitMobileRuntime(current => current === portraitQuery.matches ? current : portraitQuery.matches);
    };

    updateMobileRuntime();
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', updateMobileRuntime);
      portraitQuery.addEventListener('change', updateMobileRuntime);
    } else {
      mobileQuery.addListener(updateMobileRuntime);
      portraitQuery.addListener(updateMobileRuntime);
    }
    window.addEventListener('orientationchange', updateMobileRuntime);
    window.addEventListener('resize', updateMobileRuntime);
    return () => {
      if (mobileQuery.removeEventListener) {
        mobileQuery.removeEventListener('change', updateMobileRuntime);
        portraitQuery.removeEventListener('change', updateMobileRuntime);
      } else {
        mobileQuery.removeListener(updateMobileRuntime);
        portraitQuery.removeListener(updateMobileRuntime);
      }
      window.removeEventListener('orientationchange', updateMobileRuntime);
      window.removeEventListener('resize', updateMobileRuntime);
    };
  }, []);

  useLayoutEffect(() => {
    if (activeTab !== 'editor' || !shouldMountPreview) return undefined;

    let frameRequest = 0;
    const isMobileEditorViewport = (container = containerRef.current) => {
      const rect = container?.getBoundingClientRect();
      const constrainedStage = rect ? rect.height < 650 : false;
      const mobileLandscape = window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(orientation: landscape)').matches;
      return (
        window.innerWidth < 768 ||
        window.innerHeight <= 560 ||
        constrainedStage ||
        mobileLandscape
      );
    };
    const updateScale = () => {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = window.requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const compact = activeTab === 'editor' && isMobileEditorViewport(containerRef.current);
        if (compactViewportRef.current !== compact) {
          compactViewportRef.current = compact;
          setIsCompactViewport(compact);
        }
        const shortLandscapeEditor = compact
          && device === 'desktop'
          && window.matchMedia('(orientation: landscape)').matches
          && window.innerHeight <= 700
          && window.innerWidth <= 1400;
        const baseFrame = getEditorPreviewFrame(device, compact);
        const nextFrame = shortLandscapeEditor
          ? {
              ...baseFrame,
              maxScale: Math.min(baseFrame.maxScale, 0.72),
              paddingX: Math.max(baseFrame.paddingX, 120),
              paddingY: Math.max(baseFrame.paddingY, 190)
            }
          : baseFrame;
        const collapsedNavGain = compact && mobileNavCollapsed ? 24 : 0;
        const collapsedPanelGain = collapsed ? (compact ? 16 : 28) : 0;
        const paddingX = Math.max(12, nextFrame.paddingX - collapsedPanelGain);
        const paddingY = Math.max(58, nextFrame.paddingY - collapsedNavGain);
        const roomPanelReserve = studioModal && !compact && window.innerWidth > 900
          ? Math.min(Math.max(window.innerWidth * 0.32, 352), 448) + 54
          : 0;
        const availablePreviewWidth = Math.max(260, rect.width - roomPanelReserve);
        const nextScale = Math.min(
          (availablePreviewWidth - paddingX) / nextFrame.width,
          (rect.height - paddingY) / nextFrame.height,
          nextFrame.maxScale
        );
        const boundedScale = Math.max(nextFrame.minScale, nextScale);
        if (Math.abs(scaleRef.current - boundedScale) > 0.002) {
          scaleRef.current = boundedScale;
          setScale(boundedScale);
        }
      });
    };

    updateScale();
    const t1 = setTimeout(updateScale, 50);
    const t2 = setTimeout(updateScale, 400);
    const t3 = setTimeout(updateScale, 800);
    const t4 = setTimeout(updateScale, 1200);
    const resizeObserver = typeof ResizeObserver !== 'undefined' && containerRef.current
      ? new ResizeObserver(updateScale)
      : null;
    if (resizeObserver && containerRef.current) resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateScale);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.cancelAnimationFrame(frameRequest);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [activeTab, collapsed, device, mobileNavCollapsed, shouldMountPreview, sidebarCollapsed, studioModal]);

  useEffect(() => {
    if (activeTab !== 'editor') return;
    let lastLandscape = window.matchMedia('(orientation: landscape)').matches;
    let settleTimer = 0;

    const resetMobileEditorPosition = () => {
      setCollapsed(false);
      setMobileNavCollapsed(false);
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
        containerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        contentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    };

    const handleOrientationSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const nextLandscape = window.matchMedia('(orientation: landscape)').matches;
        if (nextLandscape === lastLandscape) return;
        lastLandscape = nextLandscape;
        resetMobileEditorPosition();
      }, 180);
    };

    window.addEventListener('orientationchange', handleOrientationSettle);
    window.addEventListener('resize', handleOrientationSettle);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('orientationchange', handleOrientationSettle);
      window.removeEventListener('resize', handleOrientationSettle);
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'editor') {
      setMobileNavCollapsed(false);
    }
  }, [activeTab]);

  useEffect(() => () => {
    try {
      audioRef.current?.close?.();
    } catch {
      // Browsers may report already-closed AudioContexts during hot reload.
    }
  }, []);

  const playStudioSound = (type = 'open') => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      const context = audioRef.current || new AudioContext();
      audioRef.current = context;
      if (context.state === 'suspended') context.resume();
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(type === 'complete' ? 0.06 : 0.035, now + 0.018);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      master.connect(context.destination);

      const playTone = (frequency, offset, duration, wave = 'sine', endFrequency = frequency) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(frequency, now + offset);
        osc.frequency.exponentialRampToValueAtTime(endFrequency, now + offset + duration);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.42, now + offset + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + offset);
        osc.stop(now + offset + duration + 0.04);
      };

      if (type === 'complete') {
        playTone(392, 0, 0.18, 'sine', 588);
        playTone(588, 0.08, 0.2, 'triangle', 880);
        playTone(1176, 0.18, 0.16, 'sine', 1568);
      } else if (type === 'step') {
        playTone(540, 0, 0.11, 'triangle', 760);
        playTone(960, 0.05, 0.1, 'sine', 1120);
      } else {
        playTone(720, 0, 0.12, 'triangle', 520);
      }
    } catch (error) {
      console.warn('Editor studio sound unavailable', error);
    }
  };

  const playMobileNavSound = () => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      const context = audioRef.current || new AudioContext();
      audioRef.current = context;
      if (context.state === 'suspended') context.resume();
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.052, now + 0.015);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      master.connect(context.destination);
      const playTone = (frequency, offset, duration, wave = 'triangle', endFrequency = frequency) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(frequency, now + offset);
        osc.frequency.exponentialRampToValueAtTime(endFrequency, now + offset + duration);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.36, now + offset + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + offset);
        osc.stop(now + offset + duration + 0.03);
      };
      playTone(440, 0, 0.12, 'triangle', 660);
      playTone(880, 0.045, 0.14, 'sine', 1320);
      playTone(1760, 0.11, 0.1, 'sine', 2349);
    } catch (error) {
      console.warn('Mobile nav sound unavailable', error);
    }
  };

  const openRoom = (roomId) => {
    const normalizedRoomId = getEditorRoomId(roomId);
    setStudioModal(normalizedRoomId);
    setEditorTab(normalizedRoomId);
    playStudioSound('step');
  };

  const startRoomNavDrag = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    roomNavDragRef.current?.cleanup?.();
    const drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: roomNavOffset.x,
      originY: roomNavOffset.y
    };
    const moveDrag = (moveEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      moveEvent.preventDefault();
      const nextX = drag.originX + moveEvent.clientX - drag.startX;
      const nextY = drag.originY + moveEvent.clientY - drag.startY;
      setRoomNavOffset({
        x: Math.max(-260, Math.min(260, nextX)),
        y: Math.max(-280, Math.min(280, nextY))
      });
    };
    const endDrag = (endEvent) => {
      if (endEvent?.pointerId !== undefined && endEvent.pointerId !== drag.pointerId) return;
      window.removeEventListener('pointermove', moveDrag);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      roomNavDragRef.current = null;
    };
    drag.cleanup = endDrag;
    roomNavDragRef.current = drag;
    window.addEventListener('pointermove', moveDrag, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveRoomNavDrag = (event) => {
    const drag = roomNavDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const nextX = drag.originX + event.clientX - drag.startX;
    const nextY = drag.originY + event.clientY - drag.startY;
    setRoomNavOffset({
      x: Math.max(-260, Math.min(260, nextX)),
      y: Math.max(-280, Math.min(280, nextY))
    });
  };

  const endRoomNavDrag = (event) => {
    const drag = roomNavDragRef.current;
    if (drag?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      drag.cleanup?.(event);
    }
  };

  const resetPreviewScroll = () => {
    requestAnimationFrame(() => {
      const scroller = previewScrollRef.current;
      if (scroller) {
        scroller.scrollTop = 0;
        scroller.scrollLeft = 0;
      }
    });
  };

  const handleDeviceChange = async (nextDevice) => {
    setDevice(nextDevice);
    if (nextDevice !== 'desktop' || !isPortraitMobileRuntime) return;
    setStudioModal(null);
    try {
      await window.screen?.orientation?.lock?.('landscape');
    } catch {
      // The rotate prompt in the preview handles locked-orientation browsers.
    }
  };

  return {
    collapsed,
    containerRef,
    contentRef,
    device,
    endRoomNavDrag,
    frame,
    frameClass,
    handleDeviceChange,
    isCompactViewport,
    isMobileEditorRuntime,
    isMobileRuntime,
    isPortraitMobileRuntime,
    mobileNavCollapsed,
    moveRoomNavDrag,
    openRoom,
    playMobileNavSound,
    previewKey,
    previewStep,
    previewScrollRef,
    resetPreviewScroll,
    roomNavOffset,
    scale,
    setCollapsed,
    setMobileNavCollapsed,
    setPreviewKey,
    setPreviewStep,
    setRoomNavOffset,
    setStudioModal,
    shouldMountPreview,
    showPortraitDesktopPrompt,
    startRoomNavDrag,
    studioModal
  };
}
