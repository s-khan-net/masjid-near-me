export interface IMasjid {
    _masjidId: string,
    masjidId: string,
    masjidName: string,
    masjidAddress: {
        description: string,
        street: string,
        zipcode: string,
        country: string,
        state: string,
        city: string,
        locality: string,
        phone: string,
        googlePlaceId: string,
    },
    masjidLocation: {
        type: string,
        coordinates: any[]
    },
    masjidTimings: {
        fajr: string,
        zuhr: string,
        asr: string,
        maghrib: string,
        isha: string,
        jumah: string,
    },
    masjidCreatedby: string,
    masjidModifiedby: string,
    masjidCreatedon: Date
    masjidModifiedon: Date
    masjidPic: [],
    verified: boolean,
    Distance: string,
    notMasjid: boolean,
    markerId?: any
}