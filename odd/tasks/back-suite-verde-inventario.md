# Inventario de escenarios silenciados

Extraído de las 18 suites comentadas antes de borrarlas (2026-11-01).
No son aserciones: es el listado de comportamientos que alguien ya pensó.
Se usa como checklist de cobertura al reconstruir, **no** como especificación.

Total: 230 escenarios en 18 suites.

### src/auth/__test__/auth.controller.spec.ts

- **signIn** → debería retornar el token si las credenciales son correctas
- **signIn** → debería lanzar UnauthorizedException si las credenciales son inválidas
- **getUserFromRequest** → debería retornar el usuario si el token es válido
- **getUserFromRequest** → debería lanzar UnauthorizedException si el token no es válido

### src/auth/__test__/auth.service.spec.ts

- **signIn** → debería retornar el token si el email y password son correctos
- **signIn** → debería lanzar UnauthorizedException si el usuario no existe
- **signIn** → debería lanzar UnauthorizedException si la contraseña es incorrecta
- **getUserFromRequest** → debería retornar el usuario decodificado del token si es válido
- **getUserFromRequest** → debería lanzar UnauthorizedException si no hay header de autorización
- **getUserFromRequest** → debería lanzar UnauthorizedException si el formato del token es incorrecto
- **getUserFromRequest** → debería lanzar UnauthorizedException si el token es inválido

### src/base/__test__/base.controller.spec.ts

- **findAll** → debería devolver datos (camino feliz)
- **findAll** → debería manejar error
- **findOne** → debería devolver item (camino feliz)
- **findOne** → debería manejar error
- **undoDeleteConstante** → debería devolver true (camino feliz)
- **undoDeleteConstante** → debería manejar error
- **deleteConstante** → debería eliminar (camino feliz)
- **deleteConstante** → debería manejar error
- **softDeleteConstante** → debería hacer soft delete (camino feliz)
- **softDeleteConstante** → debería manejar error
- **createDato** → debería retornar el elemento que llega
- **createDato** → debería manejar error
- **updateDato** → debería retornar el elemento deseado (camino feliz)
- **updateDato** → debería manejar error

### src/base/__test__/base.service.spec.ts

