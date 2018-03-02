import { Component, OnInit, Input} from '@angular/core';

@Component({
    selector: 'loading-message',
    templateUrl: '../common/loading-message.component.html',
    styles: [
        `
        `
    ]
})

export class LoadingMessageComponent implements OnInit {
    @Input()
    showLoading: any;
    @Input()
    loadingMessage:any;
    @Input()
    errorMessage:any;
    constructor(){

    }
    ngOnInit() {

    }
}