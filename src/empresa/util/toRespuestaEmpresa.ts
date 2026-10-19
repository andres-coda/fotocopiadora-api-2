import { EmpresaRetorno } from "../retorno/empresa.retorno";
import { ConfiguracionEmpresaMia } from "../retorno/empresaMia.retorno";

export const toRespuestaEmpresa = (dato: ConfiguracionEmpresaMia):EmpresaRetorno => {
  const empresa = new EmpresaRetorno({...dato});
  empresa.agregarConfiguracion({...dato});
  return empresa;
}