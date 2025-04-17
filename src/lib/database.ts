import { TestInfo } from "../models/test-info";

export class DobroDatabase {
    private static Instance: DobroDatabase | null = null;

    private db: IDBDatabase;
    
    private static STORE_NAME = 'dobro';
    private static TESTS_STORE_KEY = 'tests';

    constructor(db: IDBDatabase) {
        this.db = db;
    }
    
    public static async GetInstance(): Promise<DobroDatabase> {
        if (this.Instance === null) {
            this.Instance = await this.CreateDatabase();
        }

        return this.Instance;
    }

    private static CreateDatabase(): Promise<DobroDatabase> {
        if (this.Instance != null) {

        } 
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) reject('DB not supported');
            
            const dbOpen = indexedDB.open(DobroDatabase.STORE_NAME, 1);

            // слушаем событие upgrade 
            dbOpen.onupgradeneeded = e => {
                switch (e.oldVersion){
                    case 0:
                        dbOpen.result.createObjectStore(DobroDatabase.TESTS_STORE_KEY)
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
        })
    }

    public set(testName: string, value: TestInfo): Promise<void> {
        return new Promise((resolve, reject) => {
            // новая транзакция
            const transaction = this.db.transaction(DobroDatabase.TESTS_STORE_KEY, 'readwrite'),
            store = transaction.objectStore(DobroDatabase.TESTS_STORE_KEY);

            // записываем элемент
            store.put(value, testName);

            transaction.oncomplete = () => {
                console.log('Ответ сохранён в бд')
                resolve(); // успех
            };

            transaction.onerror = () => {
                reject(transaction.error); // ошибка
            };
        })
    }

    public get(testName: string): Promise<TestInfo | undefined> {
        return new Promise((resolve, reject) => {
            // новая транзакция
            const transaction = this.db.transaction(DobroDatabase.TESTS_STORE_KEY, 'readonly'),
            store = transaction.objectStore(DobroDatabase.TESTS_STORE_KEY),
        
            // получить значение
            request = store.get(testName);
        
            request.onsuccess = () => {
                resolve(request.result); // успех
            };
        
            request.onerror = () => {
                reject(request.error); // ошибка
            };
        });
    }
} 