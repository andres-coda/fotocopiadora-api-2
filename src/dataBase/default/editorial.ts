export const Editorial = {
  OXFORD: 'Oxford university press',
  SANTILLANA: 'Santillana',
  PUERTO_DE_PALOS: 'Puerto de palos',
  KAPELUSZ: 'Kapelusz',
  ESTRADA: 'Estrada',
  CAMBRIDGE_UNIVERSITY_PRESS: 'Cambridge university press',
  PEARSON: 'Pearson',
  MACMILLAN_EDUCATION: 'Macmillan education',
  RICHMOND: 'Richmond',
  CAMBRIDGE: 'Cambridge',
  LONGMAN: 'Longman',
  MANDIOCA: 'Mandioca',
  AIQUE: 'Aique',
  TINTA_FRESCA: 'Tinta fresca',
  EDELVIVES: 'Edelvives',
  NORMA: 'Norma',
  SIGMAR: 'Sigmar',
  LOQUELEO: 'Loqueleo',
  ALMA: 'Alma edizioni',
  AMIR: 'Amir',
  AZ: 'Az editora',
  HUEBER: 'Hueber verlag',
  CENGAGE: 'Cengage learning'
} as const;

export type EditorialDefault = (typeof Editorial)[keyof typeof Editorial];