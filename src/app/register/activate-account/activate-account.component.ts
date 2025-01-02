import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../service/api.service';
import { onMessageSubject } from '../../service/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activate-account',
  imports: [],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.css'
})
export class ActivateAccountComponent {
  constructor(private readonly activatedRoute: ActivatedRoute, private readonly router: Router, private readonly apiService: ApiService, private readonly translateService: TranslateService){ }
  ngOnInit(){
    this.activatedRoute.queryParamMap.subscribe(it => {
      const token  = it.get('token')
      if(!token){
        this.router.navigate(['/login'])
        return;
      }

      this.apiService.activate(token).subscribe({
        next: (res: any)=> {
          onMessageSubject.next({severity: 'success' ,summary: this.translateService.instant('http.success'), detail: this.translateService.instant('activate.user')})
          this.router.navigate(['login'])
        },
        error: ()=> {
          onMessageSubject.next({severity: 'error', summary: this.translateService.instant('http.error'), detail: this.translateService.instant('activate.no')})
          this.router.navigate(['login'])
        }
      })
    })

  }
}
