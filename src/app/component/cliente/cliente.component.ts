import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CamposSeleccionadosCampana, ICampana } from 'src/app/interfaces/icampana';
import { CampanaService } from 'src/app/services/campana/campana.service';

import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import * as Papa from 'papaparse';
import { CamposSeleccionados } from 'src/app/interfaces/iClass';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  template: `
    <input type="file" (change)="onFileSelected($event)">
  `
  ,
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  campanas: ICampana[] = [];
  producto: string | null = null;
  start = '';
  end = '';
  mensaje = '';
  public cargando: boolean = false;
  archivoSeleccionado: File | null = null;
  public archivoSeleccionadoValido = false;
  camposDisponibles = ['nombres', 'apellidos', 'telefonos', 'direcciones'];
  camposSeleccionados: CamposSeleccionados = new CamposSeleccionados();
  form!: FormGroup;

  constructor(private serviceCampana: CampanaService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.serviceCampana.getAllCampanas().subscribe((data) => {
      this.campanas = data;
      console.log(data);
    });

    this.serviceCampana.getCount().subscribe((data) => {
      this.campanas = data;
      console.log(data);
    });

    this.form = this.fb.group({
      file: ['', Validators.required],
      nombres: [true],
      apellidos: [true],
      telefonos: [true],
      direcciones: [true]
    });
  }

  buscarCampanas() {
    const productoValido = this.producto ?? '';
    this.serviceCampana.getSearchForName(productoValido)
      .subscribe(data => this.campanas = data);
  }

  buscarCampanasPorFecha(start: string, end: string): void {
    this.serviceCampana.buscarCampanasDate(start, end)
      .subscribe(campanas => {
        this.campanas = campanas;
        console.log(this.campanas);
      });
  }

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input && input.files && input.files.length) {
    const file = input.files[0];
    const fileType = file.type;
    const validFileTypes = ['text/csv', 'text/plain'];

    if (!validFileTypes.includes(fileType)) {
      Swal.fire('Error', 'Solo se aceptan archivos de tipo CSV o TXT', 'error');
      this.archivoSeleccionadoValido = false;
      return;
    }

    const reader = new FileReader();
    const lines: string[] = [];

    reader.onload = () => {
      const fileContent = reader.result as string;
      const CamposSeleccionadosCampana: CamposSeleccionadosCampana[] = [];
      const lines = fileContent ? fileContent.split('\n') : [];

      // Obtener los nombres de los campos de la primera línea del archivo
      const fieldNames = lines[0] ? lines[0].split(';') : [];

      // Buscar los índices de los campos seleccionados
      const nombreIndex = fieldNames.indexOf('nombres');
      const apellidoIndex = fieldNames.indexOf('apellidos');
      const telefonoIndex = fieldNames.indexOf('telefono');
      const direccionIndex = fieldNames.indexOf('direccion');

      // Recorrer las líneas del archivo y agregar solo los campos seleccionados
      for (let i = 1; i < lines.length; i++) {
        const fields = lines[i] ? lines[i].split(';') : [];
        if (fields.length >= 4) {
          const campos: CamposSeleccionadosCampana = {
            nombres: fields[nombreIndex],
            apellidos: fields[apellidoIndex],
            telefono: fields[telefonoIndex],
            direccion: fields[direccionIndex],
          };
          CamposSeleccionadosCampana.push(campos);
        }
      }

      console.log(CamposSeleccionadosCampana);
      this.archivoSeleccionadoValido = true; // Habilitar el botón
    };

    reader.readAsText(file);
  }
}

    onSubmit(event: any) {
      event.preventDefault();

      const formData = new FormData();
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput instanceof HTMLInputElement) {
        const file = fileInput.files?.[0];
        if (file) {
          formData.append('archivo', file);

          // Obtener campos seleccionados del formulario
          const camposSeleccionados = {
            nombres: this.form?.get('nombres')?.value,
            apellidos: this.form?.get('apellidos')?.value,
            telefonos: this.form?.get('telefonos')?.value,
            direcciones: this.form?.get('direcciones')?.value
          };

          // Enviar solo el archivo como parámetro al servicio
          if (file !== null) {
            this.serviceCampana.cargarCampanaConCampos(file, camposSeleccionados).subscribe(
              (response: any) => {

                this.cargando = false;
                Swal.fire('Archivo subido correctamente', '', 'success');
                console.log(camposSeleccionados);
                fileInput.value = '';
              },
              (error: any) => {
                this.cargando = false;
                console.log(error);
                this.mensaje = 'Error al subir archivo';
                Swal.fire('Error al subir archivo', '', 'error');
                console.error(error);
                fileInput.value = ''; // Limpiar selección de archivo
              }
            );
          }
        }
      }
    }
  }