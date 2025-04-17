// ==UserScript==
// @name dobro-helper
// @version 1.0.0
// @namespace http://tampermonkey.net/
// @description Script for easier usage of dobro.ru site.
// @author Gbsyi
// @homepage https://github.com/gbsyi/dobro-helper#readme
// @license https://opensource.org/licenses/MIT
// @match https://edu.dobro.ru/courses/*
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 607:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(527);
const database_1 = __webpack_require__(563);
const question_form_1 = __webpack_require__(620);
const retrievers_1 = __webpack_require__(429);
const state_1 = __webpack_require__(263);
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield database_1.DobroDatabase.CreateDatabase();
        const isTestPage = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > h3') != null;
        if (isTestPage) {
            console.log('Обрабатывается страница теста');
            yield handleTestPage(db);
            return;
        }
        const resultsObjects = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > div.content-box__header > h3');
        if (resultsObjects == null) {
            console.log('Помощник не активен');
            return;
        }
        if ((_a = resultsObjects.textContent) === null || _a === void 0 ? void 0 : _a.includes('Тест не завершен')) {
            console.log('Получаем список ошибок');
            yield handleErrorsPage(db);
            console.log('Успех');
            return;
        }
        console.log('Помощник не активен');
    });
}
function handleTestPage(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = question_form_1.QuestionForm.getInstance();
        console.log(form);
        console.log(db);
        let currentTestInfo = yield db.get(form.testName);
        if (!currentTestInfo) {
            currentTestInfo = {
                testName: form.testName,
                questions: {}
            };
        }
        const isNewQuestion = currentTestInfo.questions[form.questionName] === undefined;
        const state = state_1.DobroState.CreateState({
            defaultValue: currentTestInfo
        });
        state.subscribe((value) => __awaiter(this, void 0, void 0, function* () {
            yield db.set(value.testName, value);
        }));
        form.onFormChanged = (value) => {
            state.updateQuestion(form.questionName, value);
        };
        if (!isNewQuestion) {
            addApplyButton(state);
            addPreviousAttemptInfo(state.get());
        }
    });
}
function applySavedTestInfo(savedTestInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = question_form_1.QuestionForm.getInstance();
        form.applyValue(savedTestInfo);
    });
}
function addApplyButton(state) {
    var _a;
    const buttonRow = (_a = document.querySelector('#learn_test_answer_form > div.content-box__quiz-submit')) !== null && _a !== void 0 ? _a : (0, common_1.throwError)(new Error('Строка кнопок не найдена на форме'));
    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.innerText = 'Применить сохранённый ответ';
    applyButton.className = 'btn btn-lg btn-secondary js-submit';
    applyButton.onclick = () => {
        const testInfo = state.get();
        applySavedTestInfo(testInfo);
    };
    buttonRow.appendChild(applyButton);
}
function addPreviousAttemptInfo(testInfo) {
    const questionInfo = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > div');
    if (!questionInfo) {
        (0, common_1.throwError)(new Error('Не удалось получить номер вопроса'));
    }
    const currentQustionName = (0, retrievers_1.getCurrentQuestionName)();
    const currentQuestion = testInfo.questions[currentQustionName];
    switch (currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.result) {
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
function handleErrorsPage(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const testName = (0, retrievers_1.getTestName)();
        const testInfo = yield db.get(testName);
        if (!testInfo) {
            (0, common_1.throwError)(new Error('Не удаётся получить данные теста'));
        }
        const failedQuestions = getFailedQuestions();
        for (const [questionName, question] of Object.entries(testInfo.questions)) {
            testInfo.questions[questionName] = Object.assign(Object.assign({}, question), { result: failedQuestions.includes(questionName)
                    ? 'Failed'
                    : 'Correct' });
        }
        db.set(testName, testInfo);
    });
}
function getFailedQuestions() {
    const failedQuestions = document.querySelectorAll('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > div.content-box__quiz > div.content-box__quiz-errors > div:nth-child(n) > div.info-card__content > p:nth-child(1)');
    if (failedQuestions.length == 0) {
        (0, common_1.throwError)(new Error('Не удалось получить список ошибок'));
    }
    return Array.from(failedQuestions)
        .map(x => { var _a, _b; return (_b = (_a = x.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : (0, common_1.throwError)(new Error('Не удалось получить текст ошибки')); });
}
main();


/***/ }),

/***/ 527:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.throwError = void 0;
function throwError(e) {
    throw new Error();
}
exports.throwError = throwError;


/***/ }),

/***/ 563:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DobroDatabase = void 0;
class DobroDatabase {
    constructor(db) {
        this.db = db;
    }
    static CreateDatabase() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window))
                reject('DB not supported');
            const dbOpen = indexedDB.open(DobroDatabase.STORE_NAME, 1);
            dbOpen.onupgradeneeded = e => {
                switch (e.oldVersion) {
                    case 0:
                        dbOpen.result.createObjectStore(DobroDatabase.TESTS_STORE_KEY);
                        break;
                    default:
                        break;
                }
            };
            dbOpen.onsuccess = () => {
                const db = dbOpen.result;
                resolve(new DobroDatabase(db));
            };
            dbOpen.onerror = (e) => {
                console.error(e);
                reject(`IndexedDB error`);
            };
        });
    }
    set(testName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(DobroDatabase.TESTS_STORE_KEY, 'readwrite'), store = transaction.objectStore(DobroDatabase.TESTS_STORE_KEY);
            store.put(value, testName);
            transaction.oncomplete = () => {
                console.log('Ответ сохранён в бд');
                resolve();
            };
            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }
    get(testName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(DobroDatabase.TESTS_STORE_KEY, 'readonly'), store = transaction.objectStore(DobroDatabase.TESTS_STORE_KEY), request = store.get(testName);
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}
DobroDatabase.STORE_NAME = 'dobro';
DobroDatabase.TESTS_STORE_KEY = 'tests';
exports.DobroDatabase = DobroDatabase;


