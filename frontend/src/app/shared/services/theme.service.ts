import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private darkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.darkMode.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  public initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.setTheme(isDarkMode);
  }

  public toggleTheme(): void {
    this.setTheme(!this.darkMode.value);
  }

  public setTheme(isDark: boolean): void {
    this.darkMode.next(isDark);
    
    if (isDark) {
      this.renderer.addClass(document.body, 'dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  public isDarkMode(): Observable<boolean> {
    return this.isDarkMode$;
  }
}