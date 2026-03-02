const messages = {
  general: {
    created: 'Registro creado correctamente',
    updated: 'Registro actualizado correctamente',
    deleted: 'Registro eliminado correctamente',
    retrieved: 'Datos obtenidos correctamente',
    notFound: 'Registro no encontrado',
    serverError: 'Error interno del servidor',
    invalidRequest: 'Solicitud inválida',
    requiredField: 'Campo requerido',
  },

  auth: {
    loginSuccess: 'Inicio de sesión exitoso',
    invalidCredentials: 'Usuario o contraseña incorrectos',
    tokenRequired: 'Se requiere autenticación',
    tokenExpired: 'La sesión ha expirado',
    tokenInvalid: 'Token inválido',
    authFailed: 'Error al autenticar el token',
    unauthorized: 'No tiene permisos para realizar esta acción',
    profileRetrieved: 'Perfil obtenido correctamente',
    profileNotFound: 'Usuario no encontrado',
    emailRequired: 'El correo electrónico es requerido',
    passwordRequired: 'La contraseña es requerida',
    emailPasswordRequired: 'El correo y la contraseña son requeridos',
  },

  categories: {
    retrieved: 'Categorías obtenidas correctamente',
    created: 'Categoría creada correctamente',
    updated: 'Categoría actualizada correctamente',
    deleted: 'Categoría eliminada correctamente',
    notFound: 'Categoría no encontrada',
    nameRequired: 'El nombre de la categoría es requerido',
    duplicateName: 'Ya existe una categoría con ese nombre',
    hasSpareparts: 'No se puede eliminar la categoría. Tiene {count} repuestos asociados',
  },

  spareParts: {
    retrieved: 'Repuestos obtenidos correctamente',
    created: 'Repuesto creado correctamente',
    updated: 'Repuesto actualizado correctamente',
    deleted: 'Repuesto eliminado correctamente',
    notFound: 'Repuesto no encontrado',
    nameRequired: 'El nombre del repuesto es requerido',
    negativeStock: 'El stock no puede ser negativo',
    negativeMinStock: 'El stock mínimo no puede ser negativo',
    lowStockRetrieved: 'Repuestos con bajo stock obtenidos correctamente',
    categoryNotFound: 'Categoría no encontrada',
  },

  suppliers: {
    retrieved: 'Proveedores obtenidos correctamente',
    created: 'Proveedor creado correctamente',
    updated: 'Proveedor actualizado correctamente',
    deleted: 'Proveedor eliminado correctamente',
    notFound: 'Proveedor no encontrado',
    nameRequired: 'El nombre del proveedor es requerido',
    duplicateNamePhone: 'Ya existe un proveedor con el mismo nombre y teléfono',
  },

  equipments: {
    retrieved: 'Equipos obtenidos correctamente',
    created: 'Equipo creado correctamente',
    updated: 'Equipo actualizado correctamente',
    deleted: 'Equipo eliminado correctamente',
    notFound: 'Equipo no encontrado',
    codeRequired: 'El código del equipo es requerido',
    typeRequired: 'El tipo de equipo es requerido',
    duplicateCode: 'Ya existe un equipo con ese código',
    invalidType: 'Tipo de equipo inválido. Tipos válidos: {types}',
    invalidStatus: 'Estado inválido. Estados válidos: {statuses}',
  },

  entries: {
    retrieved: 'Entrada obtenida correctamente',
    created: 'Entrada registrada correctamente. Stock actualizado',
    notFound: 'Entrada no encontrada',
    supplierRequired: 'El proveedor es requerido',
    detailsRequired: 'Debe incluir al menos un repuesto',
    invalidQuantity: 'La cantidad debe ser mayor a cero',
    invalidPrice: 'El precio unitario debe ser mayor o igual a cero',
    sparePartNotFound: 'Repuesto no encontrado: {name}',
    transactionFailed: 'Error al procesar la entrada. Operación cancelada',
  },

  outputs: {
    retrieved: 'Salida obtenida correctamente',
    created: 'Salida registrada correctamente. Stock actualizado',
    notFound: 'Salida no encontrada',
    technicianRequired: 'El técnico es requerido',
    equipmentRequired: 'El equipo es requerido',
    detailsRequired: 'Debe incluir al menos un repuesto',
    invalidQuantity: 'La cantidad debe ser mayor a cero',
    insufficientStock: 'Stock insuficiente para {name}. Disponible: {available}, Solicitado: {requested}',
    sparePartNotFound: 'Repuesto no encontrado: {name}',
    transactionFailed: 'Error al procesar la salida. Operación cancelada',
  },

  health: {
    ok: 'API de Inventario BICU funcionando correctamente',
  },

  errors: {
    routeNotFound: 'Ruta no encontrada',
    internalError: 'Error interno del servidor',
  },
};

module.exports = messages;
