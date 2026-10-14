interface CodigosErroresHttp {
  [key: number]: string;
  desconocido: string;
  desconectado: string;
}
export const CODIGO_ERRORES_HTTP: CodigosErroresHttp = Object.freeze({
  400: 'Solicitud incorrecta: El servidor no pudo entender la solicitud debido a una sintaxis inválida.',
  401: 'No autorizado: Debe iniciar sesión para acceder a este recurso.',
  403: 'Prohibido: No tiene los permisos necesarios para acceder a este recurso.',
  404: 'No encontrado: El recurso solicitado no pudo ser encontrado.',
  405: 'Método no permitido: El método de solicitud no está permitido para el recurso solicitado.',
  406: 'No aceptable: El servidor no puede producir una respuesta que coincida con los encabezados de aceptación enviados en la solicitud.',
  408: 'Tiempo de espera agotado: El servidor agotó el tiempo de espera para la solicitud.',
  409: 'Conflicto: La solicitud no se pudo completar debido a un conflicto con el estado actual del recurso.',
  410: 'Gone: El recurso solicitado ya no está disponible y no lo estará nuevamente.',
  413: 'Payload Too Large: La entidad de solicitud es más grande de lo que el servidor puede procesar.',
  414: 'URI Too Long: La URI solicitada es más larga de lo que el servidor está dispuesto a interpretar.',
  415: 'Unsupported Media Type: El tipo de medio de la entidad solicitada no es compatible con el servidor.',
  429: 'Too Many Requests: El usuario ha enviado demasiadas solicitudes en un tiempo determinado.',
  500: 'Error interno del servidor: El servidor encontró un error interno.',
  502: 'Bad Gateway: El servidor recibió una respuesta inválida del servidor upstream.',
  503: 'Servicio no disponible: El servidor no está listo para manejar la solicitud.',
  504: 'Gateway Timeout: El servidor no recibió una respuesta a tiempo del servidor upstream.',
  desconocido: 'Ocurrió un error desconocido.',
  desconectado: 'Error del cliente: Fallo de red o problema de conexión.',
});
