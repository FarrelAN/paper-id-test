import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { APP_NAV_ITEMS, NavItem } from '../../nav-item';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() isMobile: boolean = false;

  @Output() sidebarToggled = new EventEmitter<boolean>();

  private _isCollapsed = true;
  public navItems: NavItem[] = APP_NAV_ITEMS;

  public isMobileMenuVisible: boolean = false;

  @HostBinding('class.is-mobile') get applyIsMobileClass() {
    return this.isMobile;
  }

  @HostBinding('class.expanded') get isExpandedClass() {
    return !this.isMobile && !this._isCollapsed;
  }

  @HostBinding('class.mobile-collapsed') get isMobileCollapsedClass() {
    return this.isMobile && !this.isMobileMenuVisible;
  }

  @HostBinding('class.mobile-overlay-active') get isMobileOverlayActiveClass() {
    return this.isMobile && this.isMobileMenuVisible;
  }

  get isSidebarCollapsed(): boolean {
    return this._isCollapsed;
  }

  constructor() {}

  ngOnInit() {
    if (this.isMobile) {
    } else {
      this.setCollapsedState(true);
    }
  }

  private setCollapsedState(collapsed: boolean): void {
    if (this._isCollapsed !== collapsed) {
      this._isCollapsed = collapsed;
      if (!this.isMobile) {
        this.sidebarToggled.emit(this._isCollapsed);
      }
    }
  }

  expandSidebar(): void {
    if (!this.isMobile) {
      this.setCollapsedState(false);
    }
  }

  collapseSidebar(): void {
    if (!this.isMobile) {
      this.setCollapsedState(true);
    }
  }

  public toggleMobileMenu(): void {
    if (this.isMobile) {
      this.isMobileMenuVisible = !this.isMobileMenuVisible;
    }
  }
}
