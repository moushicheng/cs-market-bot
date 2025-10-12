export enum ContextKey {
    Ctx = 'ctx'
}
export class ContextRegistry {
    private static instance: ContextRegistry
    private context: any = {}
    private constructor() {
    }
    public static getInstance(): ContextRegistry {
        if (!ContextRegistry.instance) {
            ContextRegistry.instance = new ContextRegistry()
        }
        return ContextRegistry.instance
    }
    
    set(key:ContextKey,value:any){
        this.context[key] = value
    }
    get<T>(key:ContextKey):T{
        return this.context[key] as T
    }
}