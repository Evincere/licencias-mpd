import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormularioSolicitud } from '@/components/solicitudes/formulario-solicitud'
import type { Empleado } from '@/lib/types/empleados'

// Mock del empleado para testing
const mockEmpleado: Empleado = {
  id: 'emp_001',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan.perez@jus.mendoza.gov.ar',
  telefono: '+54 261 123-4567',
  area: 'Defensoría Civil',
  cargo: 'Defensor',
  jerarquia: 'FUNCIONARIO',
  fechaIngreso: new Date('2020-01-15'),
  activo: true,
  supervisor: {
    id: 'sup_001',
    nombre: 'María García',
    email: 'maria.garcia@jus.mendoza.gov.ar'
  },
  diasLicenciaDisponibles: {
    anual: 25,
    enfermedad: 30,
    compensatoria: 10,
    especial: 5
  }
}

// Mock de la función onSubmit
const mockOnSubmit = jest.fn()
const mockOnCancel = jest.fn()

describe('FormularioSolicitud', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente el formulario', () => {
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Verificar que los elementos principales estén presentes
    expect(screen.getByText('Nueva Solicitud de Licencia')).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de licencia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de fin/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument()
  })

  it('muestra la información del empleado correctamente', () => {
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Defensoría Civil')).toBeInTheDocument()
    expect(screen.getByText('FUNCIONARIO')).toBeInTheDocument()
  })

  it('muestra los días disponibles por tipo de licencia', () => {
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('25 días')).toBeInTheDocument() // Licencia anual
    expect(screen.getByText('30 días')).toBeInTheDocument() // Licencia por enfermedad
    expect(screen.getByText('10 días')).toBeInTheDocument() // Licencia compensatoria
  })

  it('calcula automáticamente los días solicitados', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Seleccionar fechas
    const fechaInicio = screen.getByLabelText(/fecha de inicio/i)
    const fechaFin = screen.getByLabelText(/fecha de fin/i)

    await user.type(fechaInicio, '2024-03-01')
    await user.type(fechaFin, '2024-03-05')

    // Verificar que se calculen los días correctamente (5 días)
    await waitFor(() => {
      expect(screen.getByText(/5 días/)).toBeInTheDocument()
    })
  })

  it('valida que la fecha de fin sea posterior a la fecha de inicio', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const fechaInicio = screen.getByLabelText(/fecha de inicio/i)
    const fechaFin = screen.getByLabelText(/fecha de fin/i)

    // Establecer fecha de fin anterior a fecha de inicio
    await user.type(fechaInicio, '2024-03-05')
    await user.type(fechaFin, '2024-03-01')

    // Intentar enviar el formulario
    const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
    await user.click(submitButton)

    // Verificar que se muestre error de validación
    await waitFor(() => {
      expect(screen.getByText(/fecha de fin debe ser posterior/i)).toBeInTheDocument()
    })

    // Verificar que no se llame onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('valida que se seleccione un tipo de licencia', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Llenar otros campos pero no seleccionar tipo
    const fechaInicio = screen.getByLabelText(/fecha de inicio/i)
    const fechaFin = screen.getByLabelText(/fecha de fin/i)
    const motivo = screen.getByLabelText(/motivo/i)

    await user.type(fechaInicio, '2024-03-01')
    await user.type(fechaFin, '2024-03-05')
    await user.type(motivo, 'Vacaciones familiares')

    // Intentar enviar sin seleccionar tipo
    const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
    await user.click(submitButton)

    // Verificar que se muestre error
    await waitFor(() => {
      expect(screen.getByText(/debe seleccionar un tipo/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('envía el formulario correctamente con datos válidos', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Llenar todos los campos
    const tipoSelect = screen.getByLabelText(/tipo de licencia/i)
    const fechaInicio = screen.getByLabelText(/fecha de inicio/i)
    const fechaFin = screen.getByLabelText(/fecha de fin/i)
    const motivo = screen.getByLabelText(/motivo/i)

    await user.selectOptions(tipoSelect, 'Licencia Anual')
    await user.type(fechaInicio, '2024-03-01')
    await user.type(fechaFin, '2024-03-05')
    await user.type(motivo, 'Vacaciones familiares programadas')

    // Enviar formulario
    const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
    await user.click(submitButton)

    // Verificar que se llame onSubmit con los datos correctos
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        empleadoId: 'emp_001',
        tipo: 'Licencia Anual',
        fechaInicio: new Date('2024-03-01'),
        fechaFin: new Date('2024-03-05'),
        diasSolicitados: 5,
        motivo: 'Vacaciones familiares programadas',
        observaciones: '',
        documentosAdjuntos: []
      })
    })
  })

  it('llama onCancel cuando se hace clic en cancelar', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('muestra advertencia cuando se exceden los días disponibles', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Seleccionar licencia anual y fechas que excedan los días disponibles
    const tipoSelect = screen.getByLabelText(/tipo de licencia/i)
    const fechaInicio = screen.getByLabelText(/fecha de inicio/i)
    const fechaFin = screen.getByLabelText(/fecha de fin/i)

    await user.selectOptions(tipoSelect, 'Licencia Anual')
    await user.type(fechaInicio, '2024-03-01')
    await user.type(fechaFin, '2024-04-01') // 32 días, excede los 25 disponibles

    // Verificar que se muestre advertencia
    await waitFor(() => {
      expect(screen.getByText(/excede los días disponibles/i)).toBeInTheDocument()
    })
  })

  it('permite agregar observaciones opcionales', async () => {
    const user = userEvent.setup()
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const observaciones = screen.getByLabelText(/observaciones/i)
    await user.type(observaciones, 'Observaciones adicionales para la solicitud')

    expect(observaciones).toHaveValue('Observaciones adicionales para la solicitud')
  })

  it('maneja el estado de carga durante el envío', async () => {
    const user = userEvent.setup()
    
    // Mock que simula delay en onSubmit
    const slowOnSubmit = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(
      <FormularioSolicitud
        empleado={mockEmpleado}
        onSubmit={slowOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Llenar formulario válido
    const tipoSelect = screen.getByLabelText(/tipo de licencia/i)
    const fechaInicio = screen.getByLabelText(/fecha de inicio/i)
    const fechaFin = screen.getByLabelText(/fecha de fin/i)
    const motivo = screen.getByLabelText(/motivo/i)

    await user.selectOptions(tipoSelect, 'Licencia Anual')
    await user.type(fechaInicio, '2024-03-01')
    await user.type(fechaFin, '2024-03-05')
    await user.type(motivo, 'Vacaciones')

    // Enviar formulario
    const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
    await user.click(submitButton)

    // Verificar que se muestre estado de carga
    expect(screen.getByText(/enviando/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
