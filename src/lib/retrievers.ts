import { throwError } from "./common";

export function getTestName(): string {
    const testTitle = document.querySelector('#lk-root > div.lk-root__content > section > div.section-title > h1')?.textContent;
    if (!testTitle) {
        throwError(new Error('Тест не найден'));    
    } 
    
    return testTitle.trim();
}

export function getCurrentQuestionName(): string {
    const questionName = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > h3')?.textContent ?? throwError(new Error('Вопрос не найден'));   
    if (!questionName) {
        throwError(new Error('Тест не найден'));    
    } 
    
    return questionName.trim();
}
