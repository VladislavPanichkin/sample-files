import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PinnedDealsService } from '<path-to-file>';
import { CommonDataService } from '<path-to-file>';

@Component({
  selector: 'my-app-deal-pin',
  templateUrl: './deal-pin.component.html',
  styleUrls: ['./deal-pin.component.scss'],
})
export class DealPinComponent implements OnInit, OnDestroy {
  @Input() public dealId: string;

  public iconVisible = false;

  private entityId: string;
  private destroy$ = new Subject<void>();

  constructor(
    private commonDataService: CommonDataService,
    private pinnedDealService: PinnedDealsService
  ) {}

  public ngOnInit(): void {
    this.commonDataService.id$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.entityId = id;
      this.presetState();
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public togglePin(): void {
    const newState = !this.iconVisible;
    const saveState = this.pinnedDealService.toggleDeal(
      this.entityId,
      this.dealId,
      newState
    );

    if (!saveState) {
      return;
    }

    this.iconVisible = newState;
  }

  public get iconTooltip(): string {
    return this.iconVisible
      ? 'Unpin the deal from the top'
      : 'Pin the deal to the top of the list';
  }

  private presetState(): void {
    this.pinnedDealService
      .getPinnedDeals$(this.entityId)
      .pipe(take(1))
      .subscribe((dealIds) => {
        this.iconVisible = dealIds.includes(this.dealId);
      });
  }
}
