// src/app/shared/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * Validador para nombres - solo letras y espacios
   */
  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }
      
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      const isValid = nameRegex.test(control.value.trim());
      
      if (!isValid) {
        return { 'invalidName': true };
      }
      
      // Verificar que no sean solo espacios
      if (control.value.trim().length === 0) {
        return { 'onlySpaces': true };
      }
      
      return null;
    };
  }

  /**
   * Validador para contraseñas seguras
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      // Verificar longitud mínima
      if (password.length < 8) {
        errors['minLength'] = true;
      }

      // Debe contener al menos una letra minúscula
      if (!/[a-z]/.test(password)) {
        errors['noLowercase'] = true;
      }

      // Debe contener al menos una letra mayúscula
      if (!/[A-Z]/.test(password)) {
        errors['noUppercase'] = true;
      }

      // Debe contener al menos un número
      if (!/\d/.test(password)) {
        errors['noNumber'] = true;
      }

   

      // Verificar contraseñas comunes
      if (this.isCommonPassword(password)) {
        errors['commonPassword'] = true;
      }

      // Verificar patrones simples
      if (this.hasSimplePatterns(password)) {
        errors['simplePattern'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Verificar si es una contraseña común
   */
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      '12345678', '87654321', 'password', 'contraseña', 'qwerty',
      'abc123', '123abc', 'admin123', 'password123', '12345678',
      'qwerty123', 'letmein', 'welcome', 'monkey', 'dragon',
      'princess', 'baseball', 'football', 'welcome123', 'admin',
      '1234567890', 'asdfjkl;', 'zxcvbnm', 'iloveyou', 'sunshine'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Verificar patrones simples como secuencias numéricas o alfabéticas
   */
  private static hasSimplePatterns(password: string): boolean {
    // Secuencias numéricas ascendentes/descendentes
    const numSequences = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210'];
    
    // Secuencias de teclado
    const keyboardSequences = ['qwer', 'asdf', 'zxcv', 'yuio', 'hjkl', 'bnm', 'rewq', 'fdsa', 'vcxz'];
    
    // Patrones repetitivos
    const repetitivePattern = /(.)\1{3,}/; // 4 o más caracteres iguales seguidos
    
    const lowerPassword = password.toLowerCase();
    
    // Verificar secuencias numéricas
    for (const seq of numSequences) {
      if (lowerPassword.includes(seq)) {
        return true;
      }
    }
    
    // Verificar secuencias de teclado
    for (const seq of keyboardSequences) {
      if (lowerPassword.includes(seq)) {
        return true;
      }
    }
    
    // Verificar patrones repetitivos
    if (repetitivePattern.test(password)) {
      return true;
    }
    
    return false;
  }

  /**
   * Validador para confirmar que las contraseñas coinciden
   */
  static confirmPasswordValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordField);
      const confirmPassword = control;

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        return { 'ConfirmPassword': true };
      }

      return null;
    };
  }
}