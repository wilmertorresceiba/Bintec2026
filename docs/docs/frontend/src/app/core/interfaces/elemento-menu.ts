export interface ElementoMenu {
  url: string;
  nombre: string;
  opciones: {
    rutaActivaExacta: boolean;
  };
  /** Subopciones: el elemento se muestra como un grupo desplegable. */
  hijos?: ElementoMenu[];
}
