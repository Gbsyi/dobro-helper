import { TestInfo } from "../models/test-info";
import { throwError } from "./common";
import { getCurrentQuestionName, getTestName } from "./retrievers";

export class QuestionForm {
    private static Instance: QuestionForm | null = null; 

    answerInputs: Record<string, HTMLInputElement>  = {};
    
    testName: string;

    questionName: string;

    isMultiple: boolean;

    onFormChanged?: (value: string[]) => void;

    constructor() {
        this.testName = getTestName();
        this.questionName = getCurrentQuestionName();   

        const form = document.getElementById('learn_test_answer_form') as HTMLFormElement;
        this.isMultiple = form['answer[]']
            ? true
            : form['answer']
            ? false
            : throwError(new Error('Встречен неподдерживаемый вид ответа'));

        getFormInputs(form).forEach((item) => {
            const input = item as HTMLInputElement;
            const answerLabel = input.labels != null ? input.labels[0].innerText : throwError(new Error('Не удалось определить вариант ответа на форме'));
            this.answerInputs[answerLabel] = input
        });

        form.addEventListener('change', () => {
            const answers = getFormInputs(form)
                .filter(item => item.checked)
                .map(item => item.labels != null 
                    ? item.labels[0].innerText 
                    : throwError(new Error('Не удалось определить вариант ответа на форме')));

            this.onFormChanged?.(answers);
        })

    }



    static getInstance() {
        if (this.Instance === null) {
            this.Instance = new QuestionForm();
        }

        return this.Instance;
    }

    applyValue(value: TestInfo) {
        const question = value.questions[this.questionName];

        for(const [answerName, answerInput] of Object.entries(this.answerInputs)) {
            answerInput.checked = question.answer.includes(answerName);
        }
    }
}

function getFormInputs(form: HTMLFormElement) {
    const answers = (form['answer[]'] || form['answer']) as RadioNodeList
    return Array.from(answers) as HTMLInputElement[];
}