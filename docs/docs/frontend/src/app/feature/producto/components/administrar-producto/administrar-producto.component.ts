import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  InputSignal,
  OnInit,
  Signal,
  signal,
  WritableSignal,
  input,
  Injector,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrearProducto } from '@feature/producto/shared/interfaces/crear-producto';
import { CrearProductoRespuesta } from '@feature/producto/shared/interfaces/crear-producto-respuesta';
import { Producto } from '@feature/producto/shared/interfaces/producto';
import { ProductoService } from '@feature/producto/shared/service/producto.service';
import { ValidarEnvioFormularioDirective } from '@shared/directives/validar-envio-formulario/validar-envio-formulario.directive';
import { ValidarMensajeErrorCamposDirective } from '@shared/directives/validar-errores-campos/validar-mensaje-error-campos.directive';

const TITULO_MIN_LENGTH: number = 3;
const TITULO_MAX_LENGTH: number = 100;
const DESCRIPCION_MIN_LENGTH: number = 10;
const DESCRIPCION_MAX_LENGTH: number = 500;
const PRECIO_MIN: number = 0.01;
const RADIX_DECIMAL: number = 10;
const URL_PATTERN: RegExp = /^https?:\/\/.+/;
const CATEGORIAS: readonly string[] = [
  'electronics',
  'jewelery',
  "men's clothing",
  "women's clothing",
] as const;

@Component({
  selector: 'app-administrar-producto',
  templateUrl: './administrar-producto.component.html',
  styleUrl: './administrar-producto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ValidarEnvioFormularioDirective,
    ValidarMensajeErrorCamposDirective,
  ],
})
export class AdministrarProductoComponent implements OnInit {
  public readonly categorias: readonly string[] = CATEGORIAS;

  public readonly idProducto: InputSignal<string | undefined> = input<string>();
  public readonly modoEdicion: Signal<boolean> = computed<boolean>(() =>
    Boolean(this.idProducto())
  );

  public formulario!: FormGroup;
  public cargando: WritableSignal<boolean> = signal<boolean>(false);
  public respuesta: WritableSignal<CrearProductoRespuesta | null> =
    signal<CrearProductoRespuesta | null>(null);

  private readonly productoService: ProductoService = inject(ProductoService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly injector: Injector = inject(Injector);

  constructor() {
    effect(
      () => {
        const idParam: string | undefined = this.idProducto();

        if (!idParam) {
          return;
        }

        const id: number = parseInt(idParam, RADIX_DECIMAL);

        this.productoService
          .consultarProducto(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((producto: Producto) => {
            this.formulario.patchValue({
              title: producto.title,
              price: String(producto.price),
              description: producto.description,
              image: producto.image,
              category: producto.category,
            });
          });
      },
      { injector: this.injector }
    );
  }

  public ngOnInit(): void {
    this.crearFormulario();
  }

  public enviarFormulario(): void {
    if (this.formulario.invalid) {
      return;
    }

    const producto: CrearProducto = this.construirProducto();
    const idParam: string | undefined = this.idProducto();
    const id: number | undefined = idParam ? parseInt(idParam, RADIX_DECIMAL) : undefined;

    this.cargando.set(true);
    this.respuesta.set(null);

    this.productoService
      .guardarProducto(id, producto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta: CrearProductoRespuesta) => {
          this.respuesta.set(respuesta);
          this.cargando.set(false);
          if (!this.modoEdicion()) {
            this.formulario.reset();
          }
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }

  private crearFormulario(): void {
    this.formulario = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(TITULO_MIN_LENGTH),
          Validators.maxLength(TITULO_MAX_LENGTH),
        ],
      ],
      price: ['', [Validators.required, Validators.min(PRECIO_MIN)]],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(DESCRIPCION_MIN_LENGTH),
          Validators.maxLength(DESCRIPCION_MAX_LENGTH),
        ],
      ],
      image: ['', [Validators.required, Validators.pattern(URL_PATTERN)]],
      category: ['', [Validators.required]],
    });
  }

  private construirProducto(): CrearProducto {
    return {
      ...this.formulario.getRawValue(),
      price: parseFloat(this.formulario.get('price')?.value as string),
    };
  }
}
