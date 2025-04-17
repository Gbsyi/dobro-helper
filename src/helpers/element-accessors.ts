import { getElementById } from "./common-functions";

export const ElementAccessor = {
    TestPage: {
        AnswerForm: () => getElementById<'form'>('learn_test_answer_form')
    }
} as const;