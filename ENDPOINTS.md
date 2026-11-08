# foto-api — Índice de endpoints

Base URL: `http://localhost:3000` (configurable por `BASE` en el front).

Convención: todos los endpoints (salvo `/auth/login`) requieren `Authorization: Bearer <token>` (UsuarioGuard). Los guards adicionales se indican por endpoint.

Leyenda de guards:
- **U** = UsuarioGuard (autenticado)
- **A** = AdminGuard (admin o super_admin)
- **S** = SuperAdminGuard (super_admin exclusivo)

---

## Auth (`/auth`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| POST | `/auth/login` | — | Login con nombre y password. Devuelve JWT. |
| GET | `/auth/profile` | U | Perfil del usuario autenticado (payload del JWT). |

## Base (`/base`) — genérico para entidades que extienden Base
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/base` | U | Listado paginado de la entidad. |
| GET | `/base/:id` | U | Obtiene una entidad por id. |
| POST | `/base` | U | Crea una entidad. |
| PUT | `/base/:id` | U | Edita una entidad. |
| DELETE | `/base/:id` | U | Borrado lógico. |
| DELETE | `/base/:id/eliminar` | U | Borrado físico. |
| PATCH | `/base/:id/rehacer` | U | Restaura un borrado lógico. |

## Cliente (`/cliente`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/cliente` | U | Listado de clientes de la empresa. |
| GET | `/cliente/idCliente` | U | Obtiene cliente por idCliente. |

## Componente (`/componente`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/componente` | U | Listado de componentes. |

## Configuración (`/configuracion`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/configuracion` | U | Obtiene la configuración de la empresa. |
| PUT | `/configuracion` | U | Edita la configuración. |

## Dato de cobro (`/dato-cobro`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/dato-cobro` | U | Listado paginado. |
| GET | `/dato-cobro/nombre` | U | Búsqueda por nombre (ILIKE). |
| GET | `/dato-cobro/:id` | U | Obtiene por id. |
| POST | `/dato-cobro` | A | Crea un dato de cobro. |
| PUT | `/dato-cobro/:id` | A | Edita un dato de cobro. |
| DELETE | `/dato-cobro/:id` | A | Elimina un dato de cobro. |

## Editorial (`/editorial`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/editorial` | U | Listado de editoriales. |

## Empresa (`/empresa`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/empresa` | U | Listado paginado de empresas. |
| GET | `/empresa/mia` | U | Empresa del usuario autenticado (desde el token). |
| GET | `/empresa/:id` | U | Obtiene empresa por id (vista completa). |
| POST | `/empresa` | S | Crea empresa + precios default + primer admin. |
| PUT | `/empresa/:id` | U | Edita empresa. |
| DELETE | `/empresa/:id` | S | Borrado lógico de empresa. |

## Especificación (`/especificacion`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/especificacion` | U | Listado. |
| GET | `/especificacion/:id` | U | Obtiene por id. |
| POST | `/especificacion` | U | Crea. |
| PUT | `/especificacion/:idEsp` | U | Edita. |
| DELETE | `/especificacion/:idEsp` | U | Elimina. |

## Libro (`/libro`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/libro/completo` | U | Libro completo. |
| GET | `/libro/nombre` | U | Búsqueda por nombre. |
| GET | `/libro/:idLibro` | U | Obtiene libro por id. |
| GET | `/libro` | U | Listado paginado. |
| POST | `/libro` | U | Crea libro. |
| PATCH | `/libro/:idLibro` | U | Edita datos de empresa del libro. |
| PATCH | `/libro/extra/:idLibro` | U | Edita datos extras. |
| PATCH | `/libro/principal/:idLibro` | U | Edita datos principales. |
| PUT | `/libro/:idLibro` | U | Edita libro. |
| DELETE | `/libro/:idLibro` | S | Elimina libro. |

## Libro stock (`/libro/stock/:idLibro`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| PUT | `/libro/stock/:idLibro` | U | Actualiza stock. |

