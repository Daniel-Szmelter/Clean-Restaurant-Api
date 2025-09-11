// src/test.ts
/**********************************************************************
 * Minimalny bootstrap do Angular + Karma
 * - Bez hacków na window.location (problemy w Chrome 140+)
 * - Stabilne środowisko testowe
 **********************************************************************/

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

console.log('[test.ts] Angular test bootstrap starting');

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

console.log('[test.ts] Angular test environment initialized');