- **getDato** → [camino feliz] debería obtener datos activos desde repository
- **getDato** → [camino feliz] debería retornar array vacío si no hay datos
- **getDato** → [transacción] debería usar qR.manager.find si se provee QueryRunner
- **getDato** → [error] debería llamar handleExceptions si el repositorio falla
- **getDatoTodos** → [camino feliz] debería obtener todos los datos incluyendo eliminados
- **getDatoTodos** → [camino feliz] debería retornar array vacío si no hay datos
- **getDatoTodos** → [transacción] debería usar qR.manager.find si se provee QueryRunner
- **getDatoTodos** → [error] debería llamar handleExceptions si el repositorio falla
- **getDatoById** → [camino feliz] debería retornar el dato cuando existe
- **getDatoById** → [camino feliz] debería retornar null si el dato no existe
- **getDatoById** → [transacción] debería usar qR.manager.findOne si se provee QueryRunner
- **getDatoById** → [error] debería llamar handleExceptions si el repositorio falla
- **getDatoByIdOrFail** → [camino feliz] debería devolver el dato si existe y no está eliminado
- **getDatoByIdOrFail** → [error] debería lanzar NotFoundException si el dato no existe (null)
- **getDatoByIdOrFail** → [error] debería lanzar NotFoundException si el dato tiene deleted = true
- **getDatoByIdOrFail** → [error] debería incluir entidadError en el mensaje de error si se provee
- **getDatoByIdOrFail** → [transacción] debería usar QueryRunner al buscar el dato internamente
- **getDatoByName** → [camino feliz] debería retornar el dato cuando existe con ese nombre
- **getDatoByName** → [camino feliz] debería retornar null si no existe dato con ese nombre
- **getDatoByName** → [transacción] debería usar qR.manager.findOne si se provee QueryRunner
- **getDatoByName** → [error] debería llamar handleExceptions si el repositorio falla
- **getDatosByNombres** → [camino feliz] debería retornar los datos que coincidan con los nombres
- **getDatosByNombres** → [camino feliz] debería retornar array vacío si se pasa lista de nombres vacía
- **getDatosByNombres** → [transacción] debería usar qR.manager.find si se provee QueryRunner
- **getDatosByNombres** → [error] debería llamar handleExceptions si el repositorio falla
- **getDatosByIds** → [camino feliz] debería retornar múltiples datos por ids
- **getDatosByIds** → [error] debería propagar NotFoundException si algún id no existe
- **getDatosByIds** → [transacción] debería propagar el QueryRunner a getDatoByIdOrFail
- **softDelete** → [camino feliz] debería marcar deleted=true y retornar true
- **softDelete** → [camino feliz] debería emitir evento gateway al hacer soft delete
- **softDelete** → [transacción] debería usar qR.manager.save si se provee QueryRunner
- **softDelete** → [error] debería propagar el error si getDatoByIdOrFail falla
- **softDelete** → [error] debería lanzar error si save retorna falsy
- **undoDelete** → [camino feliz] debería revertir deleted a false y retornar true
- **undoDelete** → [camino feliz] debería emitir evento gateway al restaurar
- **undoDelete** → [transacción] debería usar qR.manager.save si se provee QueryRunner
- **undoDelete** → [transacción] no debería emitir gateway cuando se usa QueryRunner
- **undoDelete** → [error] debería lanzar NotFoundException si el dato no existe
- **undoDelete** → [error] debería lanzar error si save retorna falsy
- **delete** → [camino feliz] debería eliminar físicamente el dato y retornar true
- **delete** → [camino feliz] debería emitir evento gateway al eliminar físicamente
- **delete** → [transacción] debería usar qR.manager.remove si se provee QueryRunner
- **delete** → [transacción] no debería emitir gateway cuando se usa QueryRunner
- **delete** → [error] debería propagar el error si getDatoByIdOrFail falla
- **createDatoCx** → [camino feliz] debería crear el dato, hacer commit y retornar el DTO
- **createDatoCx** → [error] debería hacer rollback y lanzar error si createDato falla
- **createDatoCx** → [error] debería llamar qR.release incluso cuando ocurre un error (finally)
- **updateElementoController** → [camino feliz] debería actualizar el dato, hacer commit y retornar el DTO
- **updateElementoController** → [camino feliz] no debería emitir gateway si isQr es false
- **updateElementoController** → [error] debería hacer rollback si updateDato falla
- **updateElementoController** → [error] debería lanzar NotFoundException si updateDato retorna falsy
- **updateElementoController** → [error] debería llamar qR.release incluso cuando ocurre un error (finally)
- **createElementoDefault** → [camino feliz] debería crear todos los elementos del array defecto
- **createElementoDefault** → [camino feliz] debería retornar array vacío si defecto está vacío
- **createElementoDefault** → [error] debería llamar handleExceptions si createDato falla
- **mergeSelected** → [camino feliz] debería mergear propiedades simples de ambos objetos
- **mergeSelected** → [camino feliz] debería mergear objetos anidados recursivamente
- **mergeSelected** → [camino feliz] debería retornar override si base es undefined
- **mergeSelected** → [camino feliz] override debería tener prioridad sobre base en conflicto
- **mergeRelations** → [camino feliz] debería retornar BASE_RELATIONS si no se provee nada
- **mergeRelations** → [camino feliz] debería retornar solo la relacionBase si no hay input
- **mergeRelations** → [camino feliz] debería mergear input con relacionBase
- **mergeRelations** → [camino feliz] debería aceptar un array de inputs y mergearlos todos

### src/cliente/__test__/cliente.service.spec.ts

