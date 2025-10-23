import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css']
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';
  @Input() isInvalid: boolean = false;
}