import { throwError } from "./lib/common";
import { DobroDatabase } from "./lib/database";
import { QuestionForm } from "./lib/question-form";
import { getCurrentQuestionName, getTestName } from "./lib/retrievers";
import { DobroState } from "./lib/state";
import { Question, TestInfo } from "./models/test-info";

async function main() {
    const db = await DobroDatabase.CreateDatabase();
    const isTestPage = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > h3') != null;
    if (isTestPage) {
        console.log('Обрабатывается страница теста');
        await handleTestPage(db);
        return;
    }
    
    const resultsObjects = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > div.content-box__header > h3');
    if (resultsObjects == null) {
        console.log('Помощник не активен')
        return;
    }

    if (resultsObjects.textContent?.includes('Тест не завершен')) {
        console.log('Получаем список ошибок');
        await handleErrorsPage(db);
        console.log('Успех');
        return;
    }

    console.log('Помощник не активен');
}

async function handleTestPage(db: DobroDatabase) {
    const form = QuestionForm.getInstance();
    console.log(form);
    console.log(db);
    let currentTestInfo = await db.get(form.testName);
    if (!currentTestInfo) {
        currentTestInfo = {
            testName: form.testName,
            questions: {}
        }
    }
    const isNewQuestion = currentTestInfo.questions[form.questionName] === undefined;

    const state = DobroState.CreateState({
        defaultValue: currentTestInfo
    });

    state.subscribe(async (value) => {
        await db.set(value.testName, value);
    });

    form.onFormChanged = (value) => {
        state.updateQuestion(form.questionName, value);
    }

    if (!isNewQuestion) {
        addApplyButton(state);
        addPreviousAttemptInfo(state.get());
    }
}

async function applySavedTestInfo(savedTestInfo: TestInfo) {
    const form = QuestionForm.getInstance();
    form.applyValue(savedTestInfo);
}

function addApplyButton(state: DobroState) {
    const buttonRow = document.querySelector('#learn_test_answer_form > div.content-box__quiz-submit') 
        ?? throwError(new Error('Строка кнопок не найдена на форме'));

    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.innerText = 'Применить сохранённый ответ';
    applyButton.className ='btn btn-lg btn-secondary js-submit';

    applyButton.onclick = () => {
        const testInfo = state.get();
        applySavedTestInfo(testInfo)
    }
    buttonRow.appendChild(applyButton);
}

function addPreviousAttemptInfo(testInfo: TestInfo) {
    const questionInfo = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > div');
    if (!questionInfo) {
        throwError(new Error('Не удалось получить номер вопроса'));
    }
    const currentQustionName = getCurrentQuestionName();
    const currentQuestion = testInfo.questions[currentQustionName];
    switch (currentQuestion?.result) {
        case 'Correct':
            questionInfo.innerHTML += " <br> Предыдущая попытка: <span style='color: green'>Верно</span>";
            break;
        case 'Failed':
            questionInfo.innerHTML += " <br> Предыдущая попытка: <span style='color: red'>Ошибка</span>";
            break;
        default:
            break;
    }
}

async function handleErrorsPage(db: DobroDatabase) {
    const testName = getTestName();
    const testInfo = await db.get(testName);
    if (!testInfo) {
        throwError(new Error('Не удаётся получить данные теста'));
    }

    const failedQuestions = getFailedQuestions();
    for(const [questionName, question] of Object.entries(testInfo.questions)) {
        testInfo.questions[questionName] = {
            ...question,
            result: failedQuestions.includes(questionName)
                ? 'Failed'
                : 'Correct'
        }
    }

    db.set(testName, testInfo);
}

function getFailedQuestions(): string[] {
    const failedQuestions = document.querySelectorAll('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > div.content-box__quiz > div.content-box__quiz-errors > div:nth-child(n) > div.info-card__content > p:nth-child(1)')
    if (failedQuestions.length == 0) {
        throwError(new Error('Не удалось получить список ошибок'));
    }

    return Array.from(failedQuestions)
        .map(x => x.textContent?.trim() ?? throwError(new Error('Не удалось получить текст ошибки')));
}

main();