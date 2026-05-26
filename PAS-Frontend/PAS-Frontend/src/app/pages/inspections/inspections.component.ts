import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector:'app-inspections', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./inspections.component.html', styleUrl:'./inspections.component.scss' })
export class InspectionsComponent implements OnInit {
  items:any[]=[]; filtered:any[]=[]; loading=true; error=''; search='';
  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }
  load(){
    this.loading=true; this.error='';
    this.http.get<any>(`${environment.apiUrl}/inspections`).subscribe({
      next:res=>{ this.loading=false; this.items=res?.data?.items??res?.data??[]; this.filter(); },
      error:err=>{ this.loading=false; this.error=err?.userMessage||'Failed to load.'; }
    });
  }
  filter(){ const q=this.search.toLowerCase(); this.filtered=!q?[...this.items]:this.items.filter(i=>`${i.receivingNoteNumber} ${i.status}`.toLowerCase().includes(q)); }
  statusClass(s:string){ const m:any={Passed:'badge-success',Failed:'badge-danger',Pending:'badge-warning'}; return m[s]||'badge-neutral'; }
}