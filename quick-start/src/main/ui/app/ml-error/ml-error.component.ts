import { Component, Input, OnInit } from '@angular/core';

import { MlError, MlErrorStack } from './ml-error';
import * as _ from 'lodash';

@Component({
  selector: 'app-ml-error',
  templateUrl: './ml-error.component.html',
  styleUrls: ['./ml-error.style.scss'],
})
export class MlErrorComponent implements OnInit {
  @Input() error: MlError;

  activeStack: MlErrorStack;
  variables: Array<string>;

  ngOnInit() {
  }

  setActiveStack(stack: MlErrorStack) {
    if (this.isActiveStack(stack)) {
      this.activeStack = null;
      this.variables = null;
      return;
    }

    this.activeStack = stack;
    this.variables = Object.keys(stack.variables);
  }

  isActiveStack(stack: MlErrorStack) {
    return this.activeStack === stack;
  }
}
