'use strict';

export interface IEvent {
    session: {
        sessionId: string,
        application: {
            applicationId: string
        },
        attributes: any,
        user: {
            userId: string,
            accessToken: string
        },
        new: boolean
    };

    request: {
        type: string,
        requestId: string,
        timestamp: number,
        intent: {
            name: string,
            slots: any;
        };
        reason: any;
    }
}

export interface IResponse {
    ask(speechOutput: string, repromptText: string): void;
    tell(speechOutput: ISpeech) : void;
}

export interface IContext {
    awsRequestId: string;
    invokeid: string;
    logGroupName: string;
    logStreamName: string;
    functionName: string;
    memoryLimitInMB: string;
    invokedFunctionArn: string;
    succeed(response?: ISpeechletResponse): void;
    fail(e: any): void;
    functionVersion: string;
}

export interface ISessionStartedRequest {
    requestId: string;
}

export interface ISession {
    sessionId: string;
    attributes: string;
}

export interface ILaunchRequest {
    requestId: string;
}

interface IIntentRequest {
    intent: {
        name: string;
    }
}

export interface ISessionEndedRequest {
    requestId: string;
}

export interface ISlots {

}

export interface IIntent<TSlots extends ISlots> {
    slots: TSlots;
}

export interface IRequestHandler {
    EventHandler: IEventHandler;
    LaunchRequest(event: IEvent, context: IContext, response: IResponse): void;
    IntentRequest(event: IEvent, context: IContext, response: IResponse): void;
    SessionEndedRequest(event: IEvent, context: IContext): void;
}

export interface IEventHandler {
    onSessionStarted(sessionStartedRequest: ISessionStartedRequest, session: ISession): void;
    onLaunch(launchRequest: ILaunchRequest, session: ISession, response: IResponse): void;
    onIntent(intentRequest: IIntentRequest, session: ISession, response: IResponse): void;
    onSessionEnded(sessionEndedRequest: ISessionEndedRequest, session: ISession): void;
}

export interface IIntentHandler<TSlots extends ISlots> {
    handlers: { [s: string]: (intent: IIntent<TSlots>, session: ISession, response: IResponse) => void };
};

export class RequestHandler implements IRequestHandler {

    public get EventHandler(): IEventHandler {
        return this._eventHandler;
    }

    constructor(private _eventHandler: IEventHandler) {
    }
    
    public LaunchRequest(event: IEvent, context: IContext, response: IResponse): void {
        this._eventHandler.onLaunch(event.request, event.session, response);

    }

    public IntentRequest(event: IEvent, context: IContext, response: IResponse): void {
        this._eventHandler.onIntent(event.request, event.session, response);
    }

    public SessionEndedRequest(event: IEvent, context: IContext): void {
        this._eventHandler.onSessionEnded(event.request, event.session);
        context.succeed();
    }
}

/**
 * Override any of the eventHandlers as needed
 */
export class EventHandler<TSlots extends ISlots> implements IEventHandler {
    constructor(private _intentHandler: IIntentHandler<TSlots>) {
    }
    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    public onSessionStarted(sessionStartedRequest: ISessionStartedRequest, session: ISession): void {

    }
    
    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    public onLaunch(launchRequest: ILaunchRequest, session: ISession, response: IResponse): void {

    }
    
    /**
     * Called when the user specifies an intent.
     */
    public onIntent(intentRequest: IIntentRequest, session: ISession, response: IResponse): void {

        var intent = intentRequest.intent,
            intentName = intentRequest.intent.name,
            intentHandler = this._intentHandler.handlers[intentName];
        if (intentHandler) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this._intentHandler, intent, session, response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
    }

    /**
   * Called when the user ends the session.
   * Subclasses could have overriden this function to close any open resources.
   */
    onSessionEnded(sessionEndedRequest: ISessionEndedRequest, session: ISession) {

    }
}

export class AlexaSkill {
    public static speechOutput = {
        PLAIN_TEXT: 'PlainText',
        SSML: 'SSML'
    }

    constructor(private _appId : string, private _requestHandler: IRequestHandler) {
    }

