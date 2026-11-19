
import { LibroCompleto, LibroCompletoDefault } from "./libro_completo";


export enum Especificaciones {
  BLANCO_Y_NEGRO = "b_n",
  COLOR = "color",
  ADHESIVO = "adhesivo",
  SUELTO = "suelto",
  ANILLADO = "anillado",
  ABROCHADO = "abrochado",
  DOBLE_FAZ = "d_f",
  SIMPLE_FAZ = "s_f",
  SELECCION = "seleccion",
  TROKELADO = "trokelado"
}

interface LibroLocalProp {
  libro:LibroCompletoDefault;
  cantidadPg: number;
  adhesivos?: number;
  especificacion_defecto?: Especificaciones[]

}

export const LibroLocal = {
  THINK_1_A2_SB: {
    libro: LibroCompleto.THINK_1_A2_SB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_1_A2_WB: {
    libro: LibroCompleto.THINK_1_A2_WB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_1_CB_MINUSUCULA: {
    libro: LibroCompleto.BRIGHT_IDEAS_1_CB_MINUSUCULA,
    cantidadPg: 113,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_1_AB_MINUSUCULA: {
    libro: LibroCompleto.BRIGHT_IDEAS_1_AB_MINUSUCULA,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_1_CB_MAYUSCULA: {
    libro: LibroCompleto.BRIGHT_IDEAS_1_CB_MAYUSCULA,
    cantidadPg: 113,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_1_AB_MAYUSCULA: {
    libro: LibroCompleto.BRIGHT_IDEAS_1_AB_MAYUSCULA,
    cantidadPg: 126,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_2_AB: {
    libro: LibroCompleto.BRIGHT_IDEAS_2_AB,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_2_CB: {
    libro: LibroCompleto.BRIGHT_IDEAS_2_CB,
    cantidadPg: 113,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_3_AB: {
    libro: LibroCompleto.BRIGHT_IDEAS_3_AB,
    cantidadPg: 121,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_3_CB: {
    libro: LibroCompleto.BRIGHT_IDEAS_3_CB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_5_AB: {
    libro: LibroCompleto.BRIGHT_IDEAS_5_AB,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_5_CB: {
    libro: LibroCompleto.BRIGHT_IDEAS_5_CB,
    cantidadPg: 113,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TONIO_Y_TUX_AL_ATAQUE: {
    libro: LibroCompleto.TONIO_Y_TUX_AL_ATAQUE,
    cantidadPg: 49,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TONIO_Y_TUX_UNA_AVENTURA_INTERGALACTICA: {
    libro: LibroCompleto.TONIO_Y_TUX_UNA_AVENTURA_INTERGALACTICA,
    cantidadPg: 57,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_5_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_5_AB,
    cantidadPg: 131,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_5_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_5_CB,
    cantidadPg: 115,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_6_Y_BOOKLET: {
    libro: LibroCompleto.STORY_FUN_6_Y_BOOKLET,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EXPEDICION_MATEMATICA_6: {
    libro: LibroCompleto.EXPEDICION_MATEMATICA_6,
    cantidadPg: 152,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EXPEDICION_MATEMATICA_5: {
    libro: LibroCompleto.EXPEDICION_MATEMATICA_5,
    cantidadPg: 154,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_5_SB: {
    libro: LibroCompleto.STORY_FUN_5_SB,
    cantidadPg: 80,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_5_HOME: {
    libro: LibroCompleto.STORY_FUN_5_HOME,
    cantidadPg: 32,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.DOBLE_FAZ]
  },
  MY_ENGLISH_TRIP_1: {
    libro: LibroCompleto.MY_ENGLISH_TRIP_1,
    cantidadPg: 135,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_LIBRO_DE_MATE_5: {
    libro: LibroCompleto.EL_LIBRO_DE_MATE_5,
    cantidadPg: 168,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  RESUMEN_SEMIOLOGIA: {
    libro: LibroCompleto.RESUMEN_SEMIOLOGIA,
    cantidadPg: 218,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EXPEDICION_MATEMATICA_2: {
    libro: LibroCompleto.EXPEDICION_MATEMATICA_2,
    cantidadPg: 131,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EXPEDICION_MATEMATICA_4: {
    libro: LibroCompleto.EXPEDICION_MATEMATICA_4,
    cantidadPg: 154,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NUEVO_TALLER_DE_LETRAS_Y_NUMEROS_2: {
    libro: LibroCompleto.NUEVO_TALLER_DE_LETRAS_Y_NUMEROS_2,
    cantidadPg: 88,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_2_SB_HOME: {
    libro: LibroCompleto.STORY_FUN_2_SB_HOME,
    cantidadPg: 80,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_1_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_1_AB,
    cantidadPg: 124,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_1_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_1_CB,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BINARITA_2: {
    libro: LibroCompleto.BINARITA_2,
    cantidadPg: 138,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_4_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_4_AB,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_4_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_4_CB,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  QUIERO_SER_PEREZ: {
    libro: LibroCompleto.QUIERO_SER_PEREZ,
    cantidadPg: 42,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_1_SB: {
    libro: LibroCompleto.GO_GETTER_1_SB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_1_WB: {
    libro: LibroCompleto.GO_GETTER_1_WB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_2_SB: {
    libro: LibroCompleto.GO_GETTER_2_SB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_2_WB: {
    libro: LibroCompleto.GO_GETTER_2_WB,
    cantidadPg: 100,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_2B: {
    libro: LibroCompleto.GO_GETTER_2B,
    cantidadPg: 105,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_3_SB: {
    libro: LibroCompleto.GO_GETTER_3_SB,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_3_WB: {
    libro: LibroCompleto.GO_GETTER_3_WB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEY_FRIENDS_1: {
    libro: LibroCompleto.HEY_FRIENDS_1,
    cantidadPg: 123,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  POWER_UP_1_PB: {
    libro: LibroCompleto.POWER_UP_1_PB,
    cantidadPg: 127,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEY_FRIENDS_A: {
    libro: LibroCompleto.HEY_FRIENDS_A,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEY_FRIENDS_2_SB: {
    libro: LibroCompleto.HEY_FRIENDS_2_SB,
    cantidadPg: 95,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEY_FRIENDS_2_PB_WB: {
    libro: LibroCompleto.HEY_FRIENDS_2_SB,
    cantidadPg: 119,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEY_FRIENDS_B: {
    libro: LibroCompleto.HEY_FRIENDS_B,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_1_AB: {
    libro: LibroCompleto.LEARN_WITH_US_1_AB,
    cantidadPg: 59,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_1_CB: {
    libro: LibroCompleto.LEARN_WITH_US_1_CB,
    cantidadPg: 100,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_2_AB: {
    libro: LibroCompleto.LEARN_WITH_US_2_AB,
    cantidadPg: 59,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_2_CB: {
    libro: LibroCompleto.LEARN_WITH_US_2_CB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_3_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_3_AB,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_3_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_3_CB,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_1_WB: {
    libro: LibroCompleto.WIDER_WORLD_1_WB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEY_FRIENDS_3: {
    libro: LibroCompleto.HEY_FRIENDS_3,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  RESUMEN_FISIOLOGIA: {
    libro: LibroCompleto.RESUMEN_FISIOLOGIA,
    cantidadPg: 166,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MANUAL_AMIR: {
    libro: LibroCompleto.MANUAL_AMIR,
    cantidadPg: 136,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ODYSSEY_4_AB: {
    libro: LibroCompleto.ODYSSEY_4_AB,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THE_DAY_OF_CRAYONS_QUIT: {
    libro: LibroCompleto.THE_DAY_OF_CRAYONS_QUIT,
    cantidadPg: 22,
  },
  NOVO_EXPRESSO_1_A1: {
    libro: LibroCompleto.NOVO_EXPRESSO_1_A1,
    cantidadPg: 243,
  },
  NOVO_EXPRESSO_2_A2: {
    libro: LibroCompleto.NOVO_EXPRESSO_2_A2,
    cantidadPg: 269,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NOVO_EXPRESSO_3_B1: {
    libro: LibroCompleto.NOVO_EXPRESSO_3_B1,
    cantidadPg: 268,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NOVO_EXPRESSO_4_B2: {
    libro: LibroCompleto.NOVO_EXPRESSO_4_B2,
    cantidadPg: 196,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NOVO_EXPRESSO_5_C1: {
    libro: LibroCompleto.NOVO_EXPRESSO_5_C1,
    cantidadPg: 196,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NOVO_EXPRESSO_6_C2: {
    libro: LibroCompleto.NOVO_EXPRESSO_6_C2,
    cantidadPg: 218,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  POWER_UP_1_AB: {
    libro: LibroCompleto.POWER_UP_1_AB,
    cantidadPg: 121,
  },
  POWER_UP_2_AB: {
    libro: LibroCompleto.POWER_UP_2_AB,
    cantidadPg: 119,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  POWER_UP_2_PB: {
    libro: LibroCompleto.POWER_UP_2_PB,
    cantidadPg: 129,
  },
  POWER_UP_3_AB: {
    libro: LibroCompleto.POWER_UP_3_AB,
    cantidadPg: 119,
  },
  POWER_UP_3_HOME: {
    libro: LibroCompleto.POWER_UP_3_HOME,
    cantidadPg: 31,
  },
  POWER_UP_3_PB: {
    libro: LibroCompleto.POWER_UP_3_PB,
    cantidadPg: 136,
  },
  POWER_UP_4_PB: {
    libro: LibroCompleto.POWER_UP_4_PB,
    cantidadPg: 137,
  },
  POWER_UP_4_AB: {
    libro: LibroCompleto.POWER_UP_4_AB,
    cantidadPg: 121,
  },
  POWER_UP_START_SMART_PB: {
    libro: LibroCompleto.POWER_UP_START_SMART_PB,
    cantidadPg: 105,
  },
  LEARN_WITH_US_3_AB: {
    libro: LibroCompleto.LEARN_WITH_US_3_AB,
    cantidadPg: 99,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_3_CB: {
    libro: LibroCompleto.LEARN_WITH_US_3_CB,
    cantidadPg: 76,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_3_ENTRY_BOOK: {
    libro: LibroCompleto.LEARN_WITH_US_3_EB,
    cantidadPg: 38,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_4_AB: {
    libro: LibroCompleto.LEARN_WITH_US_4_AB,
    cantidadPg: 99,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_4_CB: {
    libro: LibroCompleto.LEARN_WITH_US_4_CB,
    cantidadPg: 76,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_5_AB: {
    libro: LibroCompleto.LEARN_WITH_US_5_AB,
    cantidadPg: 99,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_5_CB: {
    libro: LibroCompleto.LEARN_WITH_US_5_CB,
    cantidadPg: 85,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_6_AB: {
    libro: LibroCompleto.LEARN_WITH_US_6_AB,
    cantidadPg: 113,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_6_CB: {
    libro: LibroCompleto.LEARN_WITH_US_6_CB,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  RESUMEN_FISIOLOGIA_MATILDE: {
    libro: LibroCompleto.RESUMEN_FISIOLOGIA_MATILDE,
    cantidadPg: 95,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_4_SB: {
    libro: LibroCompleto.WIDER_WORLD_4_SB,
    cantidadPg: 142,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_4_WB: {
    libro: LibroCompleto.WIDER_WORLD_4_WB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GUARDIANES_DE_MUNDO_1: {
    libro: LibroCompleto.GUARDIANES_DE_MUNDO_1,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_REBAÑO: {
    libro: LibroCompleto.EL_REBAÑO,
    cantidadPg: 38,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPERTRAZOS_1: {
    libro: LibroCompleto.SUPERTRAZOS_1,
    cantidadPg: 66,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ORTOGRAFIA_5: {
    libro: LibroCompleto.ORTOGRAFIA_5,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PUERTO_EN_CIENCIAS_5: {
    libro: LibroCompleto.PUERTO_EN_CIENCIAS_5,
    cantidadPg: 308,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ODYSSEY_3_SB: {
    libro: LibroCompleto.ODYSSEY_3_SB,
    cantidadPg: 154,
    adhesivos:8,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ,Especificaciones.ADHESIVO]
  },
  ODYSSEY_4_SB: {
    libro: LibroCompleto.ODYSSEY_4_SB,
    cantidadPg: 154,
    adhesivos: 8,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ, Especificaciones.ADHESIVO]
  },
  ENGLISH_FILE_ELEMENTARY_SB: {
    libro: LibroCompleto.ENGLISH_FILE_ELEMENTARY_SB,
    cantidadPg: 170,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_ELEMENTARY_WB: {
    libro: LibroCompleto.ENGLISH_FILE_ELEMENTARY_WB,
    cantidadPg: 100,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NARNIA: {
    libro: LibroCompleto.NARNIA,
    cantidadPg: 240,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  CIENCIAS_SOCIALES: {
    libro: LibroCompleto.CIENCIAS_SOCIALES,
    cantidadPg: 339,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LENGUA_Y_LITERATURA_1: {
    libro: LibroCompleto.LENGUA_Y_LITERATURA_1,
    cantidadPg: 224,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_S_CB: {
    libro: LibroCompleto.BRIGHT_IDEAS_S_CB,
    cantidadPg: 77,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHT_IDEAS_S_AB: {
    libro: LibroCompleto.BRIGHT_IDEAS_S_AB,
    cantidadPg: 71,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TP_FINAL_PARTICULAR: {
    libro: LibroCompleto.TP_FINAL_PARTICULAR,
    cantidadPg: 72,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ORTOGRAFIA_4: {
    libro: LibroCompleto.ORTOGRAFIA_4,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PUERTO_EN_CIENCIAS_4: {
    libro: LibroCompleto.PUERTO_EN_CIENCIAS_4,
    cantidadPg: 292,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ODYSSEY_3_PB: {
    libro: LibroCompleto.ODYSSEY_3_PB,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FACILISSIMO: {
    libro: LibroCompleto.FACILISSIMO,
    cantidadPg: 145,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GUARDIANES_DE_MUNDO_4: {
    libro: LibroCompleto.GUARDIANES_DE_MUNDO_4,
    cantidadPg: 212,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_4_BOOKLET: {
    libro: LibroCompleto.STORY_FUN_4_BOOKLET,
    cantidadPg: 80,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INVOLVED_WB: {
    libro: LibroCompleto.INVOLVED_WB,
    cantidadPg: 44,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INVOLVED_SB: {
    libro: LibroCompleto.INVOLVED_SB,
    cantidadPg: 62,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EXPEDICION_MATEMATICA_3: {
    libro: LibroCompleto.EXPEDICION_MATEMATICA_3,
    cantidadPg: 145,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EXPEDICION_MATEMATICA_1: {
    libro: LibroCompleto.EXPEDICION_MATEMATICA_1,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ORTOGRAFIA_6_PARA_DAR_EN_LA_TECLA: {
    libro: LibroCompleto.ORTOGRAFIA_6_PARA_DAR_EN_LA_TECLA,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  CUENTOS_DE_LA_SELVA: {
    libro: LibroCompleto.CUENTOS_DE_LA_SELVA,
    cantidadPg: 64,
  },
  AVIATION_MAINTENANCE: {
    libro: LibroCompleto.AVIATION_MAINTENANCE,
    cantidadPg: 500,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DRACULA_LUCIANA: {
    libro: LibroCompleto.DRACULA_LUCIANA,
    cantidadPg: 44,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_2_HOME: {
    libro: LibroCompleto.STORY_FUN_2_HOME,
    cantidadPg: 33,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_2_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_2_AB,
    cantidadPg: 123,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_2_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_2_CB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_3_HOME: {
    libro: LibroCompleto.STORY_FUN_3_HOME,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WE_ARE_HEROES_4_PB: {
    libro: LibroCompleto.WE_ARE_HEROES_4_PB,
    cantidadPg: 76,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WE_ARE_HEROES_4_WB: {
    libro: LibroCompleto.WE_ARE_HEROES_4_WB,
    cantidadPg: 82,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PUERTO_EN_CIENCIAS_6: {
    libro: LibroCompleto.PUERTO_EN_CIENCIAS_6,
    cantidadPg: 292,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PEREGRINOS_UNIDOS_1: {
    libro: LibroCompleto.PEREGRINOS_UNIDOS_1,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_B1_PLUS_SB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_B1_PLUS_SB,
    cantidadPg: 191,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PDL_1_2025: {
    libro: LibroCompleto.PDL_1_2025,
    cantidadPg: 55,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_3_WB: {
    libro: LibroCompleto.WIDER_WORLD_3_WB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_3_SB: {
    libro: LibroCompleto.WIDER_WORLD_3_SB,
    cantidadPg: 146,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEADWAY_ELEMENTARY_SB: {
    libro: LibroCompleto.HEADWAY_ELEMENTARY_SB,
    cantidadPg: 165,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_BEGINNER_SB: {
    libro: LibroCompleto.ENGLISH_FILE_BEGINNER_SB,
    cantidadPg: 135,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_BEGINNER_WB: {
    libro: LibroCompleto.ENGLISH_FILE_BEGINNER_WB,
    cantidadPg: 75,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_SB: {
    libro: LibroCompleto.ENGLISH_FILE_SB,
    cantidadPg: 118,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_WB: {
    libro: LibroCompleto.ENGLISH_FILE_WB,
    cantidadPg: 55,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_6_B2_SB: {
    libro: LibroCompleto.PREPARE_6_B2_SB,
    cantidadPg: 150,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_6_B2_WB: {
    libro: LibroCompleto.PREPARE_6_B2_WB,
    cantidadPg: 80,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LIFE_VISION_PLUS_INT_B1_WB: {
    libro: LibroCompleto.LIFE_VISION_PLUS_INT_B1_WB,
    cantidadPg: 129,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LIFE_VISION_PLUS_INT_B1_SB: {
    libro: LibroCompleto.LIFE_VISION_PLUS_INT_B1_SB,
    cantidadPg: 166,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  YUNG_EXPLORER_1_CB: {
    libro: LibroCompleto.YUNG_EXPLORER_1_CB,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  YUNG_EXPLORER_1_AB: {
    libro: LibroCompleto.YUNG_EXPLORER_1_AB,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FIRST_EXPLORER_2_AB: {
    libro: LibroCompleto.FIRST_EXPLORER_2_AB,
    cantidadPg: 58,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FIRST_EXPLORER_2_CB: {
    libro: LibroCompleto.FIRST_EXPLORER_2_CB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DORY_FANTASMAGORY: {
    libro: LibroCompleto.DORY_FANTASMAGORY,
    cantidadPg: 66,
  },
  GATEWAY_A2_WB: {
    libro: LibroCompleto.GATEWAY_A2_WB,
    cantidadPg: 110,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GATEWAY_A2_SB: {
    libro: LibroCompleto.GATEWAY_A2_SB,
    cantidadPg: 162,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ABRAPALABRA_3: {
    libro: LibroCompleto.ABRAPALABRA_3,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_2_PB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_2_PB,
    cantidadPg: 104,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_2_AB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_2_AB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MOUSE_AND_ME_3: {
    libro: LibroCompleto.MOUSE_AND_ME_3,
    cantidadPg: 124,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_ENGLISH_TRIP_A_SOLO_PB: {
    libro: LibroCompleto.MY_ENGLISH_TRIP_A_PB,
    cantidadPg: 82,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_3_WB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_3_WB,
    cantidadPg: 75,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MANSCHEN_A1_1KB: {
    libro: LibroCompleto.MANSCHEN_A1_1KB,
    cantidadPg: 100,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_3_SB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_3_SB,
    cantidadPg: 117,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LINK_IT_2_SB_WB: {
    libro: LibroCompleto.LINK_IT_2_SB_WB,
    cantidadPg: 179,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_CODE_3_PB: {
    libro: LibroCompleto.ENGLISH_CODE_3_PB,
    cantidadPg: 140,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_4_SB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_4_SB,
    cantidadPg: 133,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_4_WB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_4_WB,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BINARITA_3: {
    libro: LibroCompleto.BINARITA_3,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  CUADERNO_ALUMNO: {
    libro: LibroCompleto.CUADERNO_ALUMNO,
    cantidadPg: 100,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  METRO_STARTER: {
    libro: LibroCompleto.METRO_STARTER,
    cantidadPg: 164,
    especificacion_defecto: [Especificaciones.SUELTO]
  },
  N100: {
    libro: LibroCompleto.N100,
    cantidadPg: 124,
    especificacion_defecto: [Especificaciones.SUELTO]
  },
  OWN_IT_2_SB: {
    libro: LibroCompleto.OWN_IT_2_SB,
    cantidadPg: 141,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OWN_IT_2_WB: {
    libro: LibroCompleto.OWN_IT_2_WB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GUARDIANES_DE_MUNDO_2: {
    libro: LibroCompleto.GUARDIANES_DE_MUNDO_2,
    cantidadPg: 100,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PLANET_WARRIORS_1: {
    libro: LibroCompleto.PLANET_WARRIORS_1,
    cantidadPg: 105,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FOCUS_5_SB: {
    libro: LibroCompleto.FOCUS_5_SB,
    cantidadPg: 160,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FOCUS_5_WB: {
    libro: LibroCompleto.FOCUS_5_WB,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NATURALES_1: {
    libro: LibroCompleto.NATURALES_1,
    cantidadPg: 126,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  CIENCIAS_NATURALES_1_CHIMENTI: {
    libro: LibroCompleto.CIENCIAS_NATURALES_1_CHIMENTI,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_1_WB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_1_WB,
    cantidadPg: 80,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_1_SB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_1_SB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PLANET_WARRIORS_2: {
    libro: LibroCompleto.PLANET_WARRIORS_2,
    cantidadPg: 105,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DREAM_MAKERS_2: {
    libro: LibroCompleto.DREAM_MAKERS_2,
    cantidadPg: 154,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HARMONIZE_STARTER_WB: {
    libro: LibroCompleto.HARMONIZE_STARTER_WB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HARMONIZE_STARTER_SB: {
    libro: LibroCompleto.HARMONIZE_STARTER_SB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_S_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_S_AB,
    cantidadPg: 76,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_S_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_S_CB,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GUARDIANES_DE_MUNDO_5: {
    libro: LibroCompleto.GUARDIANES_DE_MUNDO_5,
    cantidadPg: 220,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DREAM_MAKERS_1: {
    libro: LibroCompleto.DREAM_MAKERS_1,
    cantidadPg: 156,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_ADVANCED_PLUS: {
    libro: LibroCompleto.ENGLISH_FILE_ADVANCED_PLUS,
    cantidadPg: 162,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  VUELTA_MANZANA_2: {
    libro: LibroCompleto.VUELTA_MANZANA_2,
    cantidadPg: 264,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_A1_SB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_A1_SB,
    cantidadPg: 144,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_A1_WB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_A1_WB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_1: {
    libro: LibroCompleto.SUPER_MINDS_1,
    cantidadPg: 132,
    adhesivos: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ, Especificaciones.ADHESIVO]
  },
  SUPER_MINDS_1_AB: {
    libro: LibroCompleto.SUPER_MINDS_1_AB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_2_SB: {
    libro: LibroCompleto.SUPER_MINDS_2_SB,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_4_SB: {
    libro: LibroCompleto.I_SUCCEED_4_SB,
    cantidadPg: 134,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_4_WB: {
    libro: LibroCompleto.I_SUCCEED_4_WB,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DREAM_MAKERS_3: {
    libro: LibroCompleto.DREAM_MAKERS_3,
    cantidadPg: 152,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_2_SB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_2_SB,
    cantidadPg: 126,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  I_SUCCEED_IN_ENGLISH_2_WB: {
    libro: LibroCompleto.I_SUCCEED_IN_ENGLISH_2_WB,
    cantidadPg: 75,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OWN_1_WB: {
    libro: LibroCompleto.OWN_1_WB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OWN_1_SB: {
    libro: LibroCompleto.OWN_1_SB,
    cantidadPg: 142,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_4_SB: {
    libro: LibroCompleto.GO_GETTER_4_SB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GO_GETTER_4_WB: {
    libro: LibroCompleto.GO_GETTER_4_WB,
    cantidadPg: 108,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEADWAY_UPPER_INTERMEDIATE_WB: {
    libro: LibroCompleto.HEADWAY_UPPER_INTERMEDIATE_WB,
    cantidadPg: 98,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEADWAY_UPPER_INTERMEDIATE_SB: {
    libro: LibroCompleto.HEADWAY_UPPER_INTERMEDIATE_SB,
    cantidadPg: 172,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TOGETHER_STARTER: {
    libro: LibroCompleto.TOGETHER_STARTER,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_4_SB: {
    libro: LibroCompleto.SUPER_MINDS_4_SB,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_4_WB: {
    libro: LibroCompleto.SUPER_MINDS_4_WB,
    cantidadPg: 127,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LINK_IT_2_SB_WB_2ED: {
    libro: LibroCompleto.LINK_IT_2_SB_WB_2ED,
    cantidadPg: 176,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_5_AB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_5_AB,
    cantidadPg: 94,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_5_PB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_5_PB,
    cantidadPg: 98,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_3_PB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_3_PB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_3_AB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_3_AB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DREAM_MAKERS_4: {
    libro: LibroCompleto.DREAM_MAKERS_4,
    cantidadPg: 154,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_B2_COURSEBOOK: {
    libro: LibroCompleto.GOLD_B2_COURSEBOOK,
    cantidadPg: 200,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HISTORIA_2DO_A: {
    libro: LibroCompleto.HISTORIA_2DO_A,
    cantidadPg: 202,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_3_SB_WB: {
    libro: LibroCompleto.SUPER_MINDS_3_SB_WB,
    cantidadPg: 247,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SHINE_ON_PLUS_1_SB_PRACTICE: {
    libro: LibroCompleto.SHINE_ON_PLUS_1_SB_PRACTICE,
    cantidadPg: 140,
    adhesivos: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ, Especificaciones.ADHESIVO]
  },
  KIDS_BOX_NEW_GENERATION_4: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_4,
    cantidadPg: 98,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_4_AB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_4_AB,
    cantidadPg: 88,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TEAM_TOGETHER_1_PB: {
    libro: LibroCompleto.TEAM_TOGETHER_1_PB,
    cantidadPg: 120,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TEAM_TOGETHER_1_AB: {
    libro: LibroCompleto.TEAM_TOGETHER_1_AB,
    cantidadPg: 122,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  METRO_2_SB_WB: {
    libro: LibroCompleto.METRO_2_SB_WB,
    cantidadPg: 139,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STORY_FUN_1: {
    libro: LibroCompleto.STORY_FUN_1,
    cantidadPg: 77,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HOME_FUN_1_BOOKLET: {
    libro: LibroCompleto.HOME_FUN_1_BOOKLET,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_2_B1_WB: {
    libro: LibroCompleto.THINK_2_B1_WB,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_2_B1_SB: {
    libro: LibroCompleto.THINK_2_B1_SB,
    cantidadPg: 119,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NOVO_EXPRESSO_1: {
    libro: LibroCompleto.NOVO_EXPRESSO_1,
    cantidadPg: 244,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PLANET_WARRIORS_3: {
    libro: LibroCompleto.PLANET_WARRIORS_3,
    cantidadPg: 108,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GUARDIANES_DE_MUNDO_6: {
    libro: LibroCompleto.GUARDIANES_DE_MUNDO_6,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_STARTER_SB_WB: {
    libro: LibroCompleto.SUPER_MINDS_STARTER_SB_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HOP_INTO_ENGLISH_2: {
    libro: LibroCompleto.HOP_INTO_ENGLISH_2,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DINAMICA_MATEMATICA_5: {
    libro: LibroCompleto.DINAMICA_MATEMATICA_5,
    cantidadPg: 178,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INSIGNIA_SOCIALES_4: {
    libro: LibroCompleto.INSIGNIA_SOCIALES_4,
    cantidadPg: 210,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INSIGNIA_NATURALES_4: {
    libro: LibroCompleto.INSIGNIA_NATURALES_4,
    cantidadPg: 204,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PULSE_2: {
    libro: LibroCompleto.PULSE_2,
    cantidadPg: 158,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.SIMPLE_FAZ]
  },
  PULSE_1: {
    libro: LibroCompleto.PULSE_1,
    cantidadPg: 158,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_A2_PLUS_SB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_A2_PLUS_SB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_A2_PLUS_WB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_A2_PLUS_WB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_A2_SB_WB: {
    libro: LibroCompleto.PREPARE_A2_SB_WB,
    cantidadPg: 157,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MOUSE_AND_ME_2_SB: {
    libro: LibroCompleto.MOUSE_AND_ME_2_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HOP_INTO_ENGLISH_A: {
    libro: LibroCompleto.HOP_INTO_ENGLISH_A,
    cantidadPg: 118,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_3_B1_PLUS_SB: {
    libro: LibroCompleto.THINK_3_B1_PLUS_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_3_B1_PLUS_WB: {
    libro: LibroCompleto.THINK_3_B1_PLUS_WB,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_1_SB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_1_SB,
    cantidadPg: 150,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_1_WB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_1_WB,
    cantidadPg: 113,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LINK_IT_1_SB_WB: {
    libro: LibroCompleto.LINK_IT_1_SB_WB,
    cantidadPg: 176,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_A1_LEVEL_1: {
    libro: LibroCompleto.PREPARE_A1_LEVEL_1,
    cantidadPg: 160,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LINK_IT_4_SB_CB: {
    libro: LibroCompleto.LINK_IT_4_SB_CB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TOGETHER_1_SB_WB: {
    libro: LibroCompleto.TOGETHER_1_SB_WB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_4_B2_SB: {
    libro: LibroCompleto.THINK_4_B2_SB,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  THINK_4_B2_WB: {
    libro: LibroCompleto.THINK_4_B2_WB,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EPB_129_MATEMATICA_4: {
    libro: LibroCompleto.EPB_129_MATEMATICA_4,
    cantidadPg: 109,
  },
  RISE_AND_SHINE_1_PB_AB: {
    libro: LibroCompleto.RISE_AND_SHINE_1_PB_AB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BINARITA_1: {
    libro: LibroCompleto.BINARITA_1,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BICIENCIAS_4: {
    libro: LibroCompleto.BICIENCIAS_4,
    cantidadPg: 248,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_LIBRO_DE_MATE_1: {
    libro: LibroCompleto.EL_LIBRO_DE_MATE_1,
    cantidadPg: 128,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO]
  },
  BICIENCIAS_6: {
    libro: LibroCompleto.BICIENCIAS_6,
    cantidadPg: 252,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LOOK_SB_WB: {
    libro: LibroCompleto.LOOK_SB_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_MINDS_2_AB: {
    libro: LibroCompleto.SUPER_MINDS_2_AB,
    cantidadPg: 124,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_B1_PLUS_WB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_B1_PLUS_WB,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OWN_IT_3_SB: {
    libro: LibroCompleto.OWN_IT_3_SB,
    cantidadPg: 146,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OWN_IT_3_WB: {
    libro: LibroCompleto.OWN_IT_3_WB,
    cantidadPg: 111,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ABRAPALABRA_4: {
    libro: LibroCompleto.ABRAPALABRA_4,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ABRAPALABRA_1: {
    libro: LibroCompleto.ABRAPALABRA_1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ABRAPALABRA_2: {
    libro: LibroCompleto.ABRAPALABRA_2,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LA_PUERTA_ABIERTA: {
    libro: LibroCompleto.LA_PUERTA_ABIERTA,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  RISE_AND_SHINE_PB_AB: {
    libro: LibroCompleto.RISE_AND_SHINE_PB_AB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HARMONIZE_1_WB: {
    libro: LibroCompleto.HARMONIZE_1_WB,
    cantidadPg: 112,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HARMONIZE_1_SB: {
    libro: LibroCompleto.HARMONIZE_1_SB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_BICIENCIAS_5: {
    libro: LibroCompleto.IMAGINA_BICIENCIAS_5,
    cantidadPg: 292,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO]
  },
  LEARNING_LANDS_3_PB: {
    libro: LibroCompleto.LEARNING_LANDS_3_PB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARNING_LANDS_3_AB: {
    libro: LibroCompleto.LEARNING_LANDS_3_AB,
    cantidadPg: 146,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TOGETHER_PLUS_1: {
    libro: LibroCompleto.TOGETHER_PLUS_1,
    cantidadPg: 160,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TOGETHER_PLUS_2: {
    libro: LibroCompleto.TOGETHER_PLUS_2,
    cantidadPg: 162,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_1A: {
    libro: LibroCompleto.GET_INVOLVED_1A,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_FARO_Y_LA_FLOR_SOCIALES_4: {
    libro: LibroCompleto.EL_FARO_Y_LA_FLOR_SOCIALES_4,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_FARO_Y_LA_FLOR_NATURALES: {
    libro: LibroCompleto.EL_FARO_Y_LA_FLOR_NATURALES,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FORMULA_B2_COURSEBOOK: {
    libro: LibroCompleto.FORMULA_B2_COURSEBOOK,
    cantidadPg: 176,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FORMULA_B2_EXAM_TRAINER: {
    libro: LibroCompleto.FORMULA_B2_EXAM_TRAINER,
    cantidadPg: 159,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.SUELTO, Especificaciones.DOBLE_FAZ]
  },
  EN_DIALOGO_6: {
    libro: LibroCompleto.EN_DIALOGO_6,
    cantidadPg: 305,
  },
  ODYSSEY_5_SB: {
    libro: LibroCompleto.ODYSSEY_5_SB,
    cantidadPg: 113,
    adhesivos: 8,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ, Especificaciones.ADHESIVO]
  },
  ODYSSEY_5_AB: {
    libro: LibroCompleto.ODYSSEY_5_AB,
    cantidadPg: 123,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SUPER_COOL_1: {
    libro: LibroCompleto.SUPER_COOL_1,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_6_AB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_6_AB,
    cantidadPg: 131,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BRIGHTER_IDEAS_6_CB: {
    libro: LibroCompleto.BRIGHTER_IDEAS_6_CB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_BICIENCIAS_6: {
    libro: LibroCompleto.IMAGINA_BICIENCIAS_6,
    cantidadPg: 292,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_MATEMATICA_6: {
    libro: LibroCompleto.IMAGINA_MATEMATICA_6,
    cantidadPg: 164,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_MATEMATICA_5: {
    libro: LibroCompleto.IMAGINA_MATEMATICA_5,
    cantidadPg: 164,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_MATEMATICA_4: {
    libro: LibroCompleto.IMAGINA_MATEMATICA_4,
    cantidadPg: 164,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_MATEMATICA_1: {
    libro: LibroCompleto.IMAGINA_MATEMATICA_1,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ORTOGRAFIA_PARA_DAR_EN_LA_TECLA_4: {
    libro: LibroCompleto.ORTOGRAFIA_PARA_DAR_EN_LA_TECLA_4,
    cantidadPg: 84,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_BICIENCIAS_4: {
    libro: LibroCompleto.IMAGINA_BICIENCIAS_4,
    cantidadPg: 292,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_BICIENCIAS_3: {
    libro: LibroCompleto.IMAGINA_BICIENCIAS_3,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_BICIENCIAS_2: {
    libro: LibroCompleto.IMAGINA_BICIENCIAS_2,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_BICIENCIAS_1: {
    libro: LibroCompleto.IMAGINA_BICIENCIAS_1,
    cantidadPg: 132,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_MATEMATICA_2: {
    libro: LibroCompleto.IMAGINA_MATEMATICA_2,
    cantidadPg: 134,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  IMAGINA_MATEMATICA_3: {
    libro: LibroCompleto.IMAGINA_MATEMATICA_3,
    cantidadPg: 126,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NUEVO_TALLER_DE_LETRAS_Y_NUMEROS_1: {
    libro: LibroCompleto.NUEVO_TALLER_DE_LETRAS_Y_NUMEROS_1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NUEVO_TALLER_DE_LETRAS_Y_NUMEROS_3: {
    libro: LibroCompleto.NUEVO_TALLER_DE_LETRAS_Y_NUMEROS_3,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_LIBRO_DE_MATE_6: {
    libro: LibroCompleto.EL_LIBRO_DE_MATE_6,
    cantidadPg: 3,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_6_PB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_6_PB,
    cantidadPg: 96,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_6_WB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_6_WB,
    cantidadPg: 94,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_3B: {
    libro: LibroCompleto.GET_INVOLVED_3B,
    cantidadPg: 6,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LIFE_VISION_UPPER_INTERMEDIATE_SB: {
    libro: LibroCompleto.LIFE_VISION_UPPER_INTERMEDIATE_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LIFE_VISION_UPPER_INTERMEDIATE_WB: {
    libro: LibroCompleto.LIFE_VISION_UPPER_INTERMEDIATE_WB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GUARDIANES_DE_MUNDO_3: {
    libro: LibroCompleto.GUARDIANES_DE_MUNDO_3,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LINK_IT_3_SB_WB: {
    libro: LibroCompleto.LINK_IT_3_SB_WB,
    cantidadPg: 3,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_B1_PLUS_SB: {
    libro: LibroCompleto.GET_INVOLVED_B1_PLUS_SB,
    cantidadPg: 8,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DREAM_MAKERS_5: {
    libro: LibroCompleto.DREAM_MAKERS_5,
    cantidadPg: 155,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INSIGNIA_BICIENCIA_5: {
    libro: LibroCompleto.INSIGNIA_BICIENCIA_5,
    cantidadPg: 335,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INSIGNIA_LENGUAJE_5: {
    libro: LibroCompleto.INSIGNIA_LENGUAJE_5,
    cantidadPg: 121,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_1_PB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_1_PB,
    cantidadPg: 200,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_BOX_NEW_GENERATION_1_AB: {
    libro: LibroCompleto.KIDS_BOX_NEW_GENERATION_1_AB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SILVESTRE_2: {
    libro: LibroCompleto.SILVESTRE_2,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SILVESTRE_3: {
    libro: LibroCompleto.SILVESTRE_3,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PEREGRINOS_UNIDOS_2_ORACIONES_Y_RESPUESTAS: {
    libro: LibroCompleto.PEREGRINOS_UNIDOS_2_ORACIONES_Y_RESPUESTAS,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_NOW_2_CB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_2_CB,
    cantidadPg: 104,
    adhesivos: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ, Especificaciones.ADHESIVO]
  },
  LEARN_WITH_US_NOW_2_AB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_2_AB,
    cantidadPg: 3,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LIFE_VISION_PRE_INT_A2_B1_SB: {
    libro: LibroCompleto.LIFE_VISION_PRE_INT_A2_B1_SB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LIFE_VISION_PRE_INT_A2_B1_WB: {
    libro: LibroCompleto.LIFE_VISION_PRE_INT_A2_B1_WB,
    cantidadPg: 3,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_1_SB: {
    libro: LibroCompleto.WIDER_WORLD_1_SB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SOC_1: {
    libro: LibroCompleto.SOC_1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DIMENSION_SOCIALES: {
    libro: LibroCompleto.DIMENSION_SOCIALES,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_EQUIPO_DE_MATE_6: {
    libro: LibroCompleto.EL_EQUIPO_DE_MATE_6,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SHINE_ON_PLUS_3: {
    libro: LibroCompleto.SHINE_ON_PLUS_3,
    adhesivos: 2,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ, Especificaciones.ADHESIVO]
  },
  SHERLOCK: {
    libro: LibroCompleto.SHERLOCK,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_A2_PLUS_SB: {
    libro: LibroCompleto.GET_INVOLVED_A2_PLUS_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_A2_PLUS_WB: {
    libro: LibroCompleto.GET_INVOLVED_A2_PLUS_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NAT_1: {
    libro: LibroCompleto.NAT_1,
    cantidadPg: 0,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ME_GUSTA_NATURALES_1: {
    libro: LibroCompleto.ME_GUSTA_NATURALES_1,
    cantidadPg: 249,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_NOW_3_SB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_3_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_2_SB: {
    libro: LibroCompleto.WIDER_WORLD_2_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_2_AB: {
    libro: LibroCompleto.WIDER_WORLD_2_AB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PEREGRINOS_UNIDOS_3: {
    libro: LibroCompleto.PEREGRINOS_UNIDOS_3,
    cantidadPg: 3,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LINK_IT_1A: {
    libro: LibroCompleto.LINK_IT_1A,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  EL_FARO_Y_LA_FLOR_SOCIALES_6: {
    libro: LibroCompleto.EL_FARO_Y_LA_FLOR_SOCIALES_6,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HISTORIA_2_MANDIOCA: {
    libro: LibroCompleto.HISTORIA_2_MANDIOCA,
    cantidadPg: 223,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LA_AVENTURA_DE_JESUS_2: {
    libro: LibroCompleto.LA_AVENTURA_DE_JESUS_2,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  CON_JESUS_A_LA_AVENTURA_6: {
    libro: LibroCompleto.CON_JESUS_A_LA_AVENTURA_6,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_INTRO_A: {
    libro: LibroCompleto.GET_INVOLVED_INTRO_A,
    cantidadPg: 10,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_3A: {
    libro: LibroCompleto.WIDER_WORLD_3A,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STARTS_AND_HEROES_2_SB: {
    libro: LibroCompleto.STARTS_AND_HEROES_2_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STARTS_AND_HEROES_2_WB: {
    libro: LibroCompleto.STARTS_AND_HEROES_2_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NUEVO_MATEMATICA_PARA_ARMAR_4: {
    libro: LibroCompleto.NUEVO_MATEMATICA_PARA_ARMAR_4,
    cantidadPg: 2,
  },
  LEARN_WITH_US_NOW_3_WB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_3_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_NOW_1_AB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_1_AB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_NOW_1_CB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_1_CB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DIMENSION_PARALELA_HISTORIA_1: {
    libro: LibroCompleto.DIMENSION_PARALELA_HISTORIA_1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_3_SB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_3_SB,
    cantidadPg: 0,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  MY_DISNEY_STARS_AND_HEROES_3_WB: {
    libro: LibroCompleto.MY_DISNEY_STARS_AND_HEROES_3_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_3A: {
    libro: LibroCompleto.GET_INVOLVED_3A,
    cantidadPg: 116,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OXFORD_THINKERS_1_CB: {
    libro: LibroCompleto.OXFORD_THINKERS_1_CB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OXFORD_THINKERS_1_AB: {
    libro: LibroCompleto.OXFORD_THINKERS_1_AB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KEEP_IT_A1: {
    libro: LibroCompleto.KEEP_IT_A1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_B2: {
    libro: LibroCompleto.GOLD_EXPERIENCE_B2,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_WEB_1: {
    libro: LibroCompleto.KIDS_WEB_1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KIDS_WEB_3: {
    libro: LibroCompleto.KIDS_WEB_3,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  KEEP_IT_A2: {
    libro: LibroCompleto.KEEP_IT_A2,
    cantidadPg: 3,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TOGETHER_PLUS_3: {
    libro: LibroCompleto.TOGETHER_PLUS_3,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_2A_SB_AB: {
    libro: LibroCompleto.WIDER_WORLD_2A_SB_AB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ME_GUSTA_SOCIALES_1: {
    libro: LibroCompleto.ME_GUSTA_SOCIALES_1,
    cantidadPg: 268,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  CUIDEMOS_LA_VIDA_2: {
    libro: LibroCompleto.CUIDEMOS_LA_VIDA_2,
    cantidadPg: 121,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  METRO_1_SB_WB: {
    libro: LibroCompleto.METRO_1_SB_WB,
    cantidadPg: 157,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  NUOVO_EXPRESSO_PLUS_1: {
    libro: LibroCompleto.NUOVO_EXPRESSO_PLUS_1,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SHINE_ON_PLUS_5_SB: {
    libro: LibroCompleto.SHINE_ON_PLUS_5_SB,
    cantidadPg: 137,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SHINE_ON_PLUS_5_WB: {
    libro: LibroCompleto.SHINE_ON_PLUS_5_WB,
    cantidadPg: 64,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GATEWAY_TO_THE_WORLD_B1_SB: {
    libro: LibroCompleto.GATEWAY_TO_THE_WORLD_B1_SB,
    cantidadPg: 156,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_A2_LVL_3_SB: {
    libro: LibroCompleto.PREPARE_A2_LVL_3_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_A2_LVL_3_WB: {
    libro: LibroCompleto.PREPARE_A2_LVL_3_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OXFORD_THINKERS_2_CB: {
    libro: LibroCompleto.OXFORD_THINKERS_2_CB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OXFORD_THINKERS_2_AB: {
    libro: LibroCompleto.OXFORD_THINKERS_2_AB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_B1_SB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_B1_SB,
    cantidadPg: 178,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  OUR_STORIES_2: {
    libro: LibroCompleto.OUR_STORIES_2,
    cantidadPg: 154,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_1_SB_ED_VIEJA: {
    libro: LibroCompleto.WIDER_WORLD_1_SB_ED_VIEJA,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  WIDER_WORLD_1_WB_ED_VIEJA: {
    libro: LibroCompleto.WIDER_WORLD_1_WB_ED_VIEJA,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  DROPLETS_2_SB_ED_2025: {
    libro: LibroCompleto.DROPLETS_2_SB_ED_2025,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_A2_LEVEL_2_SB: {
    libro: LibroCompleto.PREPARE_A2_LEVEL_2_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PREPARE_A2_LEVEL_2_WB: {
    libro: LibroCompleto.PREPARE_A2_LEVEL_2_WB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TEAM_TOGETHER_3_PB: {
    libro: LibroCompleto.TEAM_TOGETHER_3_PB,
    cantidadPg: 134,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ESERCIZIARIO: {
    libro: LibroCompleto.ESERCIZIARIO,
    cantidadPg: 92,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  TIMONEL: {
    libro: LibroCompleto.TIMONEL,
    cantidadPg: 256,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SHINE_ON_PLUS_4_SB: {
    libro: LibroCompleto.SHINE_ON_PLUS_4_SB,
    cantidadPg: 136,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  SHINE_ON_PLUS_4_WB: {
    libro: LibroCompleto.SHINE_ON_PLUS_4_WB,
    cantidadPg: 66,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HARMONIZE_2_SB: {
    libro: LibroCompleto.HARMONIZE_2_SB,
    cantidadPg: 131,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HARMONIZE_2_WB: {
    libro: LibroCompleto.HARMONIZE_2_WB,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INSIGHT_INTERMEDIATE_SB: {
    libro: LibroCompleto.INSIGHT_INTERMEDIATE_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  INSIGHT_INTERMEDIATE_WB: {
    libro: LibroCompleto.INSIGHT_INTERMEDIATE_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  BINARITA_2_NUEVA_ED: {
    libro: LibroCompleto.BINARITA_2_NUEVA_ED,
    cantidadPg: 1,
  },
  ENGLISH_FILE_UPER_INTERMEDIATE_SB: {
    libro: LibroCompleto.ENGLISH_FILE_UPER_INTERMEDIATE_SB,
    cantidadPg: 170,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GOLD_EXPERIENCE_B1_WB: {
    libro: LibroCompleto.GOLD_EXPERIENCE_B1_WB,
    cantidadPg: 0,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_PRE_INTERMEDIATE_SB: {
    libro: LibroCompleto.ENGLISH_FILE_PRE_INTERMEDIATE_SB,
    cantidadPg: 169,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_PRE_INTERMEDIATE_WB: {
    libro: LibroCompleto.ENGLISH_FILE_PRE_INTERMEDIATE_WB,
    cantidadPg: 98,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  STARS_AND_FRIENDS_2_SB: {
    libro: LibroCompleto.STARS_AND_FRIENDS_2_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEADWAY_INTERMEDIATE_SB: {
    libro: LibroCompleto.HEADWAY_INTERMEDIATE_SB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  HEADWAY_INTERMEDIATE_WB: {
    libro: LibroCompleto.HEADWAY_INTERMEDIATE_WB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_INTERMEDIATE_SB: {
    libro: LibroCompleto.ENGLISH_FILE_INTERMEDIATE_SB,
    cantidadPg: 169,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  ENGLISH_FILE_INTERMEDIATE_WB: {
    libro: LibroCompleto.ENGLISH_FILE_INTERMEDIATE_WB,
    cantidadPg: 85,
    especificacion_defecto: [Especificaciones.BLANCO_Y_NEGRO, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  FLAGSHIP_2: {
    libro: LibroCompleto.FLAGSHIP_2,
    cantidadPg: 114,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  PUERTO_EN_CIENCIAS_6_CARPETA_ACT: {
    libro: LibroCompleto.PUERTO_EN_CIENCIAS_6_CARPETA_ACT,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GIVE_ME_FIVE_2_CB: {
    libro: LibroCompleto.GIVE_ME_FIVE_2_CB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GIVE_ME_FIVE_2_WB: {
    libro: LibroCompleto.GIVE_ME_FIVE_2_WB,
    cantidadPg: 2,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  READY_FOR_FIRST_B2: {
    libro: LibroCompleto.READY_FOR_FIRST_B2,
    cantidadPg: 284,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  GET_INVOLVED_B1_SB: {
    libro: LibroCompleto.GET_INVOLVED_B1_SB,
    cantidadPg: 130,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_NOW_4_SB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_4_SB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
  LEARN_WITH_US_NOW_4_WB: {
    libro: LibroCompleto.LEARN_WITH_US_NOW_4_WB,
    cantidadPg: 1,
    especificacion_defecto: [Especificaciones.COLOR, Especificaciones.ANILLADO, Especificaciones.DOBLE_FAZ]
  },
} as const satisfies Record<string, LibroLocalProp>;

export type LibroLocalDefault = (typeof LibroLocal)[keyof typeof LibroLocal];