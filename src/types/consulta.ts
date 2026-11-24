export type EstadoConsulta = 'nueva' | 'leida' | 'respondida' | 'archivada'

export interface Consulta {
  id: string
  created_at: string
  nombre: string
  email: string
  telefono: string | null
  empresa: string | null
  mensaje: string
  estado: EstadoConsulta
  email_enviado: boolean
  origen: string | null
  user_agent: string | null
}

/** Lo que manda el formulario público a /api/consultas. */
export interface ConsultaInput {
  nombre: string
  email: string
  telefono: string
  empresa: string
  mensaje: string
  /** Honeypot — siempre vacío para humanos. */
  website: string
}
