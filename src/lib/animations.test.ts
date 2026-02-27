import { describe, it, expect } from 'vitest'

import {
  slideUp,
  fadeIn,
  pageTransition,
  slideDown,
  slideInFromLeft,
  slideInFromRight,
  scaleIn,
  bounceIn,
  modalBackdrop,
  modalContent,
  cardHover,
  buttonTap,
  pulse,
  spinner,
  staggerContainer,
  staggerItem,
  staggerContainerFast,
  staggerContainerSlow,
  staggerContainerReverse,
  SPRING_CONFIGS,
} from '@/lib/animations'

describe('entrance animations', () => {
  it.each([
    ['slideUp', slideUp],
    ['fadeIn', fadeIn],
    ['pageTransition', pageTransition],
    ['slideDown', slideDown],
    ['slideInFromLeft', slideInFromLeft],
    ['slideInFromRight', slideInFromRight],
    ['scaleIn', scaleIn],
    ['bounceIn', bounceIn],
  ])('%s has initial, animate, and exit keys', (_name, variant) => {
    expect(variant).toHaveProperty('initial')
    expect(variant).toHaveProperty('animate')
    expect(variant).toHaveProperty('exit')
  })
})

describe('modal animations', () => {
  it.each([
    ['modalBackdrop', modalBackdrop],
    ['modalContent', modalContent],
  ])('%s has initial, animate, and exit keys', (_name, variant) => {
    expect(variant).toHaveProperty('initial')
    expect(variant).toHaveProperty('animate')
    expect(variant).toHaveProperty('exit')
  })

  it('modalContent animates scale and opacity', () => {
    const animate = modalContent.animate as Record<string, unknown>
    expect(animate).toHaveProperty('opacity', 1)
    expect(animate).toHaveProperty('scale', 1)
  })
})

describe('interaction animations', () => {
  it('cardHover has hover and tap keys', () => {
    expect(cardHover).toHaveProperty('hover')
    expect(cardHover).toHaveProperty('tap')
  })

  it('buttonTap has tap key', () => {
    expect(buttonTap).toHaveProperty('tap')
  })

  it('cardHover tap scales down', () => {
    const tap = cardHover.tap as Record<string, unknown>
    expect(tap.scale).toBeLessThan(1)
  })
})

describe('continuous animations', () => {
  it('pulse has animate key with repeat', () => {
    expect(pulse).toHaveProperty('animate')
    const animate = pulse.animate as Record<string, unknown>
    const transition = animate.transition as Record<string, unknown>
    expect(transition.repeat).toBe(Infinity)
  })

  it('spinner has animate key with rotate', () => {
    expect(spinner).toHaveProperty('animate')
    const animate = spinner.animate as Record<string, unknown>
    expect(animate.rotate).toBe(360)
    const transition = animate.transition as Record<string, unknown>
    expect(transition.repeat).toBe(Infinity)
  })
})

describe('stagger variants', () => {
  it.each([
    ['staggerContainer', staggerContainer],
    ['staggerContainerFast', staggerContainerFast],
    ['staggerContainerSlow', staggerContainerSlow],
    ['staggerContainerReverse', staggerContainerReverse],
  ])('%s has initial and animate with staggerChildren', (_name, variant) => {
    expect(variant).toHaveProperty('initial')
    expect(variant).toHaveProperty('animate')
    const animate = variant.animate as Record<string, unknown>
    const transition = animate.transition as Record<string, unknown>
    expect(transition).toHaveProperty('staggerChildren')
  })

  it('staggerItem has initial and animate keys', () => {
    expect(staggerItem).toHaveProperty('initial')
    expect(staggerItem).toHaveProperty('animate')
  })

  it('fast staggers quicker than default, slow staggers slower', () => {
    const defaultDelay = ((staggerContainer.animate as Record<string, unknown>).transition as Record<string, number>)
      .staggerChildren
    const fastDelay = ((staggerContainerFast.animate as Record<string, unknown>).transition as Record<string, number>)
      .staggerChildren
    const slowDelay = ((staggerContainerSlow.animate as Record<string, unknown>).transition as Record<string, number>)
      .staggerChildren

    expect(fastDelay).toBeLessThan(defaultDelay)
    expect(slowDelay).toBeGreaterThan(defaultDelay)
  })

  it('reverse container has negative staggerDirection', () => {
    const animate = staggerContainerReverse.animate as Record<string, unknown>
    const transition = animate.transition as Record<string, number>
    expect(transition.staggerDirection).toBe(-1)
  })
})

describe('SPRING_CONFIGS', () => {
  it('has snappy, smooth, and bouncy presets', () => {
    expect(SPRING_CONFIGS).toHaveProperty('snappy')
    expect(SPRING_CONFIGS).toHaveProperty('smooth')
    expect(SPRING_CONFIGS).toHaveProperty('bouncy')
  })

  it('all presets have type spring', () => {
    expect(SPRING_CONFIGS.snappy.type).toBe('spring')
    expect(SPRING_CONFIGS.smooth.type).toBe('spring')
    expect(SPRING_CONFIGS.bouncy.type).toBe('spring')
  })

  it('snappy has higher stiffness than smooth', () => {
    expect(SPRING_CONFIGS.snappy.stiffness).toBeGreaterThan(SPRING_CONFIGS.smooth.stiffness)
  })

  it('bouncy has lower damping than snappy', () => {
    expect(SPRING_CONFIGS.bouncy.damping).toBeLessThan(SPRING_CONFIGS.snappy.damping)
  })
})
