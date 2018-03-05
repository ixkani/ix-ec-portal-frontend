import { EventEmitter } from '@angular/core';
export declare type ScrollEvent = {
    originalEvent: Event;
    isReachingBottom: boolean;
    isWindowEvent: boolean;
};
export declare class ScrollDirective {
    onScroll: EventEmitter<ScrollEvent>;
    bottomOffset: number;
    constructor();
    scrolled($event: Event): void;
    windowScrolled($event: Event): void;
    protected windowScrollEvent($event: Event): void;
    protected elementScrollEvent($event: Event): void;
}
