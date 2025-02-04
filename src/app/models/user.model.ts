export interface IUser {
    email: string;
    password: string;
    profile?:{
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
    settings?:{
        radius?:number;
        calcMethod?:string;
        school?:string;
        lastLocation?:[]
    };
    role:{
        roleName: string;
        roleDescription:string;
    }
}