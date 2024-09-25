import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { switchMap } from 'rxjs';
import { MaterialModule } from 'src/app/material/material.module';
import { Medic } from 'src/app/models/medic';
import { MedicService } from 'src/app/services/medic.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medic-dialog',
  standalone: true,
  templateUrl: './medic-dialog.component.html',
  styleUrls: ['./medic-dialog.component.css'],
  imports: [MaterialModule, FormsModule, NgIf],
})
export class MedicDialogComponent implements OnInit {


medic: Medic;

/* Se agregan las variables del formulario para la validación de los campos
de tipo cadena de texto para validar el valor del campo correspondiente */
primaryName: string = '';
surname: string = '';
codMedic: string = '';
photo: string = '';


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Medic, // recepeción de la data del padre mediante ese token
    private _dialogRef: MatDialogRef<MedicDialogComponent>, // tiene la ref del mat-dialog para manipularlo
    private medicService: MedicService
  ) {}


  ngOnInit(): void {
    this.medic = { ...this.data };
  }


  onSubmit(primaryName: any, surname: any, codMedic: any, photo: any) { //se agregan parametros de las variables de la validacion en la funcion onsubmit que se usa para el formulario
    if (!primaryName.invalid && !surname.invalid && !codMedic.invalid && !photo.invalid) { // se verificará que los campos no se vayan vacios
      console.log('Datos del médico:', {
        primaryName: this.primaryName,
        surname: this.surname,
        codMedic: this.codMedic,
        photo: this.photo
      });
      Swal.fire({ // se añade un mensaje de respuesta emergente para guardar los datos en caso de que la validacion sea correcta y todos los campos han sido llenados correctamente
        title: 'Datos guardados con éxito', //mensaje principal de la ventana emergente
        icon: 'success', // se agrega un icono de respuesta correcta
        confirmButtonColor: '#28a745', // se da un color al boton de aceptar
        confirmButtonText: 'Aceptar' // se habilita boton de aceptar
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload(); // al dar clic en Aceptar el sistema se restablece vaciando los datos que hayan sido completados al dar clic en el
        }
      });
    } else {
      alert('Por favor, corrige los errores antes de enviar.');
    }
  }



  operate() {
    if (this.medic != null && this.medic.idMedic > 0) {
      // UPDATE
      this.medicService
        .update(this.medic.idMedic, this.medic)
        .pipe(switchMap(() => this.medicService.findAll()))
        .subscribe((data) => {
          this.medicService.setmedicChange(data);
          this.medicService.setMessageChange('UPDATED!');
        });
    } else {
      // INSERT
      this.medicService
        .save(this.medic)
        .pipe(switchMap(() => this.medicService.findAll()))
        .subscribe((data) => {
          this.medicService.setmedicChange(data);
          this.medicService.setMessageChange('CREATED!');
        });
    }

    this.close();
  }

  close() {
    this._dialogRef.close();
  }
}
