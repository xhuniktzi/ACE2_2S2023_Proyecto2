import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrlPage } from './url.page';

describe('UrlPage', () => {
  let component: UrlPage;
  let fixture: ComponentFixture<UrlPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UrlPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
