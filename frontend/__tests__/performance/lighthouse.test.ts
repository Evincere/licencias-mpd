/**
 * Tests de Performance con Lighthouse
 * Estos tests verifican métricas de rendimiento, accesibilidad y SEO
 */

import { chromium, Browser, Page } from 'playwright'
import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'

describe('Performance Tests con Lighthouse', () => {
  let browser: Browser
  let page: Page
  let chrome: any

  beforeAll(async () => {
    // Lanzar Chrome para Lighthouse
    chrome = await launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    })
  })

  afterAll(async () => {
    if (chrome) {
      await chrome.kill()
    }
  })

  beforeEach(async () => {
    browser = await chromium.launch()
    page = await browser.newPage()
  })

  afterEach(async () => {
    if (browser) {
      await browser.close()
    }
  })

  const runLighthouse = async (url: string) => {
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    })

    return result?.lhr
  }

  test('Dashboard principal debe tener buena performance', async () => {
    const url = 'http://localhost:3000/dashboard'
    const result = await runLighthouse(url)

    expect(result).toBeDefined()
    
    // Verificar métricas de performance
    const performanceScore = result.categories.performance.score * 100
    const accessibilityScore = result.categories.accessibility.score * 100
    const bestPracticesScore = result.categories['best-practices'].score * 100
    const seoScore = result.categories.seo.score * 100

    console.log(`Performance Score: ${performanceScore}`)
    console.log(`Accessibility Score: ${accessibilityScore}`)
    console.log(`Best Practices Score: ${bestPracticesScore}`)
    console.log(`SEO Score: ${seoScore}`)

    // Umbrales mínimos
    expect(performanceScore).toBeGreaterThanOrEqual(80)
    expect(accessibilityScore).toBeGreaterThanOrEqual(90)
    expect(bestPracticesScore).toBeGreaterThanOrEqual(85)
    expect(seoScore).toBeGreaterThanOrEqual(80)

    // Verificar métricas específicas
    const metrics = result.audits
    
    // First Contentful Paint debe ser < 2s
    const fcp = metrics['first-contentful-paint'].numericValue
    expect(fcp).toBeLessThan(2000)

    // Largest Contentful Paint debe ser < 2.5s
    const lcp = metrics['largest-contentful-paint'].numericValue
    expect(lcp).toBeLessThan(2500)

    // Cumulative Layout Shift debe ser < 0.1
    const cls = metrics['cumulative-layout-shift'].numericValue
    expect(cls).toBeLessThan(0.1)
  })

  test('Página de solicitudes debe cargar rápidamente', async () => {
    const url = 'http://localhost:3000/dashboard/solicitudes'
    const result = await runLighthouse(url)

    const performanceScore = result.categories.performance.score * 100
    expect(performanceScore).toBeGreaterThanOrEqual(75) // Umbral más bajo por contenido dinámico

    // Time to Interactive debe ser razonable
    const tti = result.audits['interactive'].numericValue
    expect(tti).toBeLessThan(3500)
  })

  test('Página de reportes debe manejar gráficos eficientemente', async () => {
    const url = 'http://localhost:3000/dashboard/reportes'
    const result = await runLighthouse(url)

    // Verificar que no hay problemas de memoria con gráficos
    const performanceScore = result.categories.performance.score * 100
    expect(performanceScore).toBeGreaterThanOrEqual(70) // Umbral más bajo por gráficos

    // Verificar que no hay layout shifts por gráficos cargando
    const cls = result.audits['cumulative-layout-shift'].numericValue
    expect(cls).toBeLessThan(0.15)
  })

  test('Página de IA debe ser accesible', async () => {
    const url = 'http://localhost:3000/dashboard/ia'
    const result = await runLighthouse(url)

    const accessibilityScore = result.categories.accessibility.score * 100
    expect(accessibilityScore).toBeGreaterThanOrEqual(90)

    // Verificar auditorías específicas de accesibilidad
    expect(result.audits['color-contrast'].score).toBe(1)
    expect(result.audits['heading-order'].score).toBe(1)
    expect(result.audits['label'].score).toBe(1)
  })
})

