import { FormGroup } from "@angular/forms";

export function passwordMatchValidator(form: FormGroup, firstControl: string, secondControl: string): any {
    return form.get(firstControl)?.value === form.get(secondControl)?.value
       ? null : {'mismatch': true};
  }
  
  export function getPasswordErrors(form: FormGroup, controlName: string ,type: PasswordValidatorType){
    const value = form.get(controlName)!.value as string
    switch(type){
      case "lowercase": return /(?=.*[a-z])/.exec(value)
      case "uppercase": return /(?=.*[A-Z])/.exec(value)
      case "minimum": return /(?=.{8,})/.exec(value)
      case "numeric": return /(?=.*\d)/.exec(value)
      case "special": return /(?=.*[^a-zA-Z0-9])/.exec(value)
    }
  }
  export function isPasswordFieldPristine(form: FormGroup, controlName: string){
    return form.get(controlName)?.pristine ?? false
  }
  
  export type PasswordValidatorType = 'lowercase' | 'uppercase' | 'minimum' | 'special' | 'numeric'