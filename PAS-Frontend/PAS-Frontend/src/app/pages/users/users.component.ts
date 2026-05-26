import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector:'app-users', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./users.component.html', styleUrl:'./users.component.scss' })
export class UsersComponent implements OnInit {
  items:any[]=[]; filtered:any[]=[]; loading=true; error=''; search='';
  showModal=false; submitting=false; modalError='';
  roles=['Admin','Manager','Staff','Inspector','Approver','StoreOfficer'];
  form:any={username:'',password:'',email:'',fullName:'',department:'',employeeCode:'',phoneNumber:'',roleName:'Staff'};

  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }
  load(){
    this.loading=true; this.error='';
    this.http.get<any>(`${environment.apiUrl}/users`).subscribe({
      next:res=>{ this.loading=false; this.items=res?.data?.items??res?.data??[]; this.filter(); },
      error:err=>{ this.loading=false; this.error=err?.userMessage||'Failed to load.'; }
    });
  }
  filter(){ const q=this.search.toLowerCase(); this.filtered=!q?[...this.items]:this.items.filter(u=>`${u.fullName} ${u.username} ${u.email}`.toLowerCase().includes(q)); }
  open(){ this.form={username:'',password:'',email:'',fullName:'',department:'',employeeCode:'',phoneNumber:'',roleName:'Staff'}; this.modalError=''; this.showModal=true; }
  save(){
    if(!this.form.username?.trim()||!this.form.password?.trim()||!this.form.email?.trim()||!this.form.fullName?.trim()){ this.modalError='Username, password, email and full name are required.'; return; }
    this.submitting=true; this.modalError='';
    this.http.post<any>(`${environment.apiUrl}/auth/register`,this.form).subscribe({
      next:res=>{ this.submitting=false; if(res?.succeeded!==false){this.showModal=false;this.load();}else this.modalError=res?.message||'Failed.'; },
      error:err=>{ this.submitting=false; this.modalError=err?.userMessage||'Failed to create user.'; }
    });
  }
  toggleActive(u:any){
    const url=`${environment.apiUrl}/users/${u.id}/${u.isActive?'deactivate':'activate'}`;
    this.http.post<any>(url,{}).subscribe({ next:()=>this.load(), error:err=>this.error=err?.userMessage||'Failed.' });
  }
  delete(id:string,name:string){
    if(!confirm(`Delete user "${name}"?`)) return;
    this.http.delete<any>(`${environment.apiUrl}/users/${id}`).subscribe({ next:()=>this.load(), error:err=>this.error=err?.userMessage||'Failed.' });
  }
}