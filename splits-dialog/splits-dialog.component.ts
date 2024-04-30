import { Component, Inject, OnInit } from '@angular/core';
import { GridOptions, ValueGetterParams } from '@ag-grid-community/core';
import { CheckboxRenderer, defaultGridOptions } from '@<common-lib>';
import { DEAL_SPLITS_COLUMN_WIDTH_CONFIG } from '<path-to-file>';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { PtfuwPercentPipe } from 'app/modules/shared';
import { SplitWithSelectionStatus } from '<path-to-file>';
import { ISplitsDialogParams } from '<path-to-file>';
import { DeselectedSplitsAggregationService } from '<path-to-file>';
import { take } from 'rxjs/operators';
import {
  SnackbarMessageError,
  SnackbarMessageOptions,
  SnackbarService,
} from '@<common-lib>';
import { Observable } from 'rxjs';

@Component({
  selector: 'my-app-deal-splits-dialog',
  templateUrl: './deal-splits-dialog.component.html',
  styleUrls: ['./deal-splits-dialog.component.scss'],
  providers: [PercentPipe],
})
export class DealSplitsDialogComponent implements OnInit {
  public modules = [ClientSideRowModelModule];
  public splits$: Observable<SplitWithSelectionStatus[]>;
  public splitsTouched = false;
  public isUpdateInProgress = false;

  private dealId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ISplitsDialogParams,
    private dialogRef: MatDialogRef<DealSplitsDialogComponent>,
    private percentPipe: PercentPipe,
    private deselectedSplitsService: DeselectedSplitsAggregationService,
    private snackbarService: SnackbarService
  ) {}

  public ngOnInit(): void {
    this.dealId = this.data.dealId;
    this.splits$ = this.deselectedSplitsService.getDealAggregatedSplits$(
      this.data.deselectedSplitIds
    );
  }

  public get gridOptions(): GridOptions {
    return {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: '',
          width: 40,
          cellClass: 'center',
          headerClass: 'center be-transparent',
          cellRendererFramework: CheckboxRenderer,
          cellRendererParams: ({ data }) => ({
            value: data.selected,
            editable: true,
          }),
          valueSetter: ({ data }) => {
            this.onToggle(data.id);
            return !data.selected;
          },
        },
        {
          headerName: 'Name',
          field: 'name',
          width: DEAL_SPLITS_COLUMN_WIDTH_CONFIG.name,
        },
        {
          headerName: 'Ratio',
          field: 'ratio',
          width: DEAL_SPLITS_COLUMN_WIDTH_CONFIG.ratio,
          valueGetter: ({
            data: { ratio },
          }: {
            data?: SplitWithSelectionStatus;
          }) => {
            return this.percentPipe.transform(ratio, {
              decimalFormat: '1.0-2',
            });
          },
        },
        {
          headerName: 'Business entity',
          field: 'businessEntity',
          width: DEAL_SPLITS_COLUMN_WIDTH_CONFIG.businessEntity,
          valueGetter: (params: ValueGetterParams) =>
            params.data.businessEntity?.data.value,
        },
        {
          headerName: 'Other',
          field: 'other',
          width: DEAL_SPLITS_COLUMN_WIDTH_CONFIG.other,
          valueGetter: () => 'Default value',
        },
      ],
      getRowStyle: ({ data }: { data: SplitWithSelectionStatus }) => {
        if (!data.selected) {
          return { color: 'rgba(0, 0, 0, 0.38)' };
        }
      },
    };
  }

  public close(): void {
    this.dialogRef.close();
  }

  public onToggle(splitId: string): void {
    this.deselectedSplitsService.toggleSplit(splitId);
    if (!this.splitsTouched) {
      this.splitsTouched = true;
    }
  }

  public onSave(): void {
    this.isUpdateInProgress = true;
    this.deselectedSplitsService
      .saveSplitsStatus(this.dealId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.dialogRef.close();
          this.isUpdateInProgress = false;
        },
        error: () => {
          this.showSavingError();
          this.isUpdateInProgress = false;
        },
      });
  }

  private showSavingError(): void {
    const title = 'Please refresh the page';
    const description = 'Something went wrong when saving splits selection.';
    const error: SnackbarMessageError = { title, description };
    const options: SnackbarMessageOptions = {
      hasClose: true,
      timeOut: undefined,
    };
    this.snackbarService.error({ ...error, options });
  }
}
