import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/fromEvent';
import { InterruptSource } from './interruptsource';
export declare class EventTargetInterruptSource extends InterruptSource {
    protected target: any;
    protected events: string;
    protected throttleDelay: number;
    private eventSrc;
    private eventSubscription;
    constructor(target: any, events: string, throttleDelay?: number);
    protected filterEvent(event: any): boolean;
}
