import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({ selector:'app-inventory', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./inventory.component.html', styleUrl:'./inventory.component.scss' })
export class InventoryComponent implements OnInit {
  items:any[]=[]; filtered:any[]=[]; loading=true; error=''; search='';
  showModal=false; submitting=false; modalError='';
  form:any={itemCode:'',name:'',description:'',category:'',unit:'',quantity:0,minimumQuantity:0,location:''};

  constructor(private http:HttpClient){}
  ngOnInit(){ this.load(); }

  load(){
    this.loading=true; this.error='';
    this.http.get<any>(`${environment.apiUrl}/inventorystock`).subscribe({
      next:res=>{ this.loading=false; this.items=res?.data?.items??res?.data??[]; this.filter(); },
      error:err=>{ this.loading=false; this.error=err?.userMessage||'Failed to load.'; }
    });
  }

  filter(){ const q=this.search.toLowerCase(); this.filtered=!q?[...this.items]:this.items.filter(i=>`${i.name} ${i.itemCode} ${i.category}`.toLowerCase().includes(q)); }
  isLow(i:any){ return i.quantity<=i.minimumQuantity; }
  open(){ this.form={itemCode:'',name:'',description:'',category:'',unit:'',quantity:0,minimumQuantity:0,location:''}; this.modalError=''; this.showModal=true; }

  save(){
    if(!this.form.name?.trim()){ this.modalError='Item name is required.'; return; }
    this.submitting=true; this.modalError='';
    this.http.post<any>(`${environment.apiUrl}/inventorystock`,this.form).subscribe({
      next:res=>{ this.submitting=false; if(res?.succeeded!==false){this.showModal=false;this.load();}else this.modalError=res?.message||'Failed.'; },
      error:err=>{ this.submitting=false; this.modalError=err?.userMessage||'Failed to save.'; }
    });
  }

  delete(id:string,name:string){
    if(!confirm(`Delete "${name}"?`)) return;
    this.http.delete<any>(`${environment.apiUrl}/inventorystock/${id}`).subscribe({ next:()=>this.load(), error:err=>this.error=err?.userMessage||'Failed.' });
  }
}