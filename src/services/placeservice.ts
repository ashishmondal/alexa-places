'use strict'
import * as Promise from 'promise';
import * as request from 'request';
import * as _  from 'lodash';
import * as http from 'http';

var ApiKey = '__API_KEY__';

var queryService = (api : string, params : any) => {
	params.key = ApiKey;
	var uri = 'https://maps.googleapis.com/maps/api/place/' + api + '/json';

	return new Promise((fulfill : any, reject: any) => {
		request({
			uri: uri,
			qs: params
		}, (err : string, response: http.IncomingMessage, body: string) => {
			if (err) {
				console.log(err);
				reject();
				return;
			}

			var result : any;
			try {
				result = JSON.parse(body);
			} catch (ex) {
				console.log(ex);
				reject();
				return;
			}

			if (result.status === 'OK') {
				fulfill(result);
			} else {
				reject(result);
			}
		});
	});
}

class PlaceService {

	public getNearbyPlace(placeName: string) {

		return new Promise((fulfill : (f: IPlace) => void, reject : (r: string) => void) => {

			queryService('nearbysearch', {
				name: placeName,
				location: '30, -90', // TODO: Get from device
				rankby: 'distance'

			}).then((result: IPlaceSearchResponse): void => {
				// Find exact match first
				var place = _.find(result.results, r => {
					return r.name.toLowerCase() === placeName;
				});

				// Start with
				if (!place) {
					place = _.find(result.results, r => {
						return _.startsWith(r.name.toLowerCase(), placeName);
					});
				}

				// first one
				if (!place) {
					place = _.first(result.results);
				}

				fulfill(place);

			}, (error : IPlaceSearchResponse) : void => {
				if (error === undefined) {
					reject('Sorry, I was not able to get the place.');
				}

				var message : string;
				switch (error.status) {
					case 'ZERO_RESULTS': message = 'Sorry, I cannot find the place nearby.';
						break;
					default: message = 'Hmmm... this was not expected.';
				}

				if (error.error_message) {
					message += error.error_message;
				}

				reject(message);
			});
		});
	}

	getPlaceDetails(placeId: string) {
		return new Promise((fulfill, reject) => {
			queryService('details', {
				placeid: placeId
			}).then((result : IPlaceSearchResponse) => {
				fulfill(result.result);
			}, (error : IPlaceSearchResponse) : void => {
				if (error === undefined) {
					reject('Sorry, I was not able to get the place details.');
				}

				var message : string;
				switch (error.status) {
					case 'ZERO_RESULTS': message = 'Sorry, I cannot find the place. The establishment may no longer in business';
						break;
					case 'UNKNOWN_ERROR': message = 'Sorry, I was not able to get the details. Please try again.'
						break;
					default: message = 'Hmmm... this was not expected.';
				}

				if (error.error_message) {
					message += error.error_message;
				}

				reject(message);

			});
		});
	}
}

var PlaceServiceInstance = new PlaceService();
export = PlaceServiceInstance;

