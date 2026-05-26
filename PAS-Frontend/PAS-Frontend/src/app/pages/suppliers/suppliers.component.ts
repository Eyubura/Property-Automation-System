import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector:'app-suppliers', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./suppliers.component.html', styleUrl:'./suppliers.component.scss' })
export class SuppliersComponent implements OnInit {
  items:any[]=[]; filtered:any[]=[]; loading=true; error=''; search='';
  showModal=false; submitting=false; modalError='';
  form:any={supplierName:'',contactPerson:'',phone:'',email:'',address:'',tinNumber:''};

  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }
  load(){
    this.loading=true; this.error='';
    this.http.get<any>(`${environment.apiUrl}/suppliers`).subscribe({
      next:res=>{ this.loading=false; this.items=res?.data??[]; this.filter(); },
      error:err=>{ this.loading=false; this.error=err?.userMessage||'Failed to load.'; }
    });
  }
  filter(){ const q=this.search.toLowerCase(); this.filtered=!q?[...this.items]:this.items.filter(s=>`${s.supplierName} ${s.contactPerson}`.toLowerCase().includes(q)); }
  open(){ this.form={supplierName:'',contactPerson:'',phone:'',email:'',address:'',tinNumber:''}; this.modalError=''; this.showModal=true; }
  save(){
    if(!this.form.supplierName?.trim()){ this.modalError='Supplier name is required.'; return; }
    this.submitting=true; this.modalError='';
    this.http.post<any>(`${environment.apiUrl}/suppliers`,this.form).subscribe({
      next:res=>{ this.submitting=false; if(res?.succeeded!==false){this.showModal=false;this.load();}else this.modalError=res?.message||'Failed.'; },
      error:err=>{ this.submitting=false; this.modalError=err?.userMessage||'Failed to save.'; }
    });
  }
  delete(id:string,name:string){
    if(!confirm(`Delete "${name}"?`)) return;
    this.http.delete<any>(`${environment.apiUrl}/suppliers/${id}`).subscribe({ next:()=>this.load(), error:err=>this.error=err?.userMessage||'Failed.' });
  }
}