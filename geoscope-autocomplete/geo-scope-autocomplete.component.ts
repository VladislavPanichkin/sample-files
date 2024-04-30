import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent,
  MatLegacyAutocompleteTrigger,
} from '@angular/material/legacy-autocomplete';
import { FormOption } from 'app/modules/shared';

@Component({
  selector: 'my-app-geoscope-autocomplete',
  templateUrl: './geo-scope-autocomplete.component.html',
  styleUrls: ['./geo-scope-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GeoScopeAutocompleteComponent),
      multi: true,
    },
  ],
})
export class GeoScopeAutocompleteComponent implements ControlValueAccessor {
  @ViewChild(MatLegacyAutocompleteTrigger)
  public autocompleteTrigger: MatLegacyAutocompleteTrigger;
  @ViewChild('searchInput') public searchInput: ElementRef<HTMLInputElement>;

  @Input() public geoScopeOptions: FormOption[];
  @Input() public errors: string[];
  @Input() public isRequired: boolean;

  public selectedGeoScopeOptions: FormOption[] = [];
  public searchControl = new FormControl<string>('');
  public isDisabled = false;

  private onChange: (value) => void;
  private onTouched: () => void;

  private touched = false;

  get filteredGeoScopeOptions(): FormOption[] {
    const searchValue = this.searchControl.value?.toLowerCase();

    return this.geoScopeOptions.filter((option) => {
      const optionIsSelected = !!this.selectedGeoScopeOptions.find(
        (selectedOption) => selectedOption.code === option.code
      );
      const optionIncludesSearchString = option.name
        ?.toLowerCase()
        .includes(searchValue);
      return !optionIsSelected && optionIncludesSearchString;
    });
  }

  public removeGeoScopeOption(geoScopeOption: FormOption): void {
    this.selectedGeoScopeOptions = this.selectedGeoScopeOptions.filter(
      (option) => option.code !== geoScopeOption.code
    );
    this.onChange(this.selectedGeoScopeOptions);
    this.touch();
  }

  public selectGeoScopeOption(event: MatAutocompleteSelectedEvent): void {
    const geoScopeOption: FormOption = event.option.value;
    this.selectedGeoScopeOptions.push(geoScopeOption);
    this.searchControl.reset('');
    this.searchInput.nativeElement.value = '';
    this.onChange(this.selectedGeoScopeOptions);
    this.touch();
  }

  public openAutoComplete(): void {
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.openPanel();
    }
  }

  public touch(): void {
    this.onTouched();
    this.touched = true;
  }

  // ControlValueAccessor methods:
  public registerOnChange(fn): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn): void {
    this.onTouched = fn;
  }

  public writeValue(value: FormOption[]): void {
    this.selectedGeoScopeOptions = value;
  }

  public setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.searchControl.disable();
      this.isDisabled = true;
    } else {
      this.searchControl.enable();
      this.isDisabled = false;
    }
  }

  public clear() {
    this.selectedGeoScopeOptions = [];
    this.searchControl.reset('');
    this.searchInput.nativeElement.value = '';
    this.onChange(this.selectedGeoScopeOptions);
  }

  public get showClearIcon() {
    return (
      this.searchControl.enable &&
      (this.selectedGeoScopeOptions.length || this.searchControl.value)
    );
  }
}
