import { Injectable } from '@angular/core';
import { PINNED_DEALS_LOCAL_STORAGE_KEY } from './pinned-deals.constants';
import { PinnedDeals } from '<path-to-file>/pinned-deals.interfaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PinnedDealsService {
  private pinnedDealsMap$ = new BehaviorSubject<PinnedDeals | null>(null);

  public getPinnedDeals$(entityId: string): Observable<string[]> {
    if (!this.pinnedDealsMap$.value) {
      const parsedDealsMap = this.getParsedDealList();
      this.pinnedDealsMap$.next(parsedDealsMap);
    }

    return this.pinnedDealsMap$
      .asObservable()
      .pipe(map((values: PinnedDeals) => values?.[entityId] ?? []));
  }

  public toggleDeal(entityId: string, dealId: string, state: boolean): boolean {
    const pinnedDealsMap = this.getParsedDealList();
    const pinnedDealsList = pinnedDealsMap[entityId] ?? [];
    const newDealIdsList = state
      ? [...pinnedDealsList, dealId]
      : pinnedDealsList.filter((id) => id !== dealId);

    const modifiedDealList = {
      ...pinnedDealsMap,
      [entityId]: newDealIdsList,
    };

    const saveStatus = this.updateLocalStorage(modifiedDealList);
    if (!saveStatus) {
      return false;
    }

    this.pinnedDealsMap$.next(modifiedDealList);
    return true;
  }

  public updatePinnedDealsScope(entityId: string, dealIds: string[]): void {
    const modifiedDealList = this.getParsedDealList();
    if (!modifiedDealList?.[entityId]) {
      return;
    }

    const modifiedDealsList = modifiedDealList[entityId].filter((dealId) =>
      dealIds.includes(dealId)
    );

    const newDealsList = {
      ...modifiedDealList,
      [entityId]: modifiedDealsList,
    };

    const saveStatus = this.updateLocalStorage(newDealsList);
    if (saveStatus) {
      this.pinnedDealsMap$.next(newDealsList);
    }
  }

  private getParsedDealList(): PinnedDeals {
    const modifiedDealList = localStorage.getItem(
      PINNED_DEALS_LOCAL_STORAGE_KEY
    );

    let pinnedDeals: PinnedDeals;

    try {
      pinnedDeals = JSON.parse(modifiedDealList) ?? {};
    } catch (e) {
      console.error('failed to read pinned deals data');
      pinnedDeals = {};
    }

    return pinnedDeals;
  }

  private updateLocalStorage(list: PinnedDeals): boolean {
    let dealListStr: string;

    try {
      dealListStr = JSON.stringify(list);
    } catch (e) {
      console.error('failed to save pinned deals data');
      return false;
    }

    localStorage.setItem(
      PINNED_DEALS_LOCAL_STORAGE_KEY,
      dealListStr
    );

    return true;
  }
}
