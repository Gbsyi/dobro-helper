export interface TestInfo {
    testName: string;
    questions: Questions
}

export interface Question {
    result: 'Correct' | 'Failed' | 'Unknown' | undefined;
    answer: Answers;
}

export type Answers = string[];
export type Questions = Record<string, Question>;