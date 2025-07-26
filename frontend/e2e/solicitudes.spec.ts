import { test, expect } from '@playwright/test'

test.describe('Sistema de Solicitudes de Licencia', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar al dashboard
    await page.goto('/dashboard')
    
    // Verificar que estamos en el dashboard
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('debe permitir crear una nueva solicitud de licencia', async ({ page }) => {
    // Navegar a solicitudes
    await page.click('text=Solicitudes')
    await expect(page).toHaveURL('/dashboard/solicitudes')
    
    // Hacer clic en "Nueva Solicitud"
    await page.click('text=Nueva Solicitud')
    
    // Verificar que se abre el formulario
    await expect(page.locator('text=Nueva Solicitud de Licencia')).toBeVisible()
    
    // Llenar el formulario
    await page.selectOption('[data-testid="tipo-licencia"]', 'Licencia Anual')
    await page.fill('[data-testid="fecha-inicio"]', '2024-04-01')
    await page.fill('[data-testid="fecha-fin"]', '2024-04-05')
    await page.fill('[data-testid="motivo"]', 'Vacaciones familiares programadas')
    
    // Verificar que se calculen los días automáticamente
    await expect(page.locator('[data-testid="dias-calculados"]')).toContainText('5 días')
    
    // Enviar la solicitud
    await page.click('text=Enviar Solicitud')
    
    // Verificar mensaje de éxito
    await expect(page.locator('.toast-success')).toContainText('Solicitud creada exitosamente')
    
    // Verificar que aparece en la lista
    await expect(page.locator('[data-testid="solicitud-item"]').first()).toContainText('Licencia Anual')
  })

  test('debe validar campos requeridos en el formulario', async ({ page }) => {
    await page.click('text=Solicitudes')
    await page.click('text=Nueva Solicitud')
    
    // Intentar enviar sin llenar campos
    await page.click('text=Enviar Solicitud')
    
    // Verificar mensajes de validación
    await expect(page.locator('text=Debe seleccionar un tipo de licencia')).toBeVisible()
    await expect(page.locator('text=Fecha de inicio es requerida')).toBeVisible()
    await expect(page.locator('text=Fecha de fin es requerida')).toBeVisible()
    await expect(page.locator('text=Motivo es requerido')).toBeVisible()
  })

  test('debe validar que fecha de fin sea posterior a fecha de inicio', async ({ page }) => {
    await page.click('text=Solicitudes')
    await page.click('text=Nueva Solicitud')
    
    // Llenar con fechas inválidas
    await page.selectOption('[data-testid="tipo-licencia"]', 'Licencia Anual')
    await page.fill('[data-testid="fecha-inicio"]', '2024-04-05')
    await page.fill('[data-testid="fecha-fin"]', '2024-04-01') // Fecha anterior
    await page.fill('[data-testid="motivo"]', 'Test')
    
    await page.click('text=Enviar Solicitud')
    
    // Verificar mensaje de error
    await expect(page.locator('text=La fecha de fin debe ser posterior a la fecha de inicio')).toBeVisible()
  })

  test('debe mostrar advertencia cuando se exceden días disponibles', async ({ page }) => {
    await page.click('text=Solicitudes')
    await page.click('text=Nueva Solicitud')
    
    // Seleccionar período que exceda días disponibles
    await page.selectOption('[data-testid="tipo-licencia"]', 'Licencia Anual')
    await page.fill('[data-testid="fecha-inicio"]', '2024-04-01')
    await page.fill('[data-testid="fecha-fin"]', '2024-05-15') // 45 días, excede los 25 disponibles
    
    // Verificar advertencia
    await expect(page.locator('.warning-message')).toContainText('excede los días disponibles')
    await expect(page.locator('.warning-message')).toContainText('45 días solicitados, 25 disponibles')
  })

  test('debe permitir filtrar solicitudes por estado', async ({ page }) => {
    await page.click('text=Solicitudes')
    
    // Abrir filtros
    await page.click('[data-testid="filtros-button"]')
    
    // Filtrar por estado pendiente
    await page.selectOption('[data-testid="filtro-estado"]', 'PENDIENTE')
    await page.click('text=Aplicar Filtros')
    
    // Verificar que solo se muestren solicitudes pendientes
    const solicitudes = page.locator('[data-testid="solicitud-item"]')
    const count = await solicitudes.count()
    
    for (let i = 0; i < count; i++) {
      await expect(solicitudes.nth(i).locator('.estado-badge')).toContainText('PENDIENTE')
    }
  })

  test('debe permitir ver detalles de una solicitud', async ({ page }) => {
    await page.click('text=Solicitudes')
    
    // Hacer clic en la primera solicitud
    await page.click('[data-testid="solicitud-item"]')
    
    // Verificar que se abre el modal de detalles
    await expect(page.locator('[data-testid="modal-detalles"]')).toBeVisible()
    await expect(page.locator('text=Detalles de la Solicitud')).toBeVisible()
    
    // Verificar que se muestran los datos
    await expect(page.locator('[data-testid="detalle-tipo"]')).toBeVisible()
    await expect(page.locator('[data-testid="detalle-fechas"]')).toBeVisible()
    await expect(page.locator('[data-testid="detalle-estado"]')).toBeVisible()
  })

  test('debe permitir cancelar una solicitud pendiente', async ({ page }) => {
    await page.click('text=Solicitudes')
    
    // Buscar una solicitud pendiente
    const solicitudPendiente = page.locator('[data-testid="solicitud-item"]').filter({
      has: page.locator('.estado-badge:has-text("PENDIENTE")')
    }).first()
    
    await solicitudPendiente.click()
    
    // Hacer clic en cancelar
    await page.click('text=Cancelar Solicitud')
    
    // Confirmar cancelación
    await page.click('text=Confirmar Cancelación')
    
    // Verificar mensaje de éxito
    await expect(page.locator('.toast-success')).toContainText('Solicitud cancelada exitosamente')
    
    // Verificar que el estado cambió
    await expect(solicitudPendiente.locator('.estado-badge')).toContainText('CANCELADA')
  })

  test('debe mostrar historial de cambios en una solicitud', async ({ page }) => {
    await page.click('text=Solicitudes')
    await page.click('[data-testid="solicitud-item"]')
    
    // Ir a la pestaña de historial
    await page.click('text=Historial')
    
    // Verificar que se muestra el historial
    await expect(page.locator('[data-testid="historial-item"]')).toHaveCount.toBeGreaterThan(0)
    
    // Verificar que cada entrada tiene fecha y acción
    const primeraEntrada = page.locator('[data-testid="historial-item"]').first()
    await expect(primeraEntrada.locator('.fecha')).toBeVisible()
    await expect(primeraEntrada.locator('.accion')).toBeVisible()
    await expect(primeraEntrada.locator('.usuario')).toBeVisible()
  })

  test('debe permitir buscar solicitudes por empleado', async ({ page }) => {
    await page.click('text=Solicitudes')
    
    // Usar el buscador
    await page.fill('[data-testid="buscar-solicitudes"]', 'Juan Pérez')
    await page.press('[data-testid="buscar-solicitudes"]', 'Enter')
    
    // Verificar que se filtran los resultados
    const solicitudes = page.locator('[data-testid="solicitud-item"]')
    const count = await solicitudes.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(solicitudes.nth(i)).toContainText('Juan Pérez')
      }
    }
  })

  test('debe ser responsive en dispositivos móviles', async ({ page }) => {
    // Simular dispositivo móvil
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.click('text=Solicitudes')
    
    // Verificar que el diseño se adapta
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Verificar que las tarjetas de solicitudes se muestran en columna
    const solicitudes = page.locator('[data-testid="solicitud-item"]')
    if (await solicitudes.count() > 0) {
      const firstCard = solicitudes.first()
      const box = await firstCard.boundingBox()
      expect(box?.width).toBeLessThan(400) // Ancho móvil
    }
  })

  test('debe manejar errores de red graciosamente', async ({ page }) => {
    // Interceptar requests y simular error
    await page.route('**/api/solicitudes', route => {
      route.abort('failed')
    })
    
    await page.click('text=Solicitudes')
    
    // Verificar que se muestra mensaje de error
    await expect(page.locator('.error-message')).toContainText('Error al cargar solicitudes')
    await expect(page.locator('text=Reintentar')).toBeVisible()
  })
})
