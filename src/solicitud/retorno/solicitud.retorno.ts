export class SolicitudRetorno {
  id!: string;
  idLibroCompleto!: string;
  nombreLibro!: string;
  fechaCreacion!: Date;
  fechaResolucion!: Date | null;
  idUsuario!: string;
  nombreUsuario!: string;
  estado!: number;
  idEmpresa!: string;
  peticiones!: PeticionRetorno[];

  constructor(partial: Partial<SolicitudRetorno>) {
    Object.assign(this, partial);
  }
}

export class PeticionRetorno {
  id!: string;
  campo!: string;
  valorAnterior!: string | null;
  valorNuevo!: string | null;
  observaciones!: string | null;
  estado!: number;

  constructor(partial: Partial<PeticionRetorno>) {
    Object.assign(this, partial);
  }
}