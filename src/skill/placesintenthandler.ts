import * as placeService from '../services/placeservice';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { IPlacesSlots } from './placesslots'
import {
AlexaSkill,
IIntent,
IIntentHandler,
IResponse,
ISession
} from './alexaskill'

export class PlacesIntentHandler implements IIntentHandler<IPlacesSlots> {
	public handlers: { [s: string]: (intent: IIntent<IPlacesSlots>, session: ISession, response: IResponse) => void } = {};
	private timeZone: string = 'US/Central';
	
	constructor() {
		// register custom intent handlers
		this.handlers['IsPlaceOpenNow'] = this.isPlaceOpenNow;
		this.handlers['HelpIntent'] = this.helpIntent;
	}

	private getTimeInWords(time : moment.Moment) {
		if (time.get('minute') === 0) {
			return time.format('h A.');
		}
		return time.format('h m A.');
	}

	private setErrorResponse(error: string, response: IResponse): void {
		response.tell({ speech: "<speak>" + error + "</speak>", type: AlexaSkill.speechOutput.SSML });
	}

	private isPlaceOpenNow(intent: IIntent<IPlacesSlots>, session: ISession, response: IResponse): void {
		var speechOutput = '';

		var placeName = intent.slots.Place.value.toLowerCase();

		console.log('Searching place ' + placeName + '...');

		placeService.getNearbyPlace(placeName)
			.then((place: IPlace) => {
				placeService.getPlaceDetails(place.place_id)
					.then((placeDetails: IPlaceDetails) => {
						var hours = placeDetails.opening_hours;

						if (!hours) {
							this.setErrorResponse('Sorry, I cannot find hours for ' + placeName, response);
							return;
						}

						var openState = hours.open_now ? 'open' : 'closed';
						speechOutput = place.name + ' at <say-as interpret-as="address">' + place.vicinity + '</say-as> is ' + openState + ' right now.';
						// Open 24hrs
						if (hours.periods.length == 1) {
							speechOutput += ' It is open 24 hours.';
						} else {
							var currentTime = moment().tz(this.timeZone);
							console.log('Today is :' + currentTime.format());
							var day = currentTime.day();
							var todaysHours = _.find(hours.periods, p => p.open.day === day);
							console.log(todaysHours);
							if (todaysHours) {
								var openTime = moment.tz(todaysHours.open.time, 'HHmm', this.timeZone);
								var closeTime = moment.tz(todaysHours.close.time, 'HHmm', this.timeZone);
								console.log(this);
								this.getTimeInWords(closeTime);
								if (hours.open_now) {
									speechOutput += ' It will close ' + closeTime.from(currentTime) + ' at ' + this.getTimeInWords(closeTime);
								} else if (currentTime.isBefore(openTime)) {
									speechOutput += ' It will open ' + openTime.from(currentTime) + ' at ' + this.getTimeInWords(openTime);
								} else {
									speechOutput += ' It closed ' + closeTime.from(currentTime) + ' at ' + this.getTimeInWords(closeTime);
								}
							} else {
								speechOutput = place.name + ' is closed today.';
							}

							if (!hours.open_now) {
								// get next open time
								var nextDayHours = _.find(hours.periods, p => p.open.day > day);

								if (!nextDayHours) {
									nextDayHours = _.first(hours.periods);
								}

								var openTime = moment.tz(nextDayHours.open.time, 'HHmm', this.timeZone);
								var dayOffset = nextDayHours.open.day;
								if (day > dayOffset) {
									dayOffset += 7;
								}

								openTime.day(dayOffset);

								speechOutput += ' It will open on ' + openTime.format('dddd') + ' at ' + this.getTimeInWords(openTime);
							}
						}

						response.tell({ speech: "<speak>" + speechOutput + "</speak>", type: AlexaSkill.speechOutput.SSML });
					}, (error: string) => {
						this.setErrorResponse(error, response);
					});
			}, (error: string) => {
				this.setErrorResponse(error, response);
			});
	}

	helpIntent(intent: IIntent<IPlacesSlots>, session: ISession, response: IResponse): void {
		//response.ask("You can say hello to me!", "You can say hello to me!");
	}
}