describe('Performance Tests Manuales', () => {
  let browser: Browser
  let page: Page

  beforeEach(async () => {
    browser = await chromium.launch()
    page = await browser.newPage()
  })

  afterEach(async () => {
    if (browser) {
      await browser.close()
    }
  })

  test('Bundle size debe estar dentro de límites', async () => {
    await page.goto('http://localhost:3000/dashboard')

    // Interceptar requests de JavaScript
    const jsRequests: any[] = []
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        jsRequests.push({
          url: response.url(),
          size: response.headers()['content-length']
        })
      }
    })

    await page.waitForLoadState('networkidle')

    // Calcular tamaño total de JS
    const totalJSSize = jsRequests.reduce((total, req) => {
      return total + (parseInt(req.size) || 0)
    }, 0)

    console.log(`Total JS Bundle Size: ${(totalJSSize / 1024 / 1024).toFixed(2)} MB`)

    // El bundle total no debe exceder 2MB
    expect(totalJSSize).toBeLessThan(2 * 1024 * 1024)
  })

  test('Tiempo de carga inicial debe ser rápido', async () => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'domcontentloaded'
    })

    const loadTime = Date.now() - startTime
    console.log(`Tiempo de carga DOM: ${loadTime}ms`)

    // DOM debe cargar en menos de 2 segundos
    expect(loadTime).toBeLessThan(2000)
  })

  test('Navegación entre páginas debe ser fluida', async () => {
    await page.goto('http://localhost:3000/dashboard')

    // Medir tiempo de navegación a solicitudes
    const startTime = Date.now()
    await page.click('text=Solicitudes')
    await page.waitForURL('**/solicitudes')
    const navigationTime = Date.now() - startTime

    console.log(`Tiempo de navegación: ${navigationTime}ms`)

    // Navegación debe ser < 500ms (SPA)
    expect(navigationTime).toBeLessThan(500)
  })

  test('Scroll debe ser suave con muchos elementos', async () => {
    await page.goto('http://localhost:3000/dashboard/solicitudes')
    
    // Simular scroll rápido
    const startTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 500)
      await page.waitForTimeout(50)
    }

    const scrollTime = Date.now() - startTime
    console.log(`Tiempo de scroll: ${scrollTime}ms`)

    // Scroll debe mantener 60fps (< 16ms por frame)
    expect(scrollTime / 10).toBeLessThan(50) // Promedio por scroll
  })

  test('Formularios deben responder rápidamente', async () => {
    await page.goto('http://localhost:3000/dashboard/solicitudes')
    await page.click('text=Nueva Solicitud')

    // Medir tiempo de respuesta al escribir
    const input = page.locator('[data-testid="motivo"]')
    
    const startTime = Date.now()
    await input.fill('Test de performance en formulario')
    const inputTime = Date.now() - startTime

    console.log(`Tiempo de respuesta input: ${inputTime}ms`)

    // Input debe responder inmediatamente
    expect(inputTime).toBeLessThan(100)
  })

  test('Gráficos deben renderizar eficientemente', async () => {
    await page.goto('http://localhost:3000/dashboard/analytics')

    // Medir tiempo de renderizado de gráficos
    const startTime = Date.now()
    
    // Esperar a que los gráficos se rendericen
    await page.waitForSelector('[data-testid="grafico-tendencias"]', { timeout: 5000 })
    
    const renderTime = Date.now() - startTime
    console.log(`Tiempo de renderizado gráficos: ${renderTime}ms`)

    // Gráficos deben renderizar en < 3 segundos
    expect(renderTime).toBeLessThan(3000)
  })

  test('Búsqueda debe ser responsiva', async () => {
    await page.goto('http://localhost:3000/dashboard/solicitudes')

    const searchInput = page.locator('[data-testid="buscar-solicitudes"]')
    
    // Medir tiempo de respuesta de búsqueda
    const startTime = Date.now()
    await searchInput.fill('Juan')
    
    // Esperar a que se actualicen los resultados
    await page.waitForTimeout(300) // Debounce típico
    
    const searchTime = Date.now() - startTime
    console.log(`Tiempo de búsqueda: ${searchTime}ms`)

    // Búsqueda debe responder en < 500ms
    expect(searchTime).toBeLessThan(500)
  })
})
