import questionPageHandler from "./tests/question-page-handler";

type RouteHandler = {
    route: RegExp;
    handle: () => Promise<void> | void
}

const routeHandlers: RouteHandler[] = [
    {
        route: /courses\/.*\/test.*/,
        handle: questionPageHandler
    }
];

/**
 * Примечание: Обрабатывает только первый попавшийся маршрут
 */
export function handleCurrentRoute() {
    const path = URL.parse(document.documentURI);
    if (!path) throw new Error("Ошибка чтения маршрута");

    var route = path.pathname;
    for (const routeHandler of routeHandlers) {
        if (route.match(routeHandler.route)) {
            routeHandler.handle();
            return;
        }
    }
}