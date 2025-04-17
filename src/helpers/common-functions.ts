export function querySelector<TElement extends keyof HTMLElementTagNameMap>(obj: Element, selector: string) {
    return obj.querySelector(selector) as HTMLElementTagNameMap[TElement];
}

export function querySelectorAll<TElement extends keyof HTMLElementTagNameMap>(obj: Element, selector: string) {
    return obj.querySelectorAll(selector) as NodeListOf<HTMLElementTagNameMap[TElement]>;
}

export function getElementById<TElement extends keyof HTMLElementTagNameMap>(selector: string) {
    return document.getElementById(selector) as HTMLElementTagNameMap[TElement];
}