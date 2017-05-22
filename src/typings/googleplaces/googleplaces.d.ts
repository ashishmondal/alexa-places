interface ILocation{
	lat: number;
	lng: number;
}

interface IGeometry{
	location: ILocation;
}

interface IPlace{
	geometry: IGeometry;
	icon: string;
	id: string;
	name: string;
	place_id: string;
	vicinity: string;
}

interface IPlaceSearchResponse{
	html_attributions: any [],
	results?: IPlace[],
	result?: any,
	status: string,
	error_message: string
}

interface IAddressComponent{
	long_name: string;
	short_name: string;
	types: string[];
}

interface IDayTime{
	day: number;
	time: string;
}

interface IPeriod {
	close: IDayTime;
	open: IDayTime;
}

interface IOpeningHours{
	open_now: boolean;
	periods: IPeriod[];
}

interface IPlaceDetails extends IPlace{
	address_components: IAddressComponent[];
	adr_address: string;
	formatted_address: string;
	formatted_phone_number: string;
	opening_hours: IOpeningHours;
}