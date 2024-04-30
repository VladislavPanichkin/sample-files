import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  Entity,
  ListSortType,
  Query,
} from '@<common-lib>';
import { map, switchMap } from 'rxjs/operators';
import {
  ALL_GRID_DATA_QUERY,
  MY_GRID_DATA_QUERY,
} from '../list.queries';
import { DocumentNode } from 'graphql';
import { IFilterModel } from '../list.interfaces';
import { ListTabType } from '<path-to-file>';
import { Apollo } from 'apollo-angular';

const pickQueryByType = (type: ListTabType): DocumentNode | null => {
  switch (type) {
    case ListTabType.all:
      return ALL_GRID_DATA_QUERY;
    case ListTabType.myWork:
      return MY_GRID_DATA_QUERY;
    default:
      return null;
  }
};

@Injectable({
  providedIn: 'root',
})
export class EntitiesListService {
  private type = new BehaviorSubject<ListTabType>(
    ListTabType.myWork
  );
  public type$ = this.type.asObservable();

  constructor(private apollo: Apollo) {}

  public setType(type: ListTabType) {
    this.type.next(type);
  }

  public getEntities$(
    offset = 0,
    limit = 20,
    sort = ListSortType.ID_DESC,
    filter: IFilterModel
  ): Observable<Entity[]> {
    const input = { limit, offset, sort, ...filter };
    return this.type$.pipe(
      switchMap((type) => {
        const q = pickQueryByType(type);
        if (!q) {
          return of([]);
        }
        return this.apollo
          .query<Query>({
            query: q,
            variables: { input },
            fetchPolicy: 'network-only',
            errorPolicy: 'ignore',
          })
          .pipe(
            map((data) => {
              return data.data?.list ?? data.data?.myEntitiessList;
            })
          );
      })
    );
  }
}