/***/ }),

/***/ 620:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuestionForm = void 0;
const common_1 = __webpack_require__(527);
const retrievers_1 = __webpack_require__(429);
class QuestionForm {
    constructor() {
        this.answerInputs = {};
        this.testName = (0, retrievers_1.getTestName)();
        this.questionName = (0, retrievers_1.getCurrentQuestionName)();
        const form = document.getElementById('learn_test_answer_form');
        this.isMultiple = form['answer[]']
            ? true
            : form['answer']
                ? false
                : (0, common_1.throwError)(new Error('Встречен неподдерживаемый вид ответа'));
        getFormInputs(form).forEach((item) => {
            const input = item;
            const answerLabel = input.labels != null ? input.labels[0].innerText : (0, common_1.throwError)(new Error('Не удалось определить вариант ответа на форме'));
            this.answerInputs[answerLabel] = input;
        });
        form.addEventListener('change', () => {
            var _a;
            const answers = getFormInputs(form)
                .filter(item => item.checked)
                .map(item => item.labels != null
                ? item.labels[0].innerText
                : (0, common_1.throwError)(new Error('Не удалось определить вариант ответа на форме')));
            (_a = this.onFormChanged) === null || _a === void 0 ? void 0 : _a.call(this, answers);
        });
    }
    static getInstance() {
        if (this.Instance === null) {
            this.Instance = new QuestionForm();
        }
        return this.Instance;
    }
    applyValue(value) {
        const question = value.questions[this.questionName];
        for (const [answerName, answerInput] of Object.entries(this.answerInputs)) {
            answerInput.checked = question.answer.includes(answerName);
        }
    }
}
QuestionForm.Instance = null;
exports.QuestionForm = QuestionForm;
function getFormInputs(form) {
    const answers = (form['answer[]'] || form['answer']);
    return Array.from(answers);
}


/***/ }),

/***/ 429:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCurrentQuestionName = exports.getTestName = void 0;
const common_1 = __webpack_require__(527);
function getTestName() {
    var _a;
    const testTitle = (_a = document.querySelector('#lk-root > div.lk-root__content > section > div.section-title > h1')) === null || _a === void 0 ? void 0 : _a.textContent;
    if (!testTitle) {
        (0, common_1.throwError)(new Error('Тест не найден'));
    }
    return testTitle.trim();
}
exports.getTestName = getTestName;
function getCurrentQuestionName() {
    var _a, _b;
    const questionName = (_b = (_a = document.querySelector('#lk-root > div.lk-root__content > section > div.content-box.mod-quiz > h3')) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : (0, common_1.throwError)(new Error('Вопрос не найден'));
    if (!questionName) {
        (0, common_1.throwError)(new Error('Тест не найден'));
    }
    return questionName.trim();
}
exports.getCurrentQuestionName = getCurrentQuestionName;


/***/ }),

/***/ 263:
/***/ (function(__unused_webpack_module, exports) {


var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DobroState_value, _DobroState_target;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DobroState = void 0;
class DobroState {
    constructor(options) {
        _DobroState_value.set(this, void 0);
        _DobroState_target.set(this, new EventTarget());
        __classPrivateFieldSet(this, _DobroState_value, options.defaultValue, "f");
        this.subscribe((value) => {
            __classPrivateFieldSet(this, _DobroState_value, value, "f");
        });
    }
    static CreateState(options) {
        return new DobroState(options);
    }
    updateQuestion(questionName, answer) {
        const updatedValue = {
            testName: __classPrivateFieldGet(this, _DobroState_value, "f").testName,
            questions: Object.assign(Object.assign({}, __classPrivateFieldGet(this, _DobroState_value, "f").questions), { [questionName]: {
                    result: 'Unknown',
                    answer
                } })
        };
        if (JSON.stringify(__classPrivateFieldGet(this, _DobroState_value, "f")) === JSON.stringify(updatedValue)) {
            console.log('Ответ не сохранён в стор');
            return;
        }
        console.log('Ответ сохранён в стор');
        __classPrivateFieldGet(this, _DobroState_target, "f").dispatchEvent(new CustomEvent('set', {
            detail: updatedValue
        }));
    }
    get() {
        return __classPrivateFieldGet(this, _DobroState_value, "f");
    }
    subscribe(updateCallback) {
        __classPrivateFieldGet(this, _DobroState_target, "f").addEventListener('set', (e) => updateCallback(e.detail));
    }
}
exports.DobroState = DobroState;
_DobroState_value = new WeakMap(), _DobroState_target = new WeakMap();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(607);
/******/ 	
/******/ })()
;