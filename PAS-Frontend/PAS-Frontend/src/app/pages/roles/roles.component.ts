import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector:'app-roles', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./roles.component.html', styleUrl:'./roles.component.scss' })
export class RolesComponent implements OnInit {
  items:any[]=[]; loading=true; error='';
  showModal=false; submitting=false; modalError='';
  form:any={name:'',description:''};

  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }
  load(){
    this.loading=true; this.error='';
    this.http.get<any>(`${environment.apiUrl}/roles`).subscribe({
      next:res=>{ this.loading=false; this.items=res?.data??[]; },
      error:err=>{ this.loading=false; this.error=err?.userMessage||'Failed to load.'; }
    });
  }
  open(){ this.form={name:'',description:''}; this.modalError=''; this.showModal=true; }
  save(){
    if(!this.form.name?.trim()){ this.modalError='Role name is required.'; return; }
    this.submitting=true; this.modalError='';
    this.http.post<any>(`${environment.apiUrl}/roles`,this.form).subscribe({
      next:res=>{ this.submitting=false; if(res?.succeeded!==false){this.showModal=false;this.load();}else this.modalError=res?.message||'Failed.'; },
      error:err=>{ this.submitting=false; this.modalError=err?.userMessage||'Failed to save.'; }
    });
  }
  delete(id:string,name:string){
    if(!confirm(`Delete role "${name}"?`)) return;
    this.http.delete<any>(`${environment.apiUrl}/roles/${id}`).subscribe({ next:()=>this.load(), error:err=>this.error=err?.userMessage||'Failed.' });
  }
}