    public execute(event: IEvent, context: IContext) {
        try {
            console.log("session applicationId: " + event.session.application.applicationId);

            // Validate that this request originated from authorized source.
            if (this._appId && event.session.application.applicationId !== this._appId) {
                console.log("The applicationIds don't match : " + event.session.application.applicationId + " and "
                    + this._appId);
                throw "Invalid applicationId";
            }

            if (!event.session.attributes) {
                event.session.attributes = {};
            }

            if (event.session.new) {
                this._requestHandler.EventHandler.onSessionStarted(event.request, event.session);
            }

            // Route the request to the proper handler which may have been overriden.
            var requestHandler: (event: IEvent, context: IContext, response: IResponse) => void = this._requestHandler[event.request.type];
            requestHandler.call(this._requestHandler, event, context, new Response(context, event.session));
        } catch (e) {
            console.log("Unexpected exception " + e);
            context.fail(e);
        }
    }
}

interface IOutputSpeech {
    type: string;
    ssml?: string;
    text?: string | ISpeech;
}

interface ICard {
    type: string;
    title: string;
    content: string;
}

interface IAlexaResponse {
    outputSpeech: IOutputSpeech,
    shouldEndSession: boolean;
    reprompt?: {
        outputSpeech: IOutputSpeech
    };
    card?: ICard;
}

interface ISpeechletResponse {
    version: string;
    response: IAlexaResponse;
    sessionAttributes?: string;
}

interface ISpeech {
    type: string;
    speech: string;
}

interface ISpeechletOptions {
    cardTitle?: string;
    cardContent?: string;
    output: ISpeech;
    reprompt?: ISpeech;
    session: ISession;
    shouldEndSession: boolean;
}

class Response {
    constructor(private _context: IContext, private _session: ISession) {
    }

    private buildSpeechletResponse(options: ISpeechletOptions): ISpeechletResponse {
        var outputSpeech: IOutputSpeech;
        if (options.output && options.output.type === 'SSML') {
            outputSpeech = {
                type: options.output.type,
                ssml: options.output.speech
            };
        } else {
            outputSpeech = {
                type: options.output.type || 'PlainText',
                text: options.output.speech || options.output
            };
        }
        var alexaResponse: IAlexaResponse = {
            outputSpeech: outputSpeech,
            shouldEndSession: options.shouldEndSession
        };
        if (options.reprompt) {
            var outputRepromptSpeech: IOutputSpeech;
            if (options.reprompt && options.reprompt.type === 'SSML') {
                outputRepromptSpeech = {
                    type: options.reprompt.type,
                    ssml: options.reprompt.speech
                }
            } else {
                outputRepromptSpeech = {
                    type: options.reprompt.type || 'PlainText',
                    text: options.reprompt.speech || options.reprompt
                }
            }
            alexaResponse.reprompt = {
                outputSpeech: outputRepromptSpeech
            };
        }
        if (options.cardTitle && options.cardContent) {
            alexaResponse.card = {
                type: "Simple",
                title: options.cardTitle,
                content: options.cardContent
            };
        }
        var returnResult: ISpeechletResponse = {
            version: '1.0',
            response: alexaResponse
        };
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }
        return returnResult;
    }

    public tell(speechOutput : ISpeech) : void {
        console.log("Speaking: " + speechOutput.speech);
        this._context.succeed(this.buildSpeechletResponse({
            session: this._session,
            output: speechOutput,
            shouldEndSession: true
        }));
    }
    public tellWithCard(speechOutput : ISpeech, cardTitle: string, cardContent: string) {
        this._context.succeed(this.buildSpeechletResponse({
            session: this._session,
            output: speechOutput,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: true
        }));
    }
    public ask(speechOutput : ISpeech, repromptSpeech: ISpeech) {
        this._context.succeed(this.buildSpeechletResponse({
            session: this._session,
            output: speechOutput,
            reprompt: repromptSpeech,
            shouldEndSession: false
        }));
    }
    public askWithCard(speechOutput: ISpeech, repromptSpeech: ISpeech, cardTitle: string, cardContent: string) {
        this._context.succeed(this.buildSpeechletResponse({
            session: this._session,
            output: speechOutput,
            reprompt: repromptSpeech,
            cardTitle: cardTitle,
            cardContent: cardContent,
            shouldEndSession: false
        }));
    }
}

