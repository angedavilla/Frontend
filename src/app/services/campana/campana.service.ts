import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICampana } from 'src/app/interfaces/icampana';


@Injectable({
  providedIn: 'root'
})
export class CampanaService {

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  public getAllCampanas(): Observable<any> {
    return this.http.get<ICampana[]>(`${this.apiUrl}/campanas/all`);
  }

  public getSearchForName(nombres: string): Observable<ICampana[]> {
    const url = `${this.apiUrl}/campanas/search?nombres=${nombres}`;
    return this.http.get<ICampana[]>(url);
  }

  buscarCampanasDate(start: string, end: string): Observable<any> {
    const url = `${this.apiUrl}/campanas/range?start=${start}&end=${end}`;
    return this.http.get(url);
  }

  getCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/campanas/upload`);
  }

  public cargarCampanaConCampos(file: File | null, camposSeleccionados: any) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file, file.name);
    } else {
      formData.append('file', '');
    }
    const campos = [];
    if (camposSeleccionados.nombres) campos.push('nombres');
    if (camposSeleccionados.apellidos) campos.push('apellidos');
    if (camposSeleccionados.telefonos) campos.push('telefonos');
    if (camposSeleccionados.direcciones) campos.push('direcciones');

    formData.append('campos', JSON.stringify(campos));

    return this.http.post<any>(`${this.apiUrl}/campanas/upload`, formData);
  }
}

