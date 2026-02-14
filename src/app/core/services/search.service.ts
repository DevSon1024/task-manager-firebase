import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchFilters {
  query: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | null;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _searchState = new BehaviorSubject<SearchFilters>({
    query: '',
    tags: [],
    priority: null
  });

  private _isSearchOpen = new BehaviorSubject<boolean>(false);

  public searchState$ = this._searchState.asObservable();
  public isSearchOpen$ = this._isSearchOpen.asObservable();

  openSearch() {
    this._isSearchOpen.next(true);
  }

  closeSearch() {
    this._isSearchOpen.next(false);
  }

  toggleSearch() {
    this._isSearchOpen.next(!this._isSearchOpen.value);
  }

  updateQuery(query: string) {
    const currentState = this._searchState.value;
    this._searchState.next({ ...currentState, query });
  }

  toggleTag(tag: string) {
    const currentState = this._searchState.value;
    const tags = currentState.tags.includes(tag) 
      ? currentState.tags.filter(t => t !== tag)
      : [...currentState.tags, tag];
    
    this._searchState.next({ ...currentState, tags });
  }

  setPriority(priority: 'low' | 'medium' | 'high' | null) {
    const currentState = this._searchState.value;
    // Toggle off if same priority selected
    const newPriority = currentState.priority === priority ? null : priority;
    this._searchState.next({ ...currentState, priority: newPriority });
  }

  clearFilters() {
    this._searchState.next({
      query: '',
      tags: [],
      priority: null
    });
  }
}
