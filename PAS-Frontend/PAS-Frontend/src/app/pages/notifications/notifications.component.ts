import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector:'app-notifications', standalone:true, imports:[CommonModule], templateUrl:'./notifications.component.html', styleUrl:'./notifications.component.scss' })
export class NotificationsComponent implements OnInit {
  items:any[]=[]; loading=true; error='';
  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }
  load(){
    this.loading=true; this.error='';
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe({
      next:res=>{ this.loading=false; this.items=res?.data?.notifications??res?.data?.items??res?.data??[]; },
      error:err=>{ this.loading=false; this.error=err?.userMessage||'Failed to load.'; }
    });
  }
  markAll(){
    this.http.post<any>(`${environment.apiUrl}/notifications/mark-all-read`,{}).subscribe({ next:()=>this.load() });
  }
  icon(t:string){ const m:any={Warning:'pi-exclamation-triangle',Info:'pi-info-circle',Success:'pi-check-circle',Error:'pi-times-circle'}; return 'pi '+(m[t]||'pi-bell'); }
  typeClass(t:string){ const m:any={Warning:'badge-warning',Info:'badge-info',Success:'badge-success',Error:'badge-danger'}; return m[t]||'badge-neutral'; }
}