interface ErroresFormulario {
  [key: string]: (error: Record<string, number>) => string;
  desconocido: () => string;
}

export const erroresFormulario: ErroresFormulario = Object.freeze({
  required: () => 'Este campo es requerido.',
  minlength: ({ requiredLength }: Record<string, number>) =>
    `Este campo debe tener al menos ${requiredLength} caracteres.`,
  maxlength: ({ requiredLength }: Record<string, number>) =>
    `Este campo debe tener como máximo ${requiredLength} caracteres.`,
  min: ({ min }: Record<string, number>) => `Este campo debe ser mayor o igual a ${min}.`,
  max: ({ max }: Record<string, number>) => `Este campo debe ser menor o igual a ${max}.`,
  email: () => 'Este campo debe ser un email válido.',
  pattern: () => 'No cumple con el formato.',
  desconocido: () => 'Error desconocido',
});
