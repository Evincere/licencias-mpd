// Validaciones avanzadas para formularios de empleados

import type { NuevoEmpleado, ActualizarEmpleado, Jerarquia } from '@/lib/types/empleados'

export interface ErrorValidacion {
  campo: string
  mensaje: string
  tipo: 'error' | 'warning' | 'info'
}

export interface ResultadoValidacion {
  valido: boolean
  errores: ErrorValidacion[]
  advertencias: ErrorValidacion[]
}

/**
 * Validaciones para nuevo empleado
 */
export function validarNuevoEmpleado(datos: Partial<NuevoEmpleado>): ResultadoValidacion {
  const errores: ErrorValidacion[] = []
  const advertencias: ErrorValidacion[] = []

  // Validaciones obligatorias
  if (!datos.legajo?.trim()) {
    errores.push({
      campo: 'legajo',
      mensaje: 'El legajo es obligatorio',
      tipo: 'error'
    })
  } else if (!/^\d+$/.test(datos.legajo.trim())) {
    errores.push({
      campo: 'legajo',
      mensaje: 'El legajo debe contener solo números',
      tipo: 'error'
    })
  } else if (datos.legajo.trim().length < 3) {
    errores.push({
      campo: 'legajo',
      mensaje: 'El legajo debe tener al menos 3 dígitos',
      tipo: 'error'
    })
  }

  if (!datos.nombre?.trim()) {
    errores.push({
      campo: 'nombre',
      mensaje: 'El nombre es obligatorio',
      tipo: 'error'
    })
  } else if (datos.nombre.trim().length < 2) {
    errores.push({
      campo: 'nombre',
      mensaje: 'El nombre debe tener al menos 2 caracteres',
      tipo: 'error'
    })
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(datos.nombre.trim())) {
    errores.push({
      campo: 'nombre',
      mensaje: 'El nombre solo puede contener letras y espacios',
      tipo: 'error'
    })
  }

  if (!datos.apellido?.trim()) {
    errores.push({
      campo: 'apellido',
      mensaje: 'El apellido es obligatorio',
      tipo: 'error'
    })
  } else if (datos.apellido.trim().length < 2) {
    errores.push({
      campo: 'apellido',
      mensaje: 'El apellido debe tener al menos 2 caracteres',
      tipo: 'error'
    })
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(datos.apellido.trim())) {
    errores.push({
      campo: 'apellido',
      mensaje: 'El apellido solo puede contener letras y espacios',
      tipo: 'error'
    })
  }

  // Validación de email
  if (!datos.email?.trim()) {
    errores.push({
      campo: 'email',
      mensaje: 'El email es obligatorio',
      tipo: 'error'
    })
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(datos.email.trim())) {
      errores.push({
        campo: 'email',
        mensaje: 'El formato del email no es válido',
        tipo: 'error'
      })
    } else if (!datos.email.includes('@mpd.gov.ar')) {
      advertencias.push({
        campo: 'email',
        mensaje: 'Se recomienda usar el dominio institucional @mpd.gov.ar',
        tipo: 'warning'
      })
    }
  }

  // Validación de cargo
  if (!datos.cargo?.trim()) {
    errores.push({
      campo: 'cargo',
      mensaje: 'El cargo es obligatorio',
      tipo: 'error'
    })
  } else if (datos.cargo.trim().length < 3) {
    errores.push({
      campo: 'cargo',
      mensaje: 'El cargo debe tener al menos 3 caracteres',
      tipo: 'error'
    })
  }

  // Validación de jerarquía
  if (!datos.jerarquia) {
    errores.push({
      campo: 'jerarquia',
      mensaje: 'La jerarquía es obligatoria',
      tipo: 'error'
    })
  } else if (!['MAGISTRADO', 'FUNCIONARIO', 'EMPLEADO'].includes(datos.jerarquia)) {
    errores.push({
      campo: 'jerarquia',
      mensaje: 'La jerarquía debe ser MAGISTRADO, FUNCIONARIO o EMPLEADO',
      tipo: 'error'
    })
  }

  // Validación de área
  if (!datos.area?.trim()) {
    errores.push({
      campo: 'area',
      mensaje: 'El área es obligatoria',
      tipo: 'error'
    })
  }

  // Validación de fecha de ingreso
  if (!datos.fechaIngreso) {
    errores.push({
      campo: 'fechaIngreso',
      mensaje: 'La fecha de ingreso es obligatoria',
      tipo: 'error'
    })
  } else {
    const fechaIngreso = new Date(datos.fechaIngreso)
    const hoy = new Date()
    const hace50Anos = new Date()
    hace50Anos.setFullYear(hoy.getFullYear() - 50)

    if (fechaIngreso > hoy) {
      errores.push({
        campo: 'fechaIngreso',
        mensaje: 'La fecha de ingreso no puede ser futura',
        tipo: 'error'
      })
    } else if (fechaIngreso < hace50Anos) {
      advertencias.push({
        campo: 'fechaIngreso',
        mensaje: 'La fecha de ingreso es muy antigua, verifique que sea correcta',
        tipo: 'warning'
      })
    }
  }

  // Validaciones opcionales con advertencias
  if (datos.metadata?.numeroDocumento) {
    if (!/^\d{7,8}$/.test(datos.metadata.numeroDocumento)) {
      errores.push({
        campo: 'numeroDocumento',
        mensaje: 'El número de documento debe tener 7 u 8 dígitos',
        tipo: 'error'
      })
    }
  }

  if (datos.metadata?.telefono) {
    const telefonoRegex = /^(\+54\s?)?(\d{2,4}\s?)?\d{4}-?\d{4}$/
    if (!telefonoRegex.test(datos.metadata.telefono.replace(/\s/g, ''))) {
      advertencias.push({
        campo: 'telefono',
        mensaje: 'El formato del teléfono podría no ser válido',
        tipo: 'warning'
      })
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias
  }
}

