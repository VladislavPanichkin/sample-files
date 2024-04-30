import { Component, Input } from "@angular/core";
import { FilterOption, IFiltersForm, isRegularType } from "<path-to-file>";
import { FILTER_DISPLAY_NAME, IFilterEntry } from "./filters-tooltip.constants";

@Component({
  selector: 'my-app-filters-tooltip',
  templateUrl: './filters-tooltip.component.html',
  styleUrls: ['./filters-tooltip.component.scss'],
})
export class FiltersTooltipComponent {
  @Input() public formValue: IFiltersForm;

  public get entries(): IFilterEntry[] {
    if (!this.formValue) {
      return [];
    }
    return Object.entries(this.formValue).reduce(
      (acc: IFilterEntry[], [key, value]) => {
        if (!value?.length) {
          return acc;
        }
        if (value?.length && isRegularType(value[0].code)) {
          return acc;
        }
        return [
          ...acc,
          {
            key: FILTER_DISPLAY_NAME[key] || key,
            value: value.map((option: FilterOption) => option.name),
          },
        ];
      },
      []
    );
  }
}
