import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterLink, RouterOutlet } from '@angular/router';
import { switchMap } from 'rxjs';
import { MaterialModule } from 'src/app/material/material.module';
import { Patient } from 'src/app/models/patient';
import { PatientService } from 'src/app/services/patient.service';


@Component({
  selector: 'app-patient',
  standalone: true,
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css'],
  imports: [MaterialModule, RouterLink, RouterOutlet],
})
export class PatientComponent implements OnInit {
  dataSource: MatTableDataSource<Patient>;
  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'dni',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  totalElements: number = 0;

  constructor(
    private patientService: PatientService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    /*this.patientService.findAll().subscribe((data) => {
      this.createTable(data);
    });*/

    this.patientService.listPageable(0, 2).subscribe((data) => {
      this.totalElements = data.totalElements;
      this.createTable(data.content);
    });

    // reflejar los cambios reactivos
    this.patientService.getPatientChange().subscribe((data) => {
      this.createTable(data);
    });

    this.patientService.getMessageChange().subscribe((data) => {
      this._snackBar.open(data, 'INFO', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });



  }

  //Solución para aplicar Sort y ordenamiento en la lista Patient
  createTable(data: Patient[]) {

    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;

    //dataSource llevar los datos de la lista Patient y se usa SORT que es igual this.sort que existe porque anterior mente se declaro ->  @ViewChild(MatSort) sort: MatSort;
    this.dataSource.sort = this.sort;

    // Definimos la lógica de ordenación para la columna 'id', realizando mas pruebas para las demas columnas 
    this.dataSource.sortingDataAccessor = (item, property) =>{
      switch (property){
        case 'id':
          return item.idPatient; //En este caso usamos idPatient para ordenarlo
        case 'firstName':
          return item.firstName;
        case 'lastName':
          return item.lastName;
        case 'dni':
          return item.dni;
          default:
          return item[property];
      }
    };
    
    // Ordenar de forma descendente por ID al iniciar
    this.sort.active = 'id';

    //Pruebas de ordenmaiento por otras columnas
    this.sort.active = 'firstName';
    this.sort.active = 'lastName';
    this.sort.active = 'dni';
    this.sort.active = 'actions';
    this.sort.direction = 'desc';
  }

  delete(idPatient: number) {
    this.patientService
      .delete(idPatient)
      .pipe(switchMap(() => this.patientService.findAll()))
      .subscribe((data) => {
        this.patientService.setPatientChange(data);
        this.patientService.setMessageChange('DELETED');
      });
  }

  applyFilter(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    this.dataSource.filter = inputElement.value.trim();
  }

  showMore(e: any) {
    this.patientService
      .listPageable(e.pageIndex, e.pageSize)
      .subscribe((data) => {
        this.totalElements = data.totalElements;
        this.createTable(data.content);
      });
  }
}
