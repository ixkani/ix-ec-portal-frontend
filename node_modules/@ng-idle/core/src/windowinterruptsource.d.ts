import { EventTargetInterruptSource } from './eventtargetinterruptsource';
export declare class WindowInterruptSource extends EventTargetInterruptSource {
    constructor(events: string, throttleDelay?: number);
}
