import { EventTargetInterruptSource } from './eventtargetinterruptsource';
export declare class DocumentInterruptSource extends EventTargetInterruptSource {
    constructor(events: string, throttleDelay?: number);
    filterEvent(event: any): boolean;
}
