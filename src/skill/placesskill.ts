import { AlexaSkill, RequestHandler } from './alexaskill'; 
import { PlacesIntentHandler } from './placesintenthandler'
import { PlacesEventHandler } from './placeseventhandler'

export class PlacesSkill extends AlexaSkill {
	constructor(appId : string ) {
		super(appId, new RequestHandler(new PlacesEventHandler(new PlacesIntentHandler())));
	}
}
