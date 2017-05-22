'use strict';
import { PlacesSkill } from './skill/placesskill'
import { IEvent, IContext } from './skill/alexaskill'

/**
 * App ID for the skill
 */
var APP_ID = 'amzn1.echo-sdk-ams.app.15ac5944-2adb-461a-bb4c-eb0c7d2cf7f3';

export function handler(event: IEvent, context: IContext): void {
	var placesSkill = new PlacesSkill(APP_ID);
	placesSkill.execute(event, context);
}
