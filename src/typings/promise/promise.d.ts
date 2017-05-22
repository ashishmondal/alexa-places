
declare module 'promise' {

	export = Promise;	
	class Promise<F, R>{
		constructor(callback: (fulfill : (f: F) => void, reject : (r: R) => void) => void);
		then<FT, RT>(onFulfilled: (f: FT) => void, onRejected: (r: RT) => void): Promise<F, R>;
	}
	
	module Promise{
		
	}
}