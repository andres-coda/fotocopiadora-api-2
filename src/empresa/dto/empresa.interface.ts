import { BaseRetornoProp } from "@src/base/retorno/base.retorno";

export interface EmpresaByLibroRetornoProps extends BaseRetornoProp{
  nombre:string;
  email:string;
  telefono: string;
  total: number;
}