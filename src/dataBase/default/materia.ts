
export const Materia = {
  INGLES: 'Inglés',
  LENGUA: 'Lengua',
  LENGUA_Y_LITERATURA: 'Lengua y Literatura',
  MATEMATICA: 'Matemática',
  CIENCIAS_SOCIALES: 'Ciencias Sociales',
  CIENCIAS_NATURALES: 'Ciencias Naturales',
  CIENCIAS_SOCIALES_Y_NATURALES: 'Ciencias Sociales y Ciencias Naturales',
  HISTORIA: 'Historia',
  LITERATURA: 'Literatura',
  PDL: 'Prácticas del Lenguaje',
  ITALIANO: 'Italiano',
  RELIGION: 'Religión',
  SEMIOLOGIA: 'Semiología',
  FISIOLOGIA: 'Fisiología',
  NAVEGACION: 'Navegación',
  AREAS_INTEGRADAS: 'Áreas Integradas',
  MANUAL: 'Manual',
  MEDICINA: 'Medicina',
  TP: 'Trabajo Práctico',
  AVIACION: 'Aviación',
  ALEMAN: 'Alemán',
  CUARDENILLO: 'Cuadernillo'

} as const;

export type MateriaDefault = (typeof Materia)[keyof typeof Materia];