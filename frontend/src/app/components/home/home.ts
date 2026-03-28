import { Component, ChangeDetectionStrategy, signal, inject, AfterViewInit, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private observer: IntersectionObserver | null = null;

  navScrolled = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      if (params.get('type') === 'recovery' && params.get('access_token')) {
        window.location.replace('/reset-password' + window.location.hash);
        return;
      }
    }
  }

  features = signal([
    {
      title: 'Guided Step-by-Step',
      description: 'A TurboTax-style wizard walks you through every asset class — cash, gold, investments, crypto, and more.',
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      title: 'Scholar-Backed Rules',
      description: 'Built on Joe Bradford\'s Simple Zakat Guide methodology — trusted by thousands of Muslims across North America.',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      title: 'Saved History',
      description: 'Every calculation is stored securely. Compare year over year and never lose track of your zakat obligation.',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      title: 'Jewelry & Gold Tracking',
      description: 'Catalog your gold and silver with weight, karat, and current market prices. Know your nisab at a glance.',
      iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    }
  ]);

  steps = signal([
    {
      number: '01',
      title: 'Enter Your Assets',
      description: 'Cash, savings, gold, silver, investments, crypto, business inventory — enter each category with guided prompts and helpful tooltips.'
    },
    {
      number: '02',
      title: 'Review & Calculate',
      description: 'We deduct your expenses and liabilities, check your nisab threshold, and compute your exact zakat obligation at 2.5%.'
    },
    {
      number: '03',
      title: 'Give with Confidence',
      description: 'See a clear breakdown of what you owe, export a summary, and track your giving over time. Fulfill your pillar with certainty.'
    }
  ]);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('scroll', this.handleScroll);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      this.observer?.observe(el);
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.handleScroll);
    this.observer?.disconnect();
  }

  private handleScroll = (): void => {
    this.navScrolled.set(window.scrollY > 40);
  };

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
