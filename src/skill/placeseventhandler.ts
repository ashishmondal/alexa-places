
import { EventHandler, IIntentHandler, ISessionStartedRequest, ISessionEndedRequest, ISession, ILaunchRequest, IResponse } from './alexaskill'
import { IPlacesSlots } from './placesslots';

export class PlacesEventHandler extends EventHandler<IPlacesSlots> {
	/**
	 *
	 */
	constructor(intentHandler: IIntentHandler<IPlacesSlots>) {
		super(intentHandler);
	}

	public onSessionStarted(sessionStartedRequest: ISessionStartedRequest, session: ISession): void {
		console.log("PlaceInformer onSessionStarted requestId: " + sessionStartedRequest.requestId
			+ ", sessionId: " + session.sessionId);
		// any initialization logic goes here
	}

	public onLaunch(launchRequest: ILaunchRequest, session: ISession, response: IResponse) {
		console.log("PlaceInformer onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
		var speechOutput = "Welcome to places, you can ask: Is Costco open now?";
		var repromptText = "You can ask: Is Costco open now?";
		response.ask(speechOutput, repromptText);
	}

	public onSessionEnded(sessionEndedRequest: ISessionEndedRequest, session: ISession) {
		console.log("PlaceInformer onSessionEnded requestId: " + sessionEndedRequest.requestId
			+ ", sessionId: " + session.sessionId);
		// any cleanup logic goes here
	}
}