- **getDatoByTelefono** → [camino feliz] debería devolver el cliente cuando existe
- **getDatoByTelefono** → [camino feliz] debería devolver null cuando no encuentra el cliente
- **getDatoByTelefono** → [transacción] debería usar qR.manager.findOne si se provee QueryRunner
- **getDatoByTelefono** → [error] debería llamar handleExceptions si el repositorio falla
- **getDatoByEmail** → [camino feliz] debería devolver el cliente cuando existe
- **getDatoByEmail** → [camino feliz] debería devolver null cuando no encuentra el cliente
- **getDatoByEmail** → [transacción] debería usar qR.manager.findOne si se provee QueryRunner
- **getDatoByEmail** → [error] debería llamar handleExceptions si el repositorio falla
- **clienteExistente** → [camino feliz] debería devolver cliente si lo encuentra por teléfono
- **clienteExistente** → [camino feliz] debería buscar por email si no encuentra por teléfono
- **clienteExistente** → [camino feliz] debería devolver null si no encuentra ni por teléfono ni por email
- **clienteExistente** → [transacción] debería propagar el QueryRunner a getDatoByTelefono y getDatoByEmail
- **clienteExistente** → [error] debería llamar handleExceptions si getDatoByTelefono falla
- **clienteExistente** → [error] debería llamar handleExceptions si getDatoByEmail falla
- **createDato** → [camino feliz] debería crear cliente nuevo con teléfono
- **createDato** → [camino feliz] debería crear cliente nuevo con email si no hay teléfono
- **createDato** → [camino feliz] debería emitir evento gateway al crear sin QueryRunner
- **createDato** → [camino feliz] debería retornar cliente existente sin crear uno nuevo si ya existe y no viene de pedido
- **createDato** → [camino feliz] debería actualizar resumen si el cliente ya existe y vienePedido=true
- **createDato** → [transacción] debería usar qR.manager.save y no emitir gateway
- **createDato** → [error] debería lanzar error si no se proporciona teléfono ni email
- **createDato** → [error] debería llamar handleExceptions si el repositorio save falla
- **createDato** → [error] debería llamar handleExceptions si createDatoXEntidad falla
- **updateDato** → [camino feliz] debería actualizar el cliente y retornar { dato, isQr: true }
- **updateDato** → [camino feliz] debería actualizar solo los campos enviados (update parcial)
- **updateDato** → [camino feliz] debería emitir evento gateway si no hay QueryRunner
- **updateDato** → [transacción] debería usar qR.manager.save y no emitir gateway
- **updateDato** → [error] debería llamar handleExceptions si getDatoByIdOrFail falla
- **updateDato** → [error] debería llamar handleExceptions si el save falla
- **getDatoCx** → [camino feliz] debería retornar clientes con contadores de pedidos calculados
- **getDatoCx** → [camino feliz] debería retornar array vacío si no hay clientes
- **getDatoCx** → [camino feliz] debería contar correctamente pedidos pendientes
- **getDatoCx** → [camino feliz] debería contar correctamente pedidos listos
- **getDatoCx** → [error] debería llamar handleExceptions si el repositorio falla
- **remplaceToReturn** → [camino feliz] debería mapear correctamente la entidad al DTO de respuesta
- **remplaceToReturn** → [camino feliz] debería incluir el resumen mapeado por resumenService.remplaceToReturn

### src/componente/__test__/componente.service.spec.ts

- **createDato** → ✔️ debería crear una sede correctamente
- **createDato** → ✔️ debería devolver una sede existente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar una sede
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update

### src/error/__test__/error.service.spec.ts

- **handleExceptions** → debería mapear ConflictException a HttpException 409
- **handleExceptions** → debería relanzar HttpException sin modificar
- **handleExceptions** → debería mapear error genérico a HttpException 500
- **handleExceptions** → debería manejar error sin message (fallback)

### src/especificacion/__test__/especificacion.service.spec.ts

- **createDato** → ✅ debería crear una especificación (sin transacción)
- **createDato** → ✅ debería devolver existente si ya existe
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✅ debería actualizar correctamente
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update
- **getDatosByNombres** → ✅ debería retornar vacío si nombres está vacío
- **getDatosByNombres** → ✅ debería buscar en repository
- **getDatosByNombres** → 🔁 debería usar QueryRunner
- **getDatosByNombres** → ❌ debería manejar errores

### src/libro/__test__/libro.service.spec.ts