## Materia (`/materia`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/materia/nombre` | U | Búsqueda por nombre. |
| GET | `/materia/todos` | U | Listado completo. |
| GET | `/materia` | U | Listado. |
| PATCH | `/materia/:id/rehacer` | U | Restaura borrado lógico. |
| DELETE | `/materia/:id/eliminar` | U | Borrado físico. |
| DELETE | `/materia/:id` | U | Borrado lógico. |
| PUT | `/materia/:id` | U | Edita. |

## Mensaje (`/mensaje`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/mensaje` | U | Listado paginado. |
| GET | `/mensaje/nombre` | U | Búsqueda por nombre (ILIKE). |
| GET | `/mensaje/:id` | U | Obtiene por id. |
| POST | `/mensaje` | A | Crea mensaje. |
| PUT | `/mensaje/:id` | A | Edita mensaje. |
| PUT | `/mensaje/:id/favorito` | U | Marca/desmarca favorito. |
| DELETE | `/mensaje/:id` | A | Elimina mensaje. |

## Nivel (`/nivel`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/nivel` | U | Listado de niveles. |

## Pedido (`/pedido`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/pedido/buscar` | U | Búsqueda de pedidos. |
| GET | `/pedido/cliente/:id` | U | Pedidos por cliente. |
| GET | `/pedido` | U | Listado paginado. |
| PATCH | `/pedido/estado/:idPedido` | U | Cambia estado del pedido. |

## Pedido item (`/item`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/item` | U | Listado. |
| GET | `/item/pedido/:idPedido` | U | Items de un pedido. |
| GET | `/item/libro/:idLibro` | U | Items por libro. |
| POST | `/item/:idPedido/pedido` | U | Agrega item a pedido. |
| PUT | `/item/:idPedido/pedido/:nroItem` | U | Edita item. |
| PATCH | `/item/estado/:idPedido/:nroItem` | U | Cambia estado del item. |
| PATCH | `/item/sede/:idPedido/:nroItem` | U | Cambia sede del item. |
| DELETE | `/item/:idPedido/pedido:nroItem` | U | Elimina item. |

## Precio (`/precio`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/precio` | U | Listado. |
| DELETE | `/precio/:id` | U | Elimina. |
| PUT | `/precio/:id` | U | Edita. |

## Precio categoría (`/precio-categoria`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/precio-categoria/todas` | U | Todas las categorías. |
| GET | `/precio-categoria` | U | Listado. |

## Precio empresa (`/precio-empresa`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/precio-empresa` | U | Listado. |
| GET | `/precio-empresa/:idPrecio` | U | Obtiene por id. |
| POST | `/precio-empresa` | U | Crea. |
| PUT | `/precio-empresa/:idPrecio` | U | Edita. |
| DELETE | `/precio-empresa/:idPrecio` | U | Elimina. |

## Propuesta pedido (`/propuesta-pedido`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| DELETE | `/propuesta-pedido/quitar-libros/:id` | U | Quita libros de una propuesta. |
| GET | `/propuesta-pedido/buscar` | U | Búsqueda. |

## Sede (`/sede`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/sede/todas` | A | Todas las sedes (admin). |
| GET | `/sede` | U | Listado. |
| PATCH | `/sede/:id/rehacer` | U | Restaura borrado lógico. |
| DELETE | `/sede/:id` | U | Borrado lógico. |
| POST | `/sede` | A | Crea sede. |
| PUT | `/sede/:id` | A | Edita sede. |

## Solicitud (`/solicitud`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/solicitud` | S | Listado de solicitudes de edición de libros. |
| GET | `/solicitud/:id` | S | Detalle con peticiones. |
| PATCH | `/solicitud/:id` | S | Acepta/rechaza solicitud (+observaciones). |

## Usuario (`/user`)
| Método | Ruta | Guard | Descripción |
|---|---|---|---|
| GET | `/user` | A | Listado de usuarios de la empresa. |
| GET | `/user/empresa/:id` | U | Usuarios por empresa. |
| GET | `/user/:id` | U | Obtiene usuario por id. |
| POST | `/user` | A | Crea usuario. |
| PUT | `/user` | U | Edita propio perfil. |
| PUT | `/user/role` | A | Cambia rol de usuario. |

---

Generado automáticamente a partir de los controllers de `foto-api`.