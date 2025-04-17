import { Questions, TestInfo } from "../models/test-info";

export interface StateOptions {
    defaultValue: TestInfo;
}

export class DobroState {
    #value: TestInfo;

    #target = new EventTarget();

    constructor(options: StateOptions) {
        this.#value = options.defaultValue;

        this.subscribe((value) => {
            this.#value = value;
        })
    }

    static CreateState(options: StateOptions) {
        return new DobroState(options);
    }

    updateQuestion(questionName: string, answer: string[]) {
        const updatedValue: TestInfo = {
            testName: this.#value.testName,
            questions: {
                ...this.#value.questions,
                [questionName]: {
                    result: 'Unknown',
                    answer
                }
            }
        };
        if (JSON.stringify(this.#value) === JSON.stringify(updatedValue)) {
            console.log('Ответ не сохранён в стор')
            return;
        } 
        
        console.log('Ответ сохранён в стор')
        this.#target.dispatchEvent(new CustomEvent('set', {
            detail: updatedValue
        }));
    }

    get(): TestInfo {
        return this.#value;
    }

    subscribe(updateCallback: (value: TestInfo) => Promise<void> | void) {
        this.#target.addEventListener('set', (e) => updateCallback((e as CustomEvent).detail));
    }
}