- **createDato** → ✔️ debería crear un libro correctamente
- **createDato** → ✔️ debería devolver libro existente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar libro
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update
- **agregarStock** → ✅ debería agregar stock correctamente
- **agregarStock** → ❌ debería manejar errores con erroresService
- **agregarStockCx** → ✅ debería hacer commit y devolver true
- **agregarStockCx** → ❌ debería hacer rollback si falla
- **agregarStockCx** → 🧹 siempre debería liberar el QueryRunner
- **quitarStockCx** → ✅ debería convertir stock a negativo y hacer commit
- **quitarStockCx** → ❌ debería hacer rollback si falla

### src/materia/__test__/materia.service.spec.ts

- **createDato** → ✔️ debería crear una materia correctamente
- **createDato** → ✔️ debería devolver materia existente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar precio
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update

### src/pedido/__test__/pedido.service.spec.ts

- **createDato** → ✔️ debería crear un pedido correctamente con el id del cliente
- **createDato** → ✔️ debería crear un pedido correctamente con datos del cliente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar libro
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update

### src/pedido_item/__test__/libro_pedido.controller.spec.ts

- **cambiarEstado** → ✅ debería llamar al service con el dto correcto y devolver true
- **cambiarEstado** → ❌ debería devolver false si el service devuelve null
- **cambiarEstado** → 💥 debería propagar error del service
- **cambiarEstado** → 🧪 debería enviar correctamente distintos estados

### src/pedido_item/__test__/libro_pedido.service.spec.ts

- **createDato** → ✅ debería crear un pedido libro correctamente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✅ debería actualizar el pedido libro correctamente
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update
- **cambiarEstadoCx** → ✅ debería hacer commit y actualizar estado
- **cambiarEstadoCx** → ❌ debería hacer rollback si falla
- **cambiarEstadoCx** → 🧹 siempre libera QueryRunner

### src/precio/__test__/precio.service.spec.ts

- **createDato** → ✔️ debería crear un precio correctamente
- **createDato** → ✔️ debería devolver precio existente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar precio
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update

### src/propuesta_pedido/__test__/propuesta_pedido.service.spec.ts

- **createDato** → ✔️ debería crear una propuesta correctamente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar precio
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update

### src/sede/__test__/sede.service.spec.ts

- **createDato** → ✔️ debería crear una sede correctamente
- **createDato** → ✔️ debería devolver una sede existente
- **createDato** → 🔁 debería usar QueryRunner si existe
- **createDato** → ❌ debería manejar errores con erroresService
- **updateDato** → ✔️ debería actualizar una sede
- **updateDato** → 🔁 debería usar QueryRunner en update
- **updateDato** → ❌ debería manejar errores en update

### src/user/__test__/user.controller.spec.ts

- **getUsuarioById** → ✔️ debería devolver usuario si es el mismo
- **getUsuarioById** → ❌ debería lanzar error si no coincide el id
- **getUsuarioById** → ❌ debería lanzar error si no hay usuario en request
- **createUsuario** → ✔️ debería crear usuario y devolver token
- **createUsuario** → ❌ debería lanzar error si no se crea el usuario
- **updateUsuario** → ✔️ debería actualizar usuario normal
- **updateUsuario** → ✔️ debería modificar rol si viene role
- **updateUsuario** → ❌ debería lanzar error si no coincide el id
- **updateUsuarioRole** → ✔️ debería modificar rol
- **updateUsuarioRole** → ❌ debería lanzar error si no viene role

### src/user/__test__/user.service.spec.ts

- **getDatoById** → ✔️ debería devolver usuario
- **getDatoById** → ❌ debería manejar error
- **getDatoByIdOrFail** → ✔️ debería devolver usuario válido
- **getDatoByIdOrFail** → ❌ debería lanzar error si no existe
- **getDatoByIdOrFail** → ❌ debería lanzar error si está eliminado
- **getUserByEmail** → ✔️ debería devolver usuario
- **getUserByEmail** → ❌ debería lanzar error si no existe
- **createUsuario** → ✔️ debería crear usuario correctamente
- **createUsuario** → ❌ debería hacer rollback si falla
- **updateUsuario** → ✔️ debería actualizar usuario
- **updateUsuario** → ❌ debería manejar error
- **modifyUsuarioRole** → ✔️ debería modificar rol
- **modifyUsuarioRole** → ❌ debería manejar error