/**
 * Validaciones para actualizar empleado
 */
export function validarActualizarEmpleado(datos: Partial<ActualizarEmpleado>): ResultadoValidacion {
  // Reutilizar las validaciones de nuevo empleado
  return validarNuevoEmpleado(datos as Partial<NuevoEmpleado>)
}

/**
 * Validar coherencia de jerarquías
 */
export function validarJerarquiaCoherente(
  jerarquiaEmpleado: Jerarquia,
  jerarquiaJefe?: Jerarquia
): ResultadoValidacion {
  const errores: ErrorValidacion[] = []
  const advertencias: ErrorValidacion[] = []

  if (jerarquiaJefe) {
    const jerarquias = ['EMPLEADO', 'FUNCIONARIO', 'MAGISTRADO']
    const nivelEmpleado = jerarquias.indexOf(jerarquiaEmpleado)
    const nivelJefe = jerarquias.indexOf(jerarquiaJefe)

    if (nivelJefe <= nivelEmpleado) {
      errores.push({
        campo: 'jefaturaDirecta',
        mensaje: 'El jefe debe tener una jerarquía superior al empleado',
        tipo: 'error'
      })
    }

    // Advertencia si hay más de un nivel de diferencia
    if (nivelJefe - nivelEmpleado > 1) {
      advertencias.push({
        campo: 'jefaturaDirecta',
        mensaje: 'Hay una gran diferencia jerárquica, verifique que sea correcto',
        tipo: 'warning'
      })
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias
  }
}

/**
 * Validar datos de importación masiva
 */
export function validarDatosImportacion(fila: any, numeroFila: number): ErrorValidacion[] {
  const errores: ErrorValidacion[] = []

  // Validar campos obligatorios
  const camposObligatorios = ['legajo', 'nombre', 'apellido', 'email', 'cargo', 'jerarquia', 'area', 'fechaIngreso']
  
  camposObligatorios.forEach(campo => {
    if (!fila[campo] || fila[campo].toString().trim() === '') {
      errores.push({
        campo,
        mensaje: `Fila ${numeroFila}: ${campo} es obligatorio`,
        tipo: 'error'
      })
    }
  })

  // Validaciones específicas
  if (fila.legajo && !/^\d+$/.test(fila.legajo.toString())) {
    errores.push({
      campo: 'legajo',
      mensaje: `Fila ${numeroFila}: El legajo debe contener solo números`,
      tipo: 'error'
    })
  }

  if (fila.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fila.email)) {
    errores.push({
      campo: 'email',
      mensaje: `Fila ${numeroFila}: Formato de email inválido`,
      tipo: 'error'
    })
  }

  if (fila.jerarquia && !['MAGISTRADO', 'FUNCIONARIO', 'EMPLEADO'].includes(fila.jerarquia)) {
    errores.push({
      campo: 'jerarquia',
      mensaje: `Fila ${numeroFila}: Jerarquía debe ser MAGISTRADO, FUNCIONARIO o EMPLEADO`,
      tipo: 'error'
    })
  }

  if (fila.fechaIngreso) {
    const fecha = new Date(fila.fechaIngreso)
    if (isNaN(fecha.getTime())) {
      errores.push({
        campo: 'fechaIngreso',
        mensaje: `Fila ${numeroFila}: Formato de fecha inválido`,
        tipo: 'error'
      })
    } else if (fecha > new Date()) {
      errores.push({
        campo: 'fechaIngreso',
        mensaje: `Fila ${numeroFila}: La fecha de ingreso no puede ser futura`,
        tipo: 'error'
      })
    }
  }

  return errores
}

/**
 * Detectar duplicados en importación
 */
export function detectarDuplicados(datos: any[]): { legajo: string[], email: string[] } {
  const legajos = new Set<string>()
  const emails = new Set<string>()
  const duplicadosLegajo: string[] = []
  const duplicadosEmail: string[] = []

  datos.forEach((fila, index) => {
    if (fila.legajo) {
      if (legajos.has(fila.legajo)) {
        duplicadosLegajo.push(`Fila ${index + 1}: Legajo ${fila.legajo} duplicado`)
      } else {
        legajos.add(fila.legajo)
      }
    }

    if (fila.email) {
      if (emails.has(fila.email.toLowerCase())) {
        duplicadosEmail.push(`Fila ${index + 1}: Email ${fila.email} duplicado`)
      } else {
        emails.add(fila.email.toLowerCase())
      }
    }
  })

  return {
    legajo: duplicadosLegajo,
    email: duplicadosEmail
  }
}

/**
 * Formatear errores para mostrar en UI
 */
export function formatearErrores(resultado: ResultadoValidacion): string[] {
  const mensajes: string[] = []
  
  resultado.errores.forEach(error => {
    mensajes.push(`❌ ${error.mensaje}`)
  })
  
  resultado.advertencias.forEach(advertencia => {
    mensajes.push(`⚠️ ${advertencia.mensaje}`)
  })
  
  return mensajes
}
