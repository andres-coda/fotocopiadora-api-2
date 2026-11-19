
export const Componente = {
  STUDENT: "Student's Book",
  CLASSBOOK: "Classbook",
  WORKBOOK: 'Workbook',
  ACTIVITY: 'Activity Book',
  TEACHER: "Teacher's Book",
  PRACTICE: 'Practice Book',
  BOOKLET: 'Home booklet',
  PUPIL: "Pupil's Book",
  ENTRY: "Entry Book",
  KURSBUCH: 'Kursbuch',
  COURSEBOOK: 'Coursebook',
  EXAM: 'Exam Trainer',
  ORACIONES: 'Oraciones y respuestas',
  CARPETA: 'Carpeta de actividades'
} as const;

export type ComponenteDefault = (typeof Componente)[keyof typeof Componente];