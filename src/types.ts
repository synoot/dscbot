// Holds every interface & abstract class used by the code.

// Data Types //

// Object Types //

export type TypeBotOptions = {
    token : string
    prefix : string
    data? : object
    filePath? : string
}

export type BasicObject<T> = {
    [ index : string ] : T
}