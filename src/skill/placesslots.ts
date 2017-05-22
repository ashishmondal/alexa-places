import { ISlots } from  './alexaskill'

export interface ISlot {
	value: string;
}

export interface IPlacesSlots extends ISlots {
	Place: ISlot
}