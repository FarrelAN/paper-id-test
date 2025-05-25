import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener as CoreHostListener,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    TitleCasePipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  private allUsers: User[] = [];
  isLoading = true;
  error: string | null = null;
  searchTerm: string = '';

  currentSortKey: string = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  statusFilterOptions: Array<{
    value: 'all' | 'active' | 'inactive';
    label: string;
  }> = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';
  isStatusDropdownOpen: boolean = false;

  userForCardDisplay: User | null = null;
  private activeHoverRowUser: User | null = null;
  hoverCardStyle: any = {
    display: 'none',
    opacity: 0,
    transform: 'translateY(-10px) scale(0.95)',
  };

  private showCardTimeoutId!: ReturnType<typeof setTimeout>;
  private hideCardGraceTimeoutId!: ReturnType<typeof setTimeout>;
  private completeHideCardTimeoutId!: ReturnType<typeof setTimeout>;

  private cardIsCurrentlyVisible: boolean = false;

  private readonly CARD_OFFSET_X = 20;
  private readonly CARD_OFFSET_Y = 15;
  private readonly INITIAL_HOVER_DELAY_MS = 1000;
  private readonly FADE_ANIMATION_DURATION_MS = 300;
  private readonly MOUSE_LEAVE_GRACE_PERIOD_MS = 100;

  constructor(
    private userService: UserService,
    private router: Router,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  ngOnDestroy(): void {
    this.clearAllTimeouts();
  }

  @CoreHostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement
      .querySelector('.status-filter-dropdown-container')
      ?.contains(event.target);
    if (!clickedInside && this.isStatusDropdownOpen) {
      this.isStatusDropdownOpen = false;
    }
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.updateDisplayedUsers();
        this.isLoading = false;
      },
      error: () => {
        this.users = [];
        this.error = 'Failed to load users…';
        this.isLoading = false;
      },
    });
  }

  applySearchFilter(): void {
    this.updateDisplayedUsers();
  }

  toggleStatusDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  selectStatus(statusValue: 'all' | 'active' | 'inactive'): void {
    this.selectedStatus = statusValue;
    this.isStatusDropdownOpen = false;
    this.updateDisplayedUsers();
  }

  getSelectedStatusLabel(): string {
    const selectedOption = this.statusFilterOptions.find(
      (option) => option.value === this.selectedStatus,
    );
    return selectedOption ? selectedOption.label : 'Status';
  }

  requestSort(key: string): void {
    if (this.currentSortKey === key) {
      this.currentSortDirection =
        this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortKey = key;
      this.currentSortDirection = 'asc';
    }
    this.updateDisplayedUsers();
  }

  private updateDisplayedUsers(): void {
    let processedUsers = [...this.allUsers];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      processedUsers = processedUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
          (user.username &&
            user.username.toLowerCase().includes(lowerCaseSearchTerm)) ||
          user.website.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }

    if (this.selectedStatus !== 'all') {
      processedUsers = processedUsers.filter((user) => {
        const isActive = user.id % 2 === 0;
        return (
          (this.selectedStatus === 'active' && isActive) ||
          (this.selectedStatus === 'inactive' && !isActive)
        );
      });
    }

    if (this.currentSortKey) {
      processedUsers.sort((a, b) => {
        const getValue = (obj: any, path: string) =>
          path.split('.').reduce((o, k) => (o || {})[k], obj);
        const valA = getValue(a, this.currentSortKey);
        const valB = getValue(b, this.currentSortKey);
        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return this.currentSortDirection === 'asc'
          ? comparison
          : comparison * -1;
      });
    }
    this.users = processedUsers;
  }

  navigateToUser(userId: number): void {
    this.clearAllTimeouts();
    this.userForCardDisplay = null;
    this.activeHoverRowUser = null;
    this.cardIsCurrentlyVisible = false;
    this.hoverCardStyle = {
      display: 'none',
      opacity: 0,
      transform: 'translateY(-10px) scale(0.95)',
    };
    this.router.navigate(['/user', userId]);
  }

  onRowMouseEnter(event: MouseEvent, user: User): void {
    this.clearAllTimeouts();
    this.activeHoverRowUser = user;

    if (this.cardIsCurrentlyVisible) {
      if (this.userForCardDisplay !== user) {
        this.userForCardDisplay = user;
        this.updateCardPosition(event.clientX, event.clientY);
        this.hoverCardStyle = {
          ...this.hoverCardStyle,
          display: 'block',
          opacity: 1,
          transform: 'translateY(0) scale(1)',
        };
      } else {
        this.updateCardPosition(event.clientX, event.clientY);
      }
    } else {
      this.updateCardPosition(event.clientX, event.clientY);
      this.hoverCardStyle = {
        ...this.hoverCardStyle,
        display: 'block',
        opacity: 0,
        transform: 'translateY(-10px) scale(0.95)',
      };
      this.userForCardDisplay = user;

      this.showCardTimeoutId = setTimeout(() => {
        if (this.activeHoverRowUser === user) {
          this.hoverCardStyle = {
            ...this.hoverCardStyle,
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          };
          this.cardIsCurrentlyVisible = true;
        } else {
          this.userForCardDisplay = null;
          this.hoverCardStyle.display = 'none';
        }
      }, this.INITIAL_HOVER_DELAY_MS);
    }
  }

  onRowMouseMove(event: MouseEvent): void {
    if (this.userForCardDisplay && this.activeHoverRowUser) {
      this.updateCardPosition(event.clientX, event.clientY);
    }
  }

  private updateCardPosition(cursorX: number, cursorY: number): void {
    let cardLeft = cursorX + this.CARD_OFFSET_X;
    let cardTop = cursorY + this.CARD_OFFSET_Y;
    const cardEstimatedWidth = 330;
    const cardEstimatedHeight = 290;

    if (cardLeft + cardEstimatedWidth > window.innerWidth) {
      cardLeft = cursorX - cardEstimatedWidth - this.CARD_OFFSET_X;
    }
    if (cardTop + cardEstimatedHeight > window.innerHeight) {
      cardTop = cursorY - cardEstimatedHeight - this.CARD_OFFSET_Y;
    }
    if (cardLeft < 10) cardLeft = 10;
    if (cardTop < 10) cardTop = 10;

    this.hoverCardStyle = {
      ...this.hoverCardStyle,
      left: `${cardLeft}px`,
      top: `${cardTop}px`,
    };
  }

  onRowMouseLeave(): void {
    this.clearAllTimeouts();
    this.activeHoverRowUser = null;

    this.hideCardGraceTimeoutId = setTimeout(() => {
      if (!this.activeHoverRowUser && this.userForCardDisplay) {
        this.hoverCardStyle = {
          ...this.hoverCardStyle,
          opacity: 0,
          transform: 'translateY(-10px) scale(0.95)',
        };
        this.cardIsCurrentlyVisible = false;

        this.completeHideCardTimeoutId = setTimeout(() => {
          if (!this.activeHoverRowUser) {
            this.userForCardDisplay = null;
            this.hoverCardStyle = { ...this.hoverCardStyle, display: 'none' };
          }
        }, this.FADE_ANIMATION_DURATION_MS);
      }
    }, this.MOUSE_LEAVE_GRACE_PERIOD_MS);
  }

  onCardMouseEnter(): void {
    this.clearAllTimeouts();
  }

  onCardMouseLeave(): void {
    this.activeHoverRowUser = null;
    this.onRowMouseLeave();
  }

  private clearAllTimeouts(): void {
    clearTimeout(this.showCardTimeoutId);
    clearTimeout(this.hideCardGraceTimeoutId);
    clearTimeout(this.completeHideCardTimeoutId);
  }